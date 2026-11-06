import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhraseSequencePlan } from '../src/phrase-sequence-plan.mjs';

const catalog = [
  { id: 'hola', label: 'hola', displayLabel: 'Hola', aliases: [], videoPath: 'videos/hola.webm' },
  { id: 'mama', label: 'mama', displayLabel: 'Mamá', aliases: [], videoPath: 'videos/mama.webm' }
];

function steps(plan) {
  return plan.sequence.map(({ kind, token, source, recordingId, position }) => ({
    kind, token, source, recordingId, position
  }));
}

test('uses a playable catalog video instead of a same-label local recording', () => {
  const plan = createPhraseSequencePlan('hola', [
    { id: 'local-hola', metadata: { label: 'Hola' }, createdAt: '2025-02-01' }
  ], catalog);

  assert.deepEqual(steps(plan), [{
    kind: 'catalog', token: 'hola', source: 'videos/hola.webm', recordingId: undefined, position: 1
  }]);
});

test('uses the newest valid local recording when the matching catalog placeholder has no path', () => {
  const placeholderCatalog = [{ id: 'custom', label: 'custom', aliases: [], videoPath: '   ' }];
  const plan = createPhraseSequencePlan('custom', [
    { id: 'older', metadata: { label: 'Custom' }, createdAt: '2025-01-01T00:00:00.000Z' },
    { id: 'newer', metadata: { label: 'Custom' }, createdAt: '2025-02-01T00:00:00.000Z' }
  ], placeholderCatalog);

  assert.deepEqual(steps(plan), [{
    kind: 'local', token: 'custom', source: undefined, recordingId: 'newer', position: 1
  }]);
});

test('orders duplicate local recordings by createdAt, then id, then original list order', () => {
  const plan = createPhraseSequencePlan('custom', [
    { id: 'z-last', metadata: { label: 'Custom' }, createdAt: 'invalid-date' },
    { id: 'a-first', metadata: { label: 'Custom' }, createdAt: 'invalid-date' },
    { id: 'later', metadata: { label: 'Custom' }, createdAt: '2025-02-01' },
    { id: 'earlier', metadata: { label: 'Custom' }, createdAt: '2025-01-01' }
  ], []);

  assert.equal(plan.sequence[0].recordingId, 'later');
  assert.equal('createdAt' in plan.sequence[0], false);

  const invalidOnlyPlan = createPhraseSequencePlan('custom', [
    { id: 'same', metadata: { label: 'Custom' }, createdAt: 'invalid-date' },
    { id: 'same', metadata: { label: 'Custom' }, createdAt: 'invalid-date' },
    { id: 'z-last', metadata: { label: 'Custom' }, createdAt: 'invalid-date' },
    { id: 'a-first', metadata: { label: 'Custom' }, createdAt: 'invalid-date' }
  ], []);
  assert.equal(invalidOnlyPlan.sequence[0].recordingId, 'a-first');
});

test('counts each placeholder occurrence without a playable public or local fallback', () => {
  const mixedCatalog = [
    { id: 'playable', label: 'mixed', aliases: [], videoPath: 'videos/mixed.webm' },
    { id: 'placeholder', label: 'mixed', aliases: [], videoPath: '' },
    { id: 'missing', label: 'missing', aliases: [], videoPath: '   ' }
  ];

  const plan = createPhraseSequencePlan('mixed missing missing', [], mixedCatalog);

  assert.deepEqual(steps(plan), [{
    kind: 'catalog', token: 'mixed', source: 'videos/mixed.webm', recordingId: undefined, position: 1
  }]);
  assert.equal(plan.unplayableCount, 2);
});

test('preserves repeated occurrences and recognizes custom-only multiword local phrases', () => {
  const plan = createPhraseSequencePlan('hola hola mi seña especial', [
    { id: 'phrase', metadata: { label: 'Mi seña especial' }, createdAt: '2025-01-01' }
  ], catalog);

  assert.deepEqual(steps(plan), [
    { kind: 'catalog', token: 'hola', source: 'videos/hola.webm', recordingId: undefined, position: 1 },
    { kind: 'catalog', token: 'hola', source: 'videos/hola.webm', recordingId: undefined, position: 2 },
    { kind: 'local', token: 'mi sena especial', source: undefined, recordingId: 'phrase', position: 3 }
  ]);
});

test('uses longest local phrases before public words and retains unknown tokens without media access', () => {
  const plan = createPhraseSequencePlan('hola mama misterio', [
    { id: 'local-phrase', metadata: { label: 'Hola mamá', media: new Blob(['private']) }, createdAt: '2025-01-01' }
  ], catalog);

  assert.deepEqual(steps(plan), [{
    kind: 'local', token: 'hola mama', source: undefined, recordingId: 'local-phrase', position: 1
  }]);
  assert.deepEqual(plan.unknown, ['misterio']);
  assert.equal(JSON.stringify(plan).includes('private'), false);
});
