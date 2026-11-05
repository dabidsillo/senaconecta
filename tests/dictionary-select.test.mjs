import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_CATALOG } from '../src/catalog.mjs';
import {
  changeDictionaryCategory,
  getDictionaryCategories,
  getDictionaryEntries,
  resolveDictionaryEntry
} from '../src/dictionary-select.mjs';

test('dictionary selectors expose all 9 shared catalog categories', () => {
  const categories = getDictionaryCategories();

  assert.equal(categories.length, 9);
  assert.equal(categories.reduce((count, category) => count + getDictionaryEntries(category).length, 0), 45);
});

test('changing category clears the selected word and loads only that category', () => {
  const family = STARTER_CATALOG.find((entry) => entry.category === 'FAMILIA' && entry.displayLabel === 'Papá');
  const foods = changeDictionaryCategory('ALIMENTOS');

  assert.ok(family);
  assert.equal(foods.entryId, '');
  assert.deepEqual(foods.entries.map((entry) => entry.category), ['ALIMENTOS', 'ALIMENTOS', 'ALIMENTOS', 'ALIMENTOS', 'ALIMENTOS']);
  assert.equal(resolveDictionaryEntry('ALIMENTOS', family.id), null);
});

test('capture category changes reset the sign and cannot resolve an ID from the previous category', () => {
  const father = STARTER_CATALOG.find((entry) => entry.category === 'FAMILIA' && entry.displayLabel === 'Papá');
  const foods = changeDictionaryCategory('ALIMENTOS');

  assert.ok(father);
  assert.equal(foods.category, 'ALIMENTOS');
  assert.equal(foods.entryId, '');
  assert.equal(resolveDictionaryEntry(foods.category, father.id), null);
  assert.ok(foods.entries.every((entry) => entry.category === foods.category));
});

test('dictionary selection resolves Papá uniquely and does not include the removed Papa vegetable', () => {
  const father = STARTER_CATALOG.find((entry) => entry.category === 'FAMILIA' && entry.displayLabel === 'Papá');

  assert.equal(resolveDictionaryEntry('FAMILIA', father.id), father);
  assert.equal(STARTER_CATALOG.some((entry) => entry.displayLabel === 'Papa'), false);
});

test('selector entries preserve the catalog no-video state', () => {
  const entries = getDictionaryEntries('SALUDOS');

  assert.ok(entries.length > 0);
  assert.ok(entries.every((entry) => entry.videoPath === null));
});
