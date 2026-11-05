import test from 'node:test';
import assert from 'node:assert/strict';
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
  SALUDOS: 'Saludos',
  FAMILIA: 'Familia',
  ALIMENTOS: 'Alimentos',
  LUGARES: 'Lugares',
  COLORES: 'Colores',
  ANIMALES: 'Animales',
  'DEPARTAMENTOS DE BOLIVIA': 'Departamentos de Bolivia',
  NATURALEZA: 'Naturaleza',
  'MEDIOS DE TRANSPORTE': 'Medios de transporte',
  VERDURAS: 'Verduras',
  FRUTAS: 'Frutas',
  VERBOS: 'Verbos',
  PRONOMBRES: 'Pronombres',
  NÚMEROS: 'Números',
  'DÍAS DE LA SEMANA': 'Días de la semana'
};

const EXPECTED_INVENTORY = {
  SALUDOS: ['Hola', 'Chau', 'Buenos días', 'Buenas tardes', 'Buenas noches', 'Gracias', 'Por favor', '¿Cómo estás?', 'Estoy bien', 'Mal', 'Más o menos', 'Sí', 'No', 'Lo siento', 'Te amo'],
  FAMILIA: ['Papá', 'Mamá', 'Bebé', 'Abuelo', 'Abuela', 'Hijo', 'Hija', 'Hermano', 'Hermana'],
  ALIMENTOS: ['Pan', 'Leche', 'Carne', 'Fideo', 'Queso', 'Arroz', 'Sal', 'Aceite', 'Café', 'Azúcar', 'Té'],
  LUGARES: ['Casa', 'Cuarto', 'Baño', 'Escuela', 'Hospital', 'Iglesia', 'Farmacia', 'Mercado'],
  COLORES: ['Rojo', 'Amarilla', 'Azul', 'Verde'],
  ANIMALES: ['Perro', 'Gato', 'Vaca', 'Cóndor', 'Gallina'],
  'DEPARTAMENTOS DE BOLIVIA': ['Santa Cruz', 'La Paz', 'Cochabamba', 'Oruro', 'Tarija', 'Beni', 'Chuquisaca', 'Potosí', 'Pando'],
  NATURALEZA: ['Frío', 'Calor', 'Sol', 'Lluvia'],
  'MEDIOS DE TRANSPORTE': ['Auto', 'Flota', 'Micro', 'Trufi', 'Motocicleta'],
  VERDURAS: ['Tomate', 'Cebolla', 'Zanahoria', 'Papa'],
  FRUTAS: ['Manzana', 'Naranja', 'Uva', 'Plátano', 'Guineo', 'Piña'],
  VERBOS: ['Cocinar', 'Comprar', 'Vender', 'Aprender', 'Comer', 'Dibujar', 'Dormir', 'Ayudar'],
  PRONOMBRES: ['Yo', 'Tú', 'Nosotros', 'Él', 'Ella', 'Nuestro'],
  NÚMEROS: ['Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'],
  'DÍAS DE LA SEMANA': ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
};

test('normalizeText ignores Spanish accents, surrounding spaces, and case', () => {
  assert.equal(normalizeText('  HÓLA, GRÁCIAS  '), 'hola, gracias');
});

test('tokenizeText returns word tokens without executable markup', () => {
  assert.deepEqual(tokenizeText('<img src=x onerror=alert(1)> Agua'), ['img', 'src', 'x', 'onerror', 'alert', '1', 'agua']);
});

test('catalog contains the exact 112 supplied entries in the 15 supplied categories', () => {
  assert.equal(CATALOG_VERSION, 'final-vocabulary-v2');
  assert.equal(STARTER_CATALOG.length, 112);
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

test('catalog retains user-provided spelling and placeholder media status without aliases', () => {
  for (const entry of STARTER_CATALOG) {
    assert.equal(entry.validationStatus, 'placeholder');
    assert.equal(entry.videoPath, null);
    assert.deepEqual(entry.aliases, []);
    assert.doesNotMatch(entry.description, /ilustrativ/i);
  }

  assert.deepEqual(
    STARTER_CATALOG.filter((entry) => ['Papá', 'Papa', 'Sí', 'Tú', 'Él', 'Café', 'Té', 'Amarilla', 'Guineo', 'Flota', 'Trufi', 'Nuestro'].includes(entry.displayLabel))
      .map((entry) => entry.displayLabel),
    ['Sí', 'Papá', 'Café', 'Té', 'Amarilla', 'Flota', 'Trufi', 'Papa', 'Guineo', 'Tú', 'Él', 'Nuestro']
  );
});

test('lookupText recognizes longest multiword phrases in order and leaves only unmatched tokens unknown', () => {
  const result = lookupText('¿Cómo estás? Más o menos Santa Cruz La Paz Por favor misterio');

  assert.deepEqual(
    result.recognized.map((item) => [item.token, item.entry.displayLabel]),
    [
      ['como estas', '¿Cómo estás?'],
      ['mas o menos', 'Más o menos'],
      ['santa cruz', 'Santa Cruz'],
      ['la paz', 'La Paz'],
      ['por favor', 'Por favor']
    ]
  );
  assert.deepEqual(result.unknown, ['misterio']);
});

test('lookupText returns both family Papá and vegetable Papa for their shared lexical form', () => {
  const result = lookupText('papa');

  assert.deepEqual(result.recognized.map((item) => [item.entry.category, item.entry.displayLabel]), [
    ['FAMILIA', 'Papá'],
    ['VERDURAS', 'Papa']
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
