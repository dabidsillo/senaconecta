import { STARTER_CATALOG, getCategories } from './catalog.mjs';

export function getDictionaryCategories(catalog = STARTER_CATALOG) {
  return getCategories(catalog);
}

export function getDictionaryEntries(category, catalog = STARTER_CATALOG) {
  return catalog.filter((entry) => entry.category === category);
}

export function changeDictionaryCategory(category, catalog = STARTER_CATALOG) {
  const entries = getDictionaryEntries(category, catalog);

  return {
    category: entries.length > 0 ? category : '',
    entryId: '',
    entries
  };
}

export function resolveDictionaryEntry(category, entryId, catalog = STARTER_CATALOG) {
  return catalog.find((entry) => entry.category === category && entry.id === entryId) ?? null;
}
