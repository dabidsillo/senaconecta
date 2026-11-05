import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_CATALOG } from '../src/catalog.mjs';
import {
  changeDictionaryCategory,
  getDictionaryCategories,
  getDictionaryEntries,
  resolveDictionaryEntry
} from '../src/dictionary-select.mjs';

test('dictionary selectors expose all 15 shared catalog categories', () => {
  const categories = getDictionaryCategories();

  assert.equal(categories.length, 15);
  assert.equal(categories.reduce((count, category) => count + getDictionaryEntries(category).length, 0), 112);
});

test('changing category clears the selected word and loads only that category', () => {
  const family = STARTER_CATALOG.find((entry) => entry.category === 'FAMILIA' && entry.displayLabel === 'Papá');
  const vegetables = changeDictionaryCategory('VERDURAS');

  assert.ok(family);
  assert.equal(vegetables.entryId, '');
  assert.deepEqual(vegetables.entries.map((entry) => entry.category), ['VERDURAS', 'VERDURAS', 'VERDURAS', 'VERDURAS']);
  assert.equal(resolveDictionaryEntry('VERDURAS', family.id), null);
});

test('capture category changes reset the sign and cannot resolve an ID from the previous category', () => {
  const father = STARTER_CATALOG.find((entry) => entry.category === 'FAMILIA' && entry.displayLabel === 'Papá');
  const vegetables = changeDictionaryCategory('VERDURAS');

  assert.ok(father);
  assert.equal(vegetables.category, 'VERDURAS');
  assert.equal(vegetables.entryId, '');
  assert.equal(resolveDictionaryEntry(vegetables.category, father.id), null);
  assert.ok(vegetables.entries.every((entry) => entry.category === vegetables.category));
});

test('dictionary selection resolves exact category and ID, including Papá and Papa', () => {
  const father = STARTER_CATALOG.find((entry) => entry.category === 'FAMILIA' && entry.displayLabel === 'Papá');
  const potato = STARTER_CATALOG.find((entry) => entry.category === 'VERDURAS' && entry.displayLabel === 'Papa');

  assert.equal(resolveDictionaryEntry('FAMILIA', father.id), father);
  assert.equal(resolveDictionaryEntry('VERDURAS', potato.id), potato);
  assert.notEqual(father.id, potato.id);
});

test('selector entries preserve the catalog no-video state', () => {
  const entries = getDictionaryEntries('SALUDOS');

  assert.ok(entries.length > 0);
  assert.ok(entries.every((entry) => entry.videoPath === null));
});
