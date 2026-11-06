import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalVideoLoader } from '../src/local-video-loader.mjs';

function video() {
  const target = new EventTarget();
  target.paused = true;
  target.ended = false;
  target.pause = () => { target.paused = true; };
  target.removeAttribute = () => { target.src = ''; };
  target.load = () => {};
  return target;
}

const tick = () => new Promise((resolve) => setImmediate(resolve));
const settle = async (count = 6) => { for (let index = 0; index < count; index += 1) await tick(); };

test('does not resurrect a URL after its rendered local result is cleared', async () => {
  let resolveGet;
  const created = [];
  const loader = createLocalVideoLoader({
    get: () => new Promise((resolve) => { resolveGet = resolve; }),
    createObjectURL: () => { const url = `blob:${created.length}`; created.push(url); return url; },
    revokeObjectURL: () => {}
  });
  const record = loader.register({ id: 'saved-1', video: video() });

  loader.prepare(record);
  loader.clear();
  resolveGet({ video: new Blob(['clip']) });
  await tick();

  assert.deepEqual(created, []);
  assert.equal(loader.liveUrlCount, 0);
});

test('retains an ended visible video URL for native replay without another get', async () => {
  let getCalls = 0;
  const nativeVideo = video();
  const loader = createLocalVideoLoader({
    get: async () => { getCalls += 1; return { video: new Blob(['clip']) }; },
    createObjectURL: () => 'blob:replay',
    revokeObjectURL: () => {}
  });
  const record = loader.register({ id: 'replay', video: nativeVideo });

  loader.prepare(record);
  await settle();
  nativeVideo.ended = true;
  nativeVideo.dispatchEvent(new Event('ended'));
  nativeVideo.dispatchEvent(new Event('play'));

  assert.equal(nativeVideo.src, 'blob:replay');
  assert.equal(getCalls, 1);
});

test('retries a queued fifth request when one of four native videos pauses', async () => {
  let nextUrl = 0;
  const videos = Array.from({ length: 5 }, video);
  const loader = createLocalVideoLoader({
    get: async (id) => ({ video: new Blob([id]) }),
    createObjectURL: () => `blob:${nextUrl++}`,
    revokeObjectURL: () => {},
    maxConcurrent: 2,
    maxLiveUrls: 4
  });
  const records = videos.map((item, index) => loader.register({ id: `clip-${index}`, video: item }));

  for (const record of records.slice(0, 4)) loader.prepare(record);
  await settle();
  for (const item of videos.slice(0, 4)) item.paused = false;
  loader.prepare(records[4]);
  await settle();
  assert.equal(videos[4].src, undefined);

  videos[0].paused = true;
  videos[0].dispatchEvent(new Event('pause'));
  await settle();

  assert.equal(videos[4].src, 'blob:4');
  assert.equal(loader.liveUrlCount, 4);
});

test('cancels an offscreen pending get and permits a later visible reprepare', async () => {
  const resolvers = [];
  const created = [];
  const loader = createLocalVideoLoader({
    get: () => new Promise((resolve) => resolvers.push(resolve)),
    createObjectURL: () => { const url = `blob:${created.length}`; created.push(url); return url; },
    revokeObjectURL: () => {}
  });
  const record = loader.register({ id: 'returning', video: video() });

  loader.prepare(record);
  loader.release(record);
  loader.prepare(record);
  resolvers[0]({ video: new Blob(['stale']) });
  await settle();
  assert.equal(created.length, 0);
  assert.equal(resolvers.length, 2);

  resolvers[1]({ video: new Blob(['fresh']) });
  await settle();
  assert.deepEqual(created, ['blob:0']);
  assert.equal(record.video.src, 'blob:0');
});

test('bounds live URLs and pauses/removes a released source before revocation', async () => {
  const revoked = [];
  const firstVideo = video();
  const loader = createLocalVideoLoader({
    get: async (id) => ({ video: new Blob([id]) }),
    createObjectURL: (blob) => `blob:${blob.size}`,
    revokeObjectURL: (url) => revoked.push(url),
    maxLiveUrls: 1
  });
  const first = loader.register({ id: 'one', video: firstVideo });
  const second = loader.register({ id: 'two', video: video() });

  loader.prepare(first);
  await tick();
  loader.release(first);
  loader.prepare(second);
  await tick();

  assert.equal(firstVideo.src, '');
  assert.deepEqual(revoked, ['blob:3']);
  assert.equal(loader.liveUrlCount, 1);
});
