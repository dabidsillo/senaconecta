import test from 'node:test';
import assert from 'node:assert/strict';
import { revealAndPlaySavedPreview } from '../src/saved-playback.mjs';

function createVideo(play) {
  const calls = [];
  return {
    calls,
    scrollIntoView(options) { calls.push(['scrollIntoView', options]); },
    focus(options) { calls.push(['focus', options]); },
    play
  };
}

test('reveals, centers, focuses, and plays a saved preview', async () => {
  const video = createVideo(() => Promise.resolve());

  const result = await revealAndPlaySavedPreview(video);

  assert.deepEqual(result, { outcome: 'playing' });
  assert.deepEqual(video.calls, [
    ['scrollIntoView', { block: 'center' }],
    ['focus', { preventScroll: true }]
  ]);
});

test('reports autoplay blocks while preserving native controls for manual playback', async () => {
  const video = createVideo(() => Promise.reject({ name: 'NotAllowedError' }));

  const result = await revealAndPlaySavedPreview(video);

  assert.deepEqual(result, { outcome: 'blocked' });
});

test('reports unsupported saved-video formats', async () => {
  const video = createVideo(() => Promise.reject({ name: 'NotSupportedError' }));

  const result = await revealAndPlaySavedPreview(video);

  assert.deepEqual(result, { outcome: 'unsupported' });
});

test('reports other playback rejections without throwing', async () => {
  const video = createVideo(() => Promise.reject(new Error('decoder unavailable')));

  const result = await revealAndPlaySavedPreview(video);

  assert.deepEqual(result, { outcome: 'failed' });
});

test('does not report playback success when no play method exists', async () => {
  const result = await revealAndPlaySavedPreview(createVideo(undefined));
  assert.deepEqual(result, { outcome: 'failed' });
});
