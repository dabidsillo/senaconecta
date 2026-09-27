import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTER_CATALOG,
  createLexicon,
  entriesByCategory,
  getPlayableSequence,
  lookupText,
  normalizeText,
  tokenizeText
} from '../src/catalog.mjs';

test('normalizeText ignores Spanish accents, surrounding spaces, and case', () => {
  assert.equal(normalizeText('  HÓLA, GRÁCIAS  '), 'hola, gracias');
});

test('tokenizeText returns word tokens without executable markup', () => {
  assert.deepEqual(tokenizeText('<img src=x onerror=alert(1)> Agua'), ['img', 'src', 'x', 'onerror', 'alert', '1', 'agua']);
});

test('lookupText preserves recognized token order and reports unknown tokens', () => {
  const result = lookupText('Hóla misterio AGUA familia');

  assert.deepEqual(
    result.recognized.map((item) => item.entry.label),
    ['hola', 'agua', 'familia']
  );
  assert.deepEqual(result.unknown, ['misterio']);
});

test('starter catalog does not match unverified semantic aliases', () => {
  const result = lookupText('Alúmna cuaderno bebida hogar refresco');

  assert.deepEqual(result.recognized, []);
  assert.deepEqual(result.unknown, ['alumna', 'cuaderno', 'bebida', 'hogar', 'refresco']);
});

test('starter catalog is explicitly placeholder-only with no claimed video files', () => {
  assert.ok(STARTER_CATALOG.length >= 5);
  for (const entry of STARTER_CATALOG) {
    assert.equal(entry.validationStatus, 'placeholder');
    assert.equal(entry.videoPath, null);
    assert.deepEqual(entry.aliases, []);
  }
});

test('createLexicon does not overwrite first catalog term for duplicate aliases', () => {
  const catalog = [
    { label: 'uno', aliases: ['compartido'], category: 'A' },
    { label: 'dos', aliases: ['compartido'], category: 'B' }
  ];

  assert.equal(createLexicon(catalog).get('compartido').label, 'uno');
});

test('getPlayableSequence preserves recognized order and skips missing videos', () => {
  const catalog = [
    { label: 'uno', displayLabel: 'Uno', aliases: [], category: 'A', videoPath: 'videos/uno.mp4' },
    { label: 'dos', displayLabel: 'Dos', aliases: [], category: 'A', videoPath: null },
    { label: 'tres', displayLabel: 'Tres', aliases: [], category: 'A', videoPath: 'videos/tres.mp4' }
  ];
  const result = lookupText('tres dos uno', catalog);

  assert.deepEqual(
    getPlayableSequence(result.recognized).map((item) => [item.token, item.source, item.position]),
    [
      ['tres', 'videos/tres.mp4', 1],
      ['uno', 'videos/uno.mp4', 2]
    ]
  );
});

test('entriesByCategory groups all starter entries by sorted category names', () => {
  const groups = entriesByCategory();

  assert.deepEqual(groups.map((group) => group.category), ['Escuela', 'Saludos', 'Vida diaria']);
  assert.equal(groups.reduce((count, group) => count + group.entries.length, 0), STARTER_CATALOG.length);
});
