const defaultIsPlaying = (video) => !video.paused && !video.ended;

/**
 * Lazily attaches browser-local recording Blobs to native video controls.
 * A record stays wanted only while its card is visible (or explicitly focused),
 * so stale IndexedDB reads cannot attach media to a discarded card.
 */
export function createLocalVideoLoader({
  get,
  createObjectURL = URL.createObjectURL,
  revokeObjectURL = URL.revokeObjectURL,
  maxConcurrent = 2,
  maxLiveUrls = 4,
  isPlaying = defaultIsPlaying
} = {}) {
  if (typeof get !== 'function') throw new TypeError('get must be a function');

  let generation = 0;
  let active = 0;
  let destroyed = false;
  const pending = [];
  const records = new Set();

  function notify(record, state, message = '') {
    record.onStatus?.({ state, message, id: record.id });
  }

  function removePending(record) {
    const index = pending.indexOf(record);
    if (index >= 0) pending.splice(index, 1);
    record.queued = false;
  }

  function detach(record) {
    if (!record.url) return;
    record.video.pause?.();
    record.video.removeAttribute('src');
    record.video.load?.();
    revokeObjectURL(record.url);
    record.url = null;
    notify(record, 'idle');
  }

  function queue(record) {
    if (destroyed || record.cancelled || !record.wanted || record.url || record.queued) return;
    record.queued = true;
    pending.push(record);
  }

  function evictForNextUrl() {
    const loaded = [...records]
      .filter((record) => record.url && !isPlaying(record.video))
      .sort((left, right) => left.lastUsed - right.lastUsed);
    while ([...records].filter((record) => record.url).length >= maxLiveUrls && loaded.length > 0) {
      detach(loaded.shift());
    }
    return [...records].filter((record) => record.url).length < maxLiveUrls;
  }

  function beginGet(record) {
    record.active = true;
    record.controller = new AbortController();
    const requestGeneration = generation;
    const requestEpoch = record.requestEpoch;
    active += 1;
    notify(record, 'loading', 'Preparando el clip local para los controles…');
    Promise.resolve(get(record.id, { signal: record.controller.signal }))
      .then((entry) => {
        if (destroyed || record.cancelled || !record.wanted || requestGeneration !== generation || requestEpoch !== record.requestEpoch || !records.has(record)) return;
        if (!entry?.video) {
          record.wanted = false;
          notify(record, 'missing', 'El clip ya no está disponible. Actualizá las señas guardadas.');
          return;
        }
        record.blob = entry.video;
        queue(record);
      })
      .catch((error) => {
        if (destroyed || record.cancelled || requestGeneration !== generation || requestEpoch !== record.requestEpoch || error?.name === 'AbortError') return;
        record.wanted = false;
        notify(record, 'error', error?.code === 'unavailable'
          ? 'El almacenamiento local no está disponible para cargar este clip.'
          : 'No se pudo cargar el clip local. Probá de nuevo.');
      })
      .finally(() => {
        record.active = false;
        record.controller = null;
        active -= 1;
        if (record.wanted) queue(record);
        pump();
      });
  }

  let retryScheduled = false;
  function schedulePump() {
    if (retryScheduled) return;
    retryScheduled = true;
    queueMicrotask(() => {
      retryScheduled = false;
      pump();
    });
  }

  function pump() {
    while (!destroyed && active < maxConcurrent && pending.length > 0) {
      const record = pending.shift();
      record.queued = false;
      if (record.cancelled || !record.wanted || record.url || !records.has(record)) continue;
      if (record.active) continue;
      if (record.blob) {
        if (!evictForNextUrl()) {
          queue(record);
          notify(record, 'waiting', 'Esperando que otro clip termine para liberar memoria local.');
          return;
        }
        record.url = createObjectURL(record.blob);
        record.blob = null;
        record.lastUsed = Date.now();
        record.video.src = record.url;
        record.video.load?.();
        notify(record, 'ready', 'Clip local listo para reproducir con los controles del navegador.');
        continue;
      }
      beginGet(record);
    }
  }

  function invalidateRequest(record) {
    record.requestEpoch += 1;
    record.controller?.abort();
    record.blob = null;
    removePending(record);
  }

  function discard(record) {
    record.cancelled = true;
    record.wanted = false;
    invalidateRequest(record);
    detach(record);
    records.delete(record);
  }

  return {
    register({ id, video, onStatus }) {
      const record = {
        id, video, onStatus, url: null, blob: null, queued: false,
        active: false, cancelled: false, wanted: false, controller: null,
        requestEpoch: 0, lastUsed: 0
      };
      records.add(record);
      video.addEventListener('focus', () => this.prepare(record));
      video.addEventListener('pointerdown', () => this.prepare(record), { passive: true });
      video.addEventListener('play', () => { record.lastUsed = Date.now(); });
      video.addEventListener('pause', () => {
        if (!isPlaying(record.video)) schedulePump();
      });
      video.addEventListener('ended', () => pump());
      return record;
    },
    prepare(record) {
      if (destroyed || !record || record.cancelled || !records.has(record)) return;
      record.wanted = true;
      record.lastUsed = Date.now();
      if (!record.url && !record.active) queue(record);
      pump();
    },
    release(record) {
      if (!record || record.cancelled || !records.has(record)) return;
      record.wanted = false;
      invalidateRequest(record);
      if (!isPlaying(record.video)) detach(record);
      pump();
    },
    clear() {
      generation += 1;
      for (const record of [...records]) discard(record);
      pending.length = 0;
    },
    destroy() {
      destroyed = true;
      this.clear();
    },
    get liveUrlCount() {
      return [...records].filter((record) => record.url).length;
    }
  };
}
