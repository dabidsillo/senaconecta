import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhrasePlaybackSession } from '../src/phrase-playback.mjs';

test('does not start an empty phrase sequence', () => {
  const session = createPhrasePlaybackSession();
  session.reset(0);

  assert.equal(session.start().kind, 'empty');
  assert.deepEqual(session.state, { length: 0, index: 0, running: false, finished: false, runId: 1 });
});

test('finishes a one-video phrase without looping and replays from its first video', () => {
  const session = createPhrasePlaybackSession();
  session.reset(1);
  const first = session.start();

  assert.deepEqual(first.request.index, 0);
  assert.equal(session.ended().kind, 'finished');
  assert.equal(session.state.finished, true);
  assert.equal(session.ended().kind, 'ignored');

  const replay = session.start();
  assert.equal(replay.kind, 'restarted');
  assert.equal(replay.request.index, 0);
});

test('advances a phrase in lookup order and stops after the last video', () => {
  const session = createPhrasePlaybackSession();
  session.reset(3);
  const played = [session.start().request.index];

  played.push(session.ended().request.index);
  played.push(session.ended().request.index);

  assert.deepEqual(played, [0, 1, 2]);
  assert.equal(session.ended().kind, 'finished');
  assert.equal(session.state.index, 2);
  assert.equal(session.state.running, false);
  assert.equal(session.state.finished, true);
});

test('ignores stale rejections and stops only the current rejected continuation', () => {
  const session = createPhrasePlaybackSession();
  session.reset(2);
  const first = session.start().request;
  const second = session.ended().request;

  assert.equal(session.rejectPlay(first).kind, 'stale');
  assert.equal(session.state.running, true);
  assert.equal(session.rejectPlay(second).kind, 'blocked');
  assert.equal(session.state.running, false);
});

test('manual selection and pause stop automatic advancement', () => {
  const session = createPhrasePlaybackSession();
  session.reset(2);
  session.start();

  assert.equal(session.select(1).kind, 'selected');
  assert.equal(session.ended().kind, 'ignored');
  session.start();
  assert.equal(session.pause().kind, 'stopped');
  assert.equal(session.ended().kind, 'ignored');
});
