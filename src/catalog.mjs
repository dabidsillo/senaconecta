export const CATALOG_VERSION = 'final-vocabulary-v3';

const VOCABULARY_BY_CATEGORY = Object.freeze({
  ALIMENTOS: ['Arroz', 'Café', 'Fideo', 'Leche', 'Pan'],
  ANIMALES: ['Cóndor', 'Gallina', 'Gato', 'Perro', 'Vaca'],
  COLORES: ['Amarillo', 'Azul', 'Rojo', 'Verde'],
  DEPARTAMENTOS: ['Beni', 'La Paz', 'Oruro', 'Potosí', 'Santa Cruz'],
  'DÍAS DE LA SEMANA': ['Jueves', 'Lunes', 'Martes', 'Miércoles', 'Viernes'],
  FAMILIA: ['Bebé', 'Hija', 'Hijo', 'Mamá', 'Papá'],
  FRUTAS: ['Guineo', 'Manzana', 'Naranja', 'Piña', 'Plátano'],
  LUGARES: ['Baño', 'Casa', 'Escuela', 'Hospital', 'Mercado'],
  SALUDOS: ['Chau', 'Gracias', 'Hola', 'Lo siento', 'Por favor', 'Te amo']
});

const WORD_PATTERN = /[\p{L}\p{N}]+/gu;
const CATEGORY_PROPER_NAMES = Object.freeze({
  BOLIVIA: 'Bolivia'
});

export function formatCategoryLabel(category) {
  return String(category ?? '')
    .toLocaleLowerCase('es-BO')
    .replace(/\bbolivia\b/gu, CATEGORY_PROPER_NAMES.BOLIVIA)
    .replace(/^./u, (letter) => letter.toLocaleUpperCase('es-BO'));
}

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

function stableId(category, displayLabel) {
  return `${tokenizeText(category).join('-')}-${tokenizeText(displayLabel).join('-')}`;
}

function createEntry(category, displayLabel) {
  return Object.freeze({
    id: stableId(category, displayLabel),
    label: normalizeText(displayLabel),
    displayLabel,
    category,
    aliases: Object.freeze([]),
    description: 'Video disponible. La revisión LSB y la autorización de publicación fueron declaradas por la persona propietaria; no constituyen una verificación lingüística independiente.',
    videoPath: `./assets/catalog/${stableId(category, displayLabel)}.webm`,
    validationStatus: 'owner-attested-review'
  });
}

export const STARTER_CATALOG = Object.freeze(
  Object.entries(VOCABULARY_BY_CATEGORY).flatMap(([category, labels]) =>
    labels.map((displayLabel) => createEntry(category, displayLabel))
  )
);

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
    for (const term of [entry.label, ...(entry.aliases ?? [])]) {
      const normalizedTerm = normalizeText(term);
      if (normalizedTerm && !lexicon.has(normalizedTerm)) {
        lexicon.set(normalizedTerm, entry);
      }
    }
  }

  return lexicon;
}

function createPhraseLexicon(catalog) {
  const phrases = new Map();
  let longestPhraseLength = 0;

  for (const entry of catalog) {
    for (const term of [entry.label, ...(entry.aliases ?? [])]) {
      const phraseTokens = tokenizeText(term);
      if (phraseTokens.length === 0) {
        continue;
      }

      const phrase = phraseTokens.join(' ');
      const matches = phrases.get(phrase) ?? [];
      matches.push(entry);
      phrases.set(phrase, matches);
      longestPhraseLength = Math.max(longestPhraseLength, phraseTokens.length);
    }
  }

  return { phrases, longestPhraseLength };
}

export function lookupText(input, catalog = STARTER_CATALOG) {
  const tokens = tokenizeText(input);
  const { phrases, longestPhraseLength } = createPhraseLexicon(catalog);
  const recognized = [];
  const matches = [];
  const unknown = [];

  for (let index = 0; index < tokens.length;) {
    let match = null;
    const maximumLength = Math.min(longestPhraseLength, tokens.length - index);

    for (let length = maximumLength; length > 0; length -= 1) {
      const token = tokens.slice(index, index + length).join(' ');
      const entries = phrases.get(token);
      if (entries) {
        match = { token, entries, length };
        break;
      }
    }

    if (match) {
      matches.push({ token: match.token, entries: [...match.entries], length: match.length });
      for (const entry of match.entries) {
        recognized.push({ token: match.token, entry });
      }
      index += match.length;
    } else {
      unknown.push(tokens[index]);
      index += 1;
    }
  }

  return {
    originalText: String(input ?? ''),
    tokens,
    recognized,
    matches,
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
