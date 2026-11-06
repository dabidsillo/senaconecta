export function createPhrasePlaybackSession() {
  let length = 0;
  let index = 0;
  let running = false;
  let finished = false;
  let runId = 0;

  function snapshot() {
    return { length, index, running, finished, runId };
  }

  function stop() {
    if (!running) return { kind: 'idle', state: snapshot() };
    running = false;
    runId += 1;
    return { kind: 'stopped', state: snapshot() };
  }

  return {
    reset(nextLength) {
      length = Math.max(0, Number(nextLength) || 0);
      index = 0;
      running = false;
      finished = false;
      runId += 1;
      return { kind: length > 0 ? 'ready' : 'empty', state: snapshot() };
    },

    start() {
      if (length === 0) return { kind: 'empty', state: snapshot() };
      const restarted = finished;
      if (restarted) index = 0;
      running = true;
      finished = false;
      runId += 1;
      return { kind: restarted ? 'restarted' : 'started', request: { index, runId }, state: snapshot() };
    },

    select(nextIndex) {
      if (length === 0) return { kind: 'empty', state: snapshot() };
      index = Math.min(Math.max(0, nextIndex), length - 1);
      running = false;
      finished = false;
      runId += 1;
      return { kind: 'selected', state: snapshot() };
    },

    pause() {
      return stop();
    },

    error() {
      return stop();
    },

    ended() {
      if (!running) return { kind: 'ignored', state: snapshot() };
      if (index >= length - 1) {
        running = false;
        finished = true;
        runId += 1;
        return { kind: 'finished', state: snapshot() };
      }

      index += 1;
      runId += 1;
      return { kind: 'next', request: { index, runId }, state: snapshot() };
    },

    isCurrentRequest(request) {
      return Boolean(request) && running && request.runId === runId && request.index === index;
    },

    rejectPlay(request) {
      if (!request || !running || request.runId !== runId || request.index !== index) {
        return { kind: 'stale', state: snapshot() };
      }
      running = false;
      runId += 1;
      return { kind: 'blocked', state: snapshot() };
    },

    get state() {
      return snapshot();
    }
  };
}
