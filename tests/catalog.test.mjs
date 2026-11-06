import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  CATALOG_VERSION,
  STARTER_CATALOG,
  createLexicon,
  entriesByCategory,
  formatCategoryLabel,
  getPlayableSequence,
  lookupText,
  normalizeText,
  tokenizeText
} from '../src/catalog.mjs';

const EXPECTED_CATEGORY_LABELS = {
  ALIMENTOS: 'Alimentos',
  ANIMALES: 'Animales',
  COLORES: 'Colores',
  DEPARTAMENTOS: 'Departamentos',
  'DÍAS DE LA SEMANA': 'Días de la semana',
  FAMILIA: 'Familia',
  FRUTAS: 'Frutas',
  LUGARES: 'Lugares',
  SALUDOS: 'Saludos'
};

const EXPECTED_INVENTORY = {
  ALIMENTOS: ['Arroz', 'Café', 'Fideo', 'Leche', 'Pan'],
  ANIMALES: ['Cóndor', 'Gallina', 'Gato', 'Perro', 'Vaca'],
  COLORES: ['Amarillo', 'Azul', 'Rojo', 'Verde'],
  DEPARTAMENTOS: ['Beni', 'La Paz', 'Oruro', 'Potosí', 'Santa Cruz'],
  'DÍAS DE LA SEMANA': ['Jueves', 'Lunes', 'Martes', 'Miércoles', 'Viernes'],
  FAMILIA: ['Bebé', 'Hija', 'Hijo', 'Mamá', 'Papá'],
  FRUTAS: ['Guineo', 'Manzana', 'Naranja', 'Piña', 'Plátano'],
  LUGARES: ['Baño', 'Casa', 'Escuela', 'Hospital', 'Mercado'],
  SALUDOS: ['Chau', 'Gracias', 'Hola', 'Lo siento', 'Por favor', 'Te amo']
};

test('normalizeText ignores Spanish accents, surrounding spaces, and case', () => {
  assert.equal(normalizeText('  HÓLA, GRÁCIAS  '), 'hola, gracias');
});

test('tokenizeText returns word tokens without executable markup', () => {
  assert.deepEqual(tokenizeText('<img src=x onerror=alert(1)> Agua'), ['img', 'src', 'x', 'onerror', 'alert', '1', 'agua']);
});

test('catalog contains the exact 45 supplied entries in the 9 supplied categories', () => {
  assert.equal(CATALOG_VERSION, 'final-vocabulary-v3');
  assert.equal(STARTER_CATALOG.length, 45);
  assert.deepEqual(
    Object.fromEntries(Object.entries(EXPECTED_INVENTORY).map(([category]) => [
      category,
      STARTER_CATALOG.filter((entry) => entry.category === category).map((entry) => entry.displayLabel)
    ])),
    EXPECTED_INVENTORY
  );
  assert.equal(new Set(STARTER_CATALOG.map((entry) => entry.id)).size, STARTER_CATALOG.length);
});

test('formatCategoryLabel displays all canonical categories without changing catalog values', () => {
  assert.deepEqual(
    Object.fromEntries(Object.keys(EXPECTED_CATEGORY_LABELS).map((category) => [category, formatCategoryLabel(category)])),
    EXPECTED_CATEGORY_LABELS
  );
  assert.deepEqual(
    [...new Set(STARTER_CATALOG.map((entry) => entry.category))].sort((a, b) => a.localeCompare(b, 'es')),
    Object.keys(EXPECTED_CATEGORY_LABELS).sort((a, b) => a.localeCompare(b, 'es'))
  );
});

test('catalog retains user-provided spelling and owner-attested video status without aliases', () => {
  for (const entry of STARTER_CATALOG) {
    assert.equal(entry.validationStatus, 'owner-attested-review');
    assert.equal(entry.videoPath, `./assets/catalog/${entry.id}.webm`);
    assert.deepEqual(entry.aliases, []);
    assert.match(entry.description, /declarad[ao]s por la persona propietaria/i);
    assert.match(entry.description, /no constituyen una verificación lingüística independiente/i);
  }

  assert.deepEqual(
    STARTER_CATALOG.filter((entry) => ['Papá', 'Mamá', 'Café', 'Cóndor', 'Potosí', 'Piña', 'Plátano', 'Baño'].includes(entry.displayLabel))
      .map((entry) => entry.displayLabel),
    ['Café', 'Cóndor', 'Potosí', 'Mamá', 'Papá', 'Piña', 'Plátano', 'Baño']
  );
});

test('catalog video paths map one-to-one to the 45 public flat WebM assets', async () => {
  const assetDirectory = fileURLToPath(new URL('../assets/catalog/', import.meta.url));
  const assets = await readdir(assetDirectory, { withFileTypes: true });
  const assetNames = assets.map((asset) => asset.name).sort();
  const expectedAssetNames = STARTER_CATALOG.map((entry) => `${entry.id}.webm`).sort();

  assert.equal(STARTER_CATALOG.length, 45);
  assert.equal(new Set(STARTER_CATALOG.map((entry) => entry.category)).size, 9);
  assert.deepEqual(assetNames, expectedAssetNames);
  assert.equal(new Set(assetNames).size, 45);
  assert.ok(assets.every((asset) => asset.isFile() && !asset.isSymbolicLink()));
  assert.ok(assetNames.every((name) => /^[a-z0-9-]+\.webm$/.test(name)));
  assert.ok(assetNames.every((name) => !name.endsWith('.json')));
});

test('lookupText recognizes current multiword phrases in order and leaves only unmatched tokens unknown', () => {
  const result = lookupText('Hola mamá Lo siento papá Por favor amigo Santa Cruz La Paz misterio');

  assert.deepEqual(
    result.recognized.map((item) => [item.token, item.entry.displayLabel]),
    [
      ['hola', 'Hola'],
      ['mama', 'Mamá'],
      ['lo siento', 'Lo siento'],
      ['papa', 'Papá'],
      ['por favor', 'Por favor'],
      ['santa cruz', 'Santa Cruz'],
      ['la paz', 'La Paz']
    ]
  );
  assert.deepEqual(result.unknown, ['amigo', 'misterio']);
});

test('lookupText exposes occurrence boundaries without changing recognized output', () => {
  const result = lookupText('hola hola lo siento');

  assert.deepEqual(result.matches.map((match) => [match.token, match.length, match.entries.map((entry) => entry.displayLabel)]), [
    ['hola', 1, ['Hola']],
    ['hola', 1, ['Hola']],
    ['lo siento', 2, ['Lo siento']]
  ]);
  assert.deepEqual(result.recognized.map((item) => item.entry.displayLabel), ['Hola', 'Hola', 'Lo siento']);
});

test('lookupText resolves Papá uniquely after removing the Papa vegetable', () => {
  const result = lookupText('papa');

  assert.deepEqual(result.recognized.map((item) => [item.entry.category, item.entry.displayLabel]), [
    ['FAMILIA', 'Papá']
  ]);
  assert.deepEqual(result.unknown, []);
});

test('catalog does not match unverified semantic aliases', () => {
  const result = lookupText('Alúmna cuaderno bebida hogar refresco');

  assert.deepEqual(result.recognized, []);
  assert.deepEqual(result.unknown, ['alumna', 'cuaderno', 'bebida', 'hogar', 'refresco']);
});

test('createLexicon preserves first catalog entry for a duplicate lexical term', () => {
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

test('entriesByCategory groups all catalog entries by sorted category names', () => {
  const groups = entriesByCategory();

  assert.deepEqual(groups.map((group) => group.category), [...Object.keys(EXPECTED_INVENTORY)].sort((a, b) => a.localeCompare(b, 'es')));
  assert.equal(groups.reduce((count, group) => count + group.entries.length, 0), STARTER_CATALOG.length);
});
