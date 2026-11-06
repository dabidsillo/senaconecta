import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_CATALOG } from '../src/catalog.mjs';
import { lookupWithLocalRecordings } from '../src/local-recordings-search.mjs';

test('recognizes normalized local labels and reconciles unknown tokens around phrases', () => {
  const result = lookupWithLocalRecordings('HÓLA mi SEÑA especial misterio', [
    { id: 'clip-1', metadata: { label: 'Mi seña especial' }, createdAt: '2025-01-02T03:04:05.000Z' }
  ]);

  assert.deepEqual(
    result.curatedRecognized.map((item) => [item.token, item.entry.displayLabel]),
    [['hola', 'Hola']]
  );
  assert.deepEqual(result.localRecognized, [{
    token: 'mi sena especial',
    id: 'clip-1',
    label: 'Mi seña especial',
    createdAt: '2025-01-02T03:04:05.000Z'
  }]);
  assert.deepEqual(result.unknown, ['misterio']);
});

test('keeps catalog recognition before local recognition when normalized labels collide', () => {
  const result = lookupWithLocalRecordings('CAFÉ', [
    { id: 'clip-cafe', metadata: { label: 'cafe' }, createdAt: 123 }
  ]);

  assert.deepEqual(
    result.curatedRecognized.map((item) => [item.token, item.entry.displayLabel]),
    [['cafe', 'Café']]
  );
  assert.deepEqual(result.localRecognized, [{
    token: 'cafe',
    id: 'clip-cafe',
    label: 'cafe',
    createdAt: 123
  }]);
  assert.deepEqual(result.unknown, []);
});

test('recognizes punctuation-normalized local phrases without leaving phrase tokens unknown', () => {
  const result = lookupWithLocalRecordings('mi seña especial', [
    { id: 'punctuated-phrase', metadata: { label: 'Mi, seña-especial!' } }
  ]);

  assert.deepEqual(result.localRecognized, [{
    token: 'mi sena especial',
    id: 'punctuated-phrase',
    label: 'Mi, seña-especial!',
    createdAt: undefined
  }]);
  assert.deepEqual(result.unknown, []);
});

test('rejects local entries whose ids or labels are not nonempty strings', () => {
  const result = lookupWithLocalRecordings('id objeto etiqueta objeto etiqueta numero etiqueta booleana', [
    { id: {}, metadata: { label: 'id objeto' } },
    { id: 'object-label', metadata: { label: {} } },
    { id: 123, metadata: { label: 'etiqueta numero' } },
    { id: 'boolean-label', metadata: { label: true } }
  ]);

  assert.deepEqual(result.localRecognized, []);
  assert.deepEqual(result.unknown, [
    'id', 'objeto', 'etiqueta', 'objeto', 'etiqueta', 'numero', 'etiqueta', 'booleana'
  ]);
});

test('preserves metadata list order for multiple recordings with the same label', () => {
  const result = lookupWithLocalRecordings('saludo', [
    { id: 'second', metadata: { label: 'Saludo' }, createdAt: '2025-02-02' },
    { id: 'first', metadata: { label: 'saludo' }, createdAt: '2025-01-01' }
  ]);

  assert.deepEqual(result.localRecognized, [
    { token: 'saludo', id: 'second', label: 'Saludo', createdAt: '2025-02-02' },
    { token: 'saludo', id: 'first', label: 'saludo', createdAt: '2025-01-01' }
  ]);
});

test('ignores unavailable metadata and does not expose media or mutate the public catalog', () => {
  const catalogSnapshot = structuredClone(STARTER_CATALOG);
  const result = lookupWithLocalRecordings('secreta hola', [
    null,
    { id: '', metadata: { label: 'Secreta' }, createdAt: '2025-01-01' },
    { id: 'missing-label', metadata: {}, createdAt: '2025-01-01' },
    { id: 'blank-label', metadata: { label: '  ' }, createdAt: '2025-01-01' },
    { id: 'metadata-only', metadata: { label: 'Secreta', video: new Blob(['private']) }, createdAt: '2025-01-01' }
  ]);

  assert.deepEqual(result.localRecognized, [{
    token: 'secreta',
    id: 'metadata-only',
    label: 'Secreta',
    createdAt: '2025-01-01'
  }]);
  assert.deepEqual(result.unknown, []);
  assert.deepEqual(result.curatedRecognized.map((item) => item.entry.displayLabel), ['Hola']);
  assert.deepEqual(STARTER_CATALOG, catalogSnapshot);
  assert.equal(JSON.stringify(result).includes('private'), false);
  assert.equal(Object.values(result.localRecognized[0]).some((value) => value instanceof Blob), false);
});
