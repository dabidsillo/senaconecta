const DATABASE_VERSION = 1;
const RECORDINGS_STORE = 'recordings';
const METADATA_STORE = 'metadata';

export class CaptureStoreError extends Error {
  constructor(code, message, cause) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'CaptureStoreError';
    this.code = code;
  }
}

function errorFor(operation, error) {
  if (error instanceof CaptureStoreError) return error;
  if (error?.name === 'QuotaExceededError') {
    return new CaptureStoreError('quota-exceeded', 'There is not enough browser storage space to save this recording.', error);
  }
  return new CaptureStoreError(`${operation}-failed`, `The browser could not ${operation} the local recordings.`, error);
}

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function copyMetadata(metadata) {
  try {
    return freeze(structuredClone(metadata));
  } catch (error) {
    throw new CaptureStoreError('invalid-metadata', 'Recording metadata must be safely copyable before it can be saved.', error);
  }
}

function generateId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `capture-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function requestResult(request, operation) {
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(errorFor(operation, event.target.error ?? request.error));
  });
}

function transactionComplete(transaction, operation) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = (event) => reject(errorFor(operation, event.target.error ?? transaction.error));
    transaction.onabort = (event) => reject(errorFor(operation, event.target.error ?? transaction.error));
  });
}

/**
 * Creates browser-local recording persistence. `list()` reads only metadata, so
 * a recording Blob is read only when `get(id)` is requested for playback.
 */
export function createCaptureStore({
  indexedDB = globalThis.indexedDB,
  databaseName = 'tinku-capture-store',
  idFactory = generateId
} = {}) {
  async function openDatabase() {
    if (!indexedDB || typeof indexedDB.open !== 'function') {
      throw new CaptureStoreError('unavailable', 'This browser does not support local recording storage.');
    }

    let request;
    try {
      request = indexedDB.open(databaseName, DATABASE_VERSION);
    } catch (error) {
      throw errorFor('open', error);
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const rejectOnce = (error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(RECORDINGS_STORE)) {
          database.createObjectStore(RECORDINGS_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(METADATA_STORE)) {
          database.createObjectStore(METADATA_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        if (settled) {
          database.close();
          return;
        }
        settled = true;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => rejectOnce(errorFor('open', request.error));
      request.onblocked = () => rejectOnce(new CaptureStoreError('open-blocked', 'Local recording storage is blocked by another open browser tab.'));
    });
  }

  async function run(operation, storeNames, mode, action) {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(storeNames, mode);
      const completion = transactionComplete(transaction, operation);
      let result;
      let actionError;

      try {
        result = await action(transaction, operation);
      } catch (error) {
        actionError = error;
      }

      try {
        await completion;
      } catch (completionError) {
        if (!actionError) throw completionError;
      }

      if (actionError) throw actionError;
      return result;
    } catch (error) {
      throw errorFor(operation, error);
    } finally {
      database.close();
    }
  }

  return Object.freeze({
    async save(video, metadata) {
      if (!video || typeof video.size !== 'number' || typeof video.slice !== 'function') {
        throw new CaptureStoreError('invalid-video', 'A video Blob is required to save a recording.');
      }
      const id = String(idFactory());
      if (!id) throw new CaptureStoreError('invalid-id', 'The recording could not be assigned a local ID.');
      const savedMetadata = copyMetadata(metadata);
      const createdAt = new Date().toISOString();

      return run('save', [RECORDINGS_STORE, METADATA_STORE], 'readwrite', async (transaction, operation) => {
        const recordings = transaction.objectStore(RECORDINGS_STORE);
        const metadataStore = transaction.objectStore(METADATA_STORE);
        await Promise.all([
          requestResult(recordings.add({ id, video }), operation),
          requestResult(metadataStore.add({ id, metadata: savedMetadata, createdAt }), operation)
        ]);
        return freeze({ id, metadata: savedMetadata, createdAt });
      });
    },

    async list() {
      return run('list', [METADATA_STORE], 'readonly', async (transaction, operation) => {
        const entries = await requestResult(transaction.objectStore(METADATA_STORE).getAll(), operation);
        return entries
          .map(({ id, metadata, createdAt }) => freeze({ id, metadata: freeze(metadata), createdAt }))
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      });
    },

    async get(id) {
      return run('get', [RECORDINGS_STORE, METADATA_STORE], 'readonly', async (transaction, operation) => {
        const [recording, metadata] = await Promise.all([
          requestResult(transaction.objectStore(RECORDINGS_STORE).get(id), operation),
          requestResult(transaction.objectStore(METADATA_STORE).get(id), operation)
        ]);
        if (!recording || !metadata) return null;
        return freeze({ id: recording.id, video: recording.video, metadata: freeze(metadata.metadata), createdAt: metadata.createdAt });
      });
    },

    async delete(id) {
      return run('delete', [RECORDINGS_STORE, METADATA_STORE], 'readwrite', async (transaction, operation) => {
        const recordings = transaction.objectStore(RECORDINGS_STORE);
        const metadataStore = transaction.objectStore(METADATA_STORE);
        const existing = requestResult(metadataStore.get(id), operation);
        const deletions = Promise.all([
          requestResult(recordings.delete(id), operation),
          requestResult(metadataStore.delete(id), operation)
        ]);
        const [metadata] = await Promise.all([existing, deletions]);
        return Boolean(metadata);
      });
    }
  });
}
