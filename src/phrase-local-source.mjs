/**
 * Resolves one browser-local phrase recording only after the phrase player asks for it.
 *
 * Caller contract: before `resolve`, `cancel`, `reset`, or `dispose` replaces or
 * revokes a returned source, pause the video and detach its `src`. Revoking a
 * Blob URL does not delete the saved recording.
 */
export function createPhraseLocalSourceResolver({
  get,
  createObjectURL = URL.createObjectURL,
  revokeObjectURL = URL.revokeObjectURL
} = {}) {
  if (typeof get !== 'function') throw new TypeError('get must be a function');
  if (typeof createObjectURL !== 'function') throw new TypeError('createObjectURL must be a function');
  if (typeof revokeObjectURL !== 'function') throw new TypeError('revokeObjectURL must be a function');

  let epoch = 0;
  let activeUrl = null;
  let disposed = false;

  function revokeActive() {
    if (!activeUrl) return null;
    const url = activeUrl;
    activeUrl = null;
    try {
      revokeObjectURL(url);
      return null;
    } catch (error) {
      return { kind: 'error', stage: 'revoke-url', error };
    }
  }

  function invalidate() {
    epoch += 1;
    return revokeActive();
  }

  return {
    async resolve(id) {
      if (disposed) return { kind: 'disposed', id };

      const requestEpoch = epoch + 1;
      const cleanup = invalidate();
      if (cleanup) return { ...cleanup, id };

      let entry;
      try {
        entry = await Promise.resolve().then(() => get(id));
      } catch (error) {
        if (disposed || requestEpoch !== epoch) return { kind: 'stale', id };
        return { kind: 'error', stage: 'get', id, error };
      }

      if (disposed || requestEpoch !== epoch) return { kind: 'stale', id };
      if (!entry?.video) return { kind: 'missing', id };

      let source;
      try {
        source = createObjectURL(entry.video);
      } catch (error) {
        if (disposed || requestEpoch !== epoch) return { kind: 'stale', id };
        return { kind: 'error', stage: 'create-url', id, error };
      }

      if (disposed || requestEpoch !== epoch) {
        try {
          revokeObjectURL(source);
        } catch (cleanupError) {
          return { kind: 'stale', id, cleanupError };
        }
        return { kind: 'stale', id };
      }

      activeUrl = source;
      return { kind: 'ready', id, source };
    },

    cancel() {
      return invalidate() ?? { kind: 'cancelled' };
    },

    reset() {
      return invalidate() ?? { kind: 'reset' };
    },

    dispose() {
      if (disposed) return { kind: 'disposed' };
      disposed = true;
      return invalidate() ?? { kind: 'disposed' };
    },

    get source() {
      return activeUrl;
    }
  };
}
