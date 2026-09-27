export const CATALOG_VERSION = 'starter-placeholder-v1';

export const STARTER_CATALOG = Object.freeze([
  Object.freeze({
    id: 'greeting-hello',
    label: 'hola',
    displayLabel: 'Hola',
    category: 'Saludos',
    aliases: Object.freeze([]),
    description: 'Etiqueta de vocabulario inicial pendiente de validación por creadoras LSB.',
    videoPath: null,
    validationStatus: 'placeholder'
  }),
  Object.freeze({
    id: 'greeting-thanks',
    label: 'gracias',
    displayLabel: 'Gracias',
    category: 'Saludos',
    aliases: Object.freeze([]),
    description: 'Entrada ilustrativa para probar búsqueda textual; no representa una seña validada.',
    videoPath: null,
    validationStatus: 'placeholder'
  }),
  Object.freeze({
    id: 'people-student',
    label: 'estudiante',
    displayLabel: 'Estudiante',
    category: 'Escuela',
    aliases: Object.freeze([]),
    description: 'Marcador de catálogo para organizar futuras grabaciones aprobadas.',
    videoPath: null,
    validationStatus: 'placeholder'
  }),
  Object.freeze({
    id: 'school-book',
    label: 'libro',
    displayLabel: 'Libro',
    category: 'Escuela',
    aliases: Object.freeze([]),
    description: 'Vocabulario escolar de muestra sin video disponible.',
    videoPath: null,
    validationStatus: 'placeholder'
  }),
  Object.freeze({
    id: 'daily-water',
    label: 'agua',
    displayLabel: 'Agua',
    category: 'Vida diaria',
    aliases: Object.freeze([]),
    description: 'Etiqueta cotidiana para demostrar categorías del diccionario.',
    videoPath: null,
    validationStatus: 'placeholder'
  }),
  Object.freeze({
    id: 'daily-family',
    label: 'familia',
    displayLabel: 'Familia',
    category: 'Vida diaria',
    aliases: Object.freeze([]),
    description: 'Entrada pendiente de revisión cultural y lingüística.',
    videoPath: null,
    validationStatus: 'placeholder'
  })
]);

const WORD_PATTERN = /[\p{L}\p{N}]+/gu;

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-BO')
    .trim();
}

export function tokenizeText(value) {
  return normalizeText(value).match(WORD_PATTERN) ?? [];
}

export function getCategories(catalog = STARTER_CATALOG) {
  return [...new Set(catalog.map((entry) => entry.category))].sort((a, b) => a.localeCompare(b, 'es'));
}

export function entriesByCategory(catalog = STARTER_CATALOG) {
  return getCategories(catalog).map((category) => ({
    category,
    entries: catalog.filter((entry) => entry.category === category)
  }));
}

export function createLexicon(catalog = STARTER_CATALOG) {
  const lexicon = new Map();

  for (const entry of catalog) {
    const terms = [entry.label, ...(entry.aliases ?? [])];

    for (const term of terms) {
      const normalizedTerm = normalizeText(term);
      if (!normalizedTerm || lexicon.has(normalizedTerm)) {
        continue;
      }
      lexicon.set(normalizedTerm, entry);
    }
  }

  return lexicon;
}

export function lookupText(input, catalog = STARTER_CATALOG) {
  const lexicon = createLexicon(catalog);
  const tokens = tokenizeText(input);
  const recognized = [];
  const unknown = [];

  for (const token of tokens) {
    const entry = lexicon.get(token);
    if (entry) {
      recognized.push({ token, entry });
    } else {
      unknown.push(token);
    }
  }

  return {
    originalText: String(input ?? ''),
    tokens,
    recognized,
    unknown
  };
}

export function getPlayableSequence(recognizedItems) {
  return recognizedItems
    .filter((item) => typeof item.entry.videoPath === 'string' && item.entry.videoPath.trim() !== '')
    .map((item, index) => ({
      token: item.token,
      entry: item.entry,
      source: item.entry.videoPath,
      position: index + 1
    }));
}
