import test from 'node:test';
import assert from 'node:assert/strict';
import { Blob } from 'node:buffer';
import { CaptureStoreError, createCaptureStore } from '../src/capture-store.mjs';

function request(result, error = null) {
  const listeners = {};
  queueMicrotask(() => {
    if (error) listeners.error?.({ target: { error } });
    else listeners.success?.({ target: { result } });
  });
  return {
    get error() { return error; },
    set onsuccess(listener) { listeners.success = listener; },
    set onerror(listener) { listeners.error = listener; }
  };
}

function createFakeIndexedDB({ openError = null, openBlocked = false, transactionError = null, transactionAbort = false } = {}) {
  const databases = new Map();
  let nextTransactionError = transactionError;
  let nextTransactionAbort = transactionAbort;
  let closeCount = 0;

  return {
    open(name, version) {
      const listeners = {};
      const db = databases.get(name) ?? createDatabase({
        takeFailure() {
          const failure = { error: nextTransactionError, abort: nextTransactionAbort };
          nextTransactionError = null;
          nextTransactionAbort = false;
          return failure;
        },
        onClose() { closeCount += 1; }
      });
      const openRequest = {
        get error() { return openError; },
        get result() { return db; },
        set onupgradeneeded(listener) { listeners.upgrade = listener; },
        set onsuccess(listener) { listeners.success = listener; },
        set onerror(listener) { listeners.error = listener; },
        set onblocked(listener) { listeners.blocked = listener; }
      };
      queueMicrotask(() => {
        if (openError) return listeners.error?.({ target: openRequest });
        if (!databases.has(name)) {
          databases.set(name, db);
          listeners.upgrade?.({ target: openRequest, oldVersion: 0, newVersion: version });
        }
        if (openBlocked) listeners.blocked?.({ target: openRequest });
        listeners.success?.({ target: openRequest });
      });
      return openRequest;
    },
    get closeCount() { return closeCount; }
  };
}

function createDatabase({ takeFailure, onClose }) {
  const stores = new Map();
  return {
    objectStoreNames: { contains: (name) => stores.has(name) },
    createObjectStore(name, { keyPath }) {
      stores.set(name, { keyPath, records: new Map() });
      return {};
    },
    close() { onClose(); },
    transaction(names) {
      const listeners = {};
      const staged = new Map(names.map((name) => [name, new Map(stores.get(name).records)]));
      const failure = takeFailure();
      let pending = 0;
      let finished = false;
      let requestError = null;

      const finish = () => {
        if (finished || pending !== 0) return;
        finished = true;
        queueMicrotask(() => {
          const error = requestError ?? failure.error;
          if (error) {
            listeners.error?.({ target: { error } });
            listeners.abort?.({ target: { error } });
          } else if (failure.abort) {
            listeners.abort?.({ target: { error: { name: 'AbortError' } } });
          } else {
            for (const [name, records] of staged) stores.get(name).records = records;
            listeners.complete?.();
          }
        });
      };
      const schedule = () => {
        pending += 1;
        queueMicrotask(() => {
          pending -= 1;
          finish();
        });
      };
      const makeStore = (name) => {
        const store = stores.get(name);
        const records = staged.get(name);
        return {
          add(value) {
            const key = value[store.keyPath];
            const duplicate = records.has(key);
            if (!duplicate) records.set(key, structuredClone(value));
            else requestError ??= { name: 'ConstraintError' };
            schedule();
            return request(undefined, duplicate ? requestError : null);
          },
          get(key) {
            const value = records.get(key);
            schedule();
            return request(value === undefined ? undefined : structuredClone(value));
          },
          getAll() {
            const values = [...records.values()].map((value) => structuredClone(value));
            schedule();
            return request(values);
          },
          delete(key) {
            records.delete(key);
            schedule();
            return request(undefined);
          }
        };
      };
      queueMicrotask(finish);
      return {
        objectStore(name) { return makeStore(name); },
        set oncomplete(listener) { listeners.complete = listener; },
        set onerror(listener) { listeners.error = listener; },
        set onabort(listener) { listeners.abort = listener; }
      };
    }
  };
}

async function assertNoUnhandledRejection(callback) {
  const rejections = [];
  const onUnhandledRejection = (reason) => rejections.push(reason);
  process.on('unhandledRejection', onUnhandledRejection);
  try {
    await callback();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(rejections, []);
  } finally {
    process.off('unhandledRejection', onUnhandledRejection);
  }
}

test('saves a Blob and frozen metadata atomically, then gets and deletes the recording', async () => {
  const store = createCaptureStore({
    indexedDB: createFakeIndexedDB(),
    idFactory: () => 'recording-1'
  });
  const video = new Blob(['clip bytes'], { type: 'video/webm' });
  const metadata = { label: 'Agua', nested: { source: 'catalog' } };

  const saved = await store.save(video, metadata);
  metadata.nested.source = 'changed-after-save';
  assert.equal(saved.id, 'recording-1');
  assert.equal(Object.isFrozen(saved.metadata), true);
  const stored = await store.get(saved.id);
  assert.equal(stored.video.type, 'video/webm');
  assert.equal(await stored.video.text(), 'clip bytes');
  assert.deepEqual(stored.metadata, {
    label: 'Agua', nested: { source: 'catalog' }
  });

  assert.equal(await store.delete(saved.id), true);
  assert.equal(await store.get(saved.id), null);
});

test('rejects a duplicate recording ID without replacing the original clip or metadata', async () => {
  const store = createCaptureStore({
    indexedDB: createFakeIndexedDB(),
    idFactory: () => 'duplicate-id'
  });

  await store.save(new Blob(['original clip']), { label: 'Original' });

  await assertNoUnhandledRejection(async () => {
    await assert.rejects(
      store.save(new Blob(['replacement clip']), { label: 'Replacement' }),
      (error) => error instanceof CaptureStoreError && error.code === 'save-failed'
    );
  });

  const stored = await store.get('duplicate-id');
  assert.equal(await stored.video.text(), 'original clip');
  assert.equal(stored.metadata.label, 'Original');
});

test('lists metadata without returning video Blobs', async () => {
  const store = createCaptureStore({
    indexedDB: createFakeIndexedDB(),
    idFactory: (() => { let number = 0; return () => `recording-${++number}`; })()
  });
  await store.save(new Blob(['first']), { label: 'Primera' });
  await store.save(new Blob(['second']), { label: 'Segunda' });

  const recordings = await store.list();
  assert.deepEqual(recordings.map(({ id, metadata }) => [id, metadata.label]).sort(), [
    ['recording-1', 'Primera'],
    ['recording-2', 'Segunda']
  ]);
  assert.equal('video' in recordings[0], false);
});

test('reports unavailable IndexedDB and open failures clearly', async () => {
  const unavailable = createCaptureStore({ indexedDB: null });
  await assert.rejects(unavailable.list(), (error) => error instanceof CaptureStoreError && error.code === 'unavailable');

  const failed = createCaptureStore({ indexedDB: createFakeIndexedDB({ openError: { name: 'InvalidStateError' } }) });
  await assert.rejects(failed.list(), (error) => error instanceof CaptureStoreError && error.code === 'open-failed');
});

test('closes a database that succeeds after a blocked open has already rejected', async () => {
  const indexedDB = createFakeIndexedDB({ openBlocked: true });
  const store = createCaptureStore({ indexedDB });

  await assert.rejects(store.list(), (error) => error instanceof CaptureStoreError && error.code === 'open-blocked');
  assert.equal(indexedDB.closeCount, 1);
});

test('rolls back both stores when a quota-limited transaction fails', async () => {
  const store = createCaptureStore({
    indexedDB: createFakeIndexedDB({ transactionError: { name: 'QuotaExceededError' } }),
    idFactory: () => 'quota-recording'
  });

  await assertNoUnhandledRejection(async () => {
    await assert.rejects(
      store.save(new Blob(['clip']), { label: 'Sin espacio' }),
      (error) => error instanceof CaptureStoreError && error.code === 'quota-exceeded'
    );
  });

  assert.equal(await store.get('quota-recording'), null);
  assert.deepEqual(await store.list(), []);
});

test('rolls back both stores when a transaction aborts', async () => {
  const store = createCaptureStore({
    indexedDB: createFakeIndexedDB({ transactionAbort: true }),
    idFactory: () => 'aborted-recording'
  });

  await assert.rejects(
    store.save(new Blob(['clip']), { label: 'Abortada' }),
    (error) => error instanceof CaptureStoreError && error.code === 'save-failed'
  );

  assert.equal(await store.get('aborted-recording'), null);
  assert.deepEqual(await store.list(), []);
});
