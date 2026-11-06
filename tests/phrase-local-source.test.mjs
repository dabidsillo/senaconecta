import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhraseLocalSourceResolver } from '../src/phrase-local-source.mjs';

const recording = (text = 'clip') => ({ video: new Blob([text]) });
const tick = () => new Promise((resolve) => queueMicrotask(resolve));

test('does not read storage until an explicit local step resolves, then returns its source', async () => {
  let getCalls = 0;
  const resolver = createPhraseLocalSourceResolver({
    get: async (id) => { getCalls += 1; return recording(id); },
    createObjectURL: () => 'blob:local-1',
    revokeObjectURL: () => {}
  });

  assert.equal(getCalls, 0);
  assert.deepEqual(await resolver.resolve('local-1'), {
    kind: 'ready', id: 'local-1', source: 'blob:local-1'
  });
  assert.equal(getCalls, 1);
  assert.equal(resolver.source, 'blob:local-1');
});

test('replaces the previous local step so only one sequence URL remains live', async () => {
  const revoked = [];
  let nextUrl = 0;
  const resolver = createPhraseLocalSourceResolver({
    get: async (id) => recording(id),
    createObjectURL: () => `blob:${nextUrl++}`,
    revokeObjectURL: (url) => revoked.push(url)
  });

  await resolver.resolve('one');
  const result = await resolver.resolve('two');

  assert.deepEqual(revoked, ['blob:0']);
  assert.deepEqual(result, { kind: 'ready', id: 'two', source: 'blob:1' });
  assert.equal(resolver.source, 'blob:1');
});

test('cancelling a pending get keeps its eventual success stale and URL-free', async () => {
  let completeGet;
  const created = [];
  const resolver = createPhraseLocalSourceResolver({
    get: () => new Promise((resolve) => { completeGet = resolve; }),
    createObjectURL: () => { created.push('blob:stale'); return 'blob:stale'; },
    revokeObjectURL: () => {}
  });

  const pending = resolver.resolve('slow');
  await tick();
  resolver.cancel();
  completeGet(recording());

  assert.deepEqual(await pending, { kind: 'stale', id: 'slow' });
  assert.deepEqual(created, []);
  assert.equal(resolver.source, null);
});

test('reports missing, storage, and URL-creation failures without mutating storage', async () => {
  const missing = createPhraseLocalSourceResolver({
    get: async () => null,
    createObjectURL: () => 'unexpected',
    revokeObjectURL: () => {}
  });
  assert.deepEqual(await missing.resolve('gone'), { kind: 'missing', id: 'gone' });

  const storageFailure = new Error('storage unavailable');
  const failingGet = createPhraseLocalSourceResolver({
    get: async () => { throw storageFailure; },
    createObjectURL: () => 'unexpected',
    revokeObjectURL: () => {}
  });
  assert.deepEqual(await failingGet.resolve('broken'), {
    kind: 'error', stage: 'get', id: 'broken', error: storageFailure
  });

  const urlFailure = new Error('URL unavailable');
  const failingUrl = createPhraseLocalSourceResolver({
    get: async () => recording(),
    createObjectURL: () => { throw urlFailure; },
    revokeObjectURL: () => {}
  });
  assert.deepEqual(await failingUrl.resolve('clip'), {
    kind: 'error', stage: 'create-url', id: 'clip', error: urlFailure
  });
});

test('a stale get error cannot replace a newer ready state', async () => {
  const requests = [];
  const resolver = createPhraseLocalSourceResolver({
    get: (id) => new Promise((resolve, reject) => requests.push({ id, resolve, reject })),
    createObjectURL: () => 'blob:fresh',
    revokeObjectURL: () => {}
  });

  const stale = resolver.resolve('old');
  await tick();
  resolver.cancel();
  const fresh = resolver.resolve('new');
  await tick();
  requests[0].reject(new Error('late failure'));
  requests[1].resolve(recording());

  assert.deepEqual(await stale, { kind: 'stale', id: 'old' });
  assert.deepEqual(await fresh, { kind: 'ready', id: 'new', source: 'blob:fresh' });
  assert.equal(resolver.source, 'blob:fresh');
});

test('reports stale URL cleanup failures without replacing a reentrant newer source', async () => {
  const cleanupError = new Error('stale URL cleanup failed');
  const revoked = [];
  let createCount = 0;
  let resolver;
  let newer;
  resolver = createPhraseLocalSourceResolver({
    get: async (id) => recording(id),
    createObjectURL: () => {
      const url = createCount++ === 0 ? 'blob:old' : 'blob:new';
      if (url === 'blob:old') newer = resolver.resolve('new');
      return url;
    },
    revokeObjectURL: (url) => {
      revoked.push(url);
      if (url === 'blob:old') throw cleanupError;
    }
  });

  const stale = await resolver.resolve('old');

  assert.deepEqual(stale, { kind: 'stale', id: 'old', cleanupError });
  assert.deepEqual(revoked, ['blob:old']);
  assert.deepEqual(await newer, { kind: 'ready', id: 'new', source: 'blob:new' });
  assert.equal(resolver.source, 'blob:new');
});

test('finish and pagehide cleanup revoke an active URL exactly once', async () => {
  const revoked = [];
  const resolver = createPhraseLocalSourceResolver({
    get: async () => recording(),
    createObjectURL: () => 'blob:active',
    revokeObjectURL: (url) => revoked.push(url)
  });

  await resolver.resolve('finish');
  resolver.reset(); // Phrase finish: caller pauses and detaches the video first.
  resolver.reset();
  await resolver.resolve('pagehide');
  resolver.dispose(); // Pagehide: caller pauses and detaches the video first.
  resolver.dispose();

  assert.deepEqual(revoked, ['blob:active', 'blob:active']);
  assert.equal(resolver.source, null);
});
