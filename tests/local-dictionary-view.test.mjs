import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDictionaryViewState } from '../src/local-dictionary-view.mjs';

test('hides the local panel outside a free-text search', () => {
  assert.deepEqual(getLocalDictionaryViewState({ tokens: [], localRecognized: [{ id: 'one' }] }), {
    visible: false,
    message: '',
    matches: []
  });
});

test('keeps saved clips distinct and reports their local-only scope', () => {
  const matches = [{ id: 'one', label: 'Hola' }, { id: 'two', label: 'Hola' }];
  const state = getLocalDictionaryViewState({ tokens: ['hola'], localRecognized: matches });

  assert.equal(state.visible, true);
  assert.equal(state.message, '2 coincidencia(s) guardada(s) solo en este navegador.');
  assert.equal(state.matches, matches);
});

test('reports loading and unavailable storage without hiding catalog search', () => {
  assert.equal(
    getLocalDictionaryViewState({ tokens: ['hola'], loading: true }).message,
    'Buscando señas guardadas en este navegador…'
  );
  assert.deepEqual(
    getLocalDictionaryViewState({ tokens: ['hola'], unavailable: true, localRecognized: [{ id: 'one' }] }),
    {
      visible: true,
      message: 'Las señas guardadas no están disponibles en este navegador. Los resultados del catálogo siguen disponibles.',
      matches: []
    }
  );
});
