import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_CATALOG } from '../src/catalog.mjs';
import {
  answerPracticeStep,
  buildBeginnerLessons,
  createPracticeSession,
  getPracticePrompt
} from '../src/lessons.mjs';

const EXPECTED_CATEGORIES = [
  'ALIMENTOS',
  'ANIMALES',
  'COLORES',
  'DEPARTAMENTOS',
  'DÍAS DE LA SEMANA',
  'FAMILIA',
  'FRUTAS',
  'LUGARES',
  'SALUDOS'
].sort((a, b) => a.localeCompare(b, 'es'));

test('buildBeginnerLessons creates all 9 category lessons from the shared final vocabulary', () => {
  const lessons = buildBeginnerLessons(STARTER_CATALOG);

  assert.deepEqual(lessons.map((lesson) => lesson.category), EXPECTED_CATEGORIES);
  assert.equal(lessons.length, 9);
  assert.equal(lessons.reduce((count, lesson) => count + lesson.entries.length, 0), 45);
  assert.ok(lessons.every((lesson, index) => lesson.position === index + 1));
  assert.ok(lessons.every((lesson) => lesson.entries.every((entry) => entry.validationStatus === 'placeholder')));
});

test('buildBeginnerLessons formats the selected lesson title while retaining its stable ID', () => {
  const lesson = buildBeginnerLessons(STARTER_CATALOG)
    .find((candidate) => candidate.category === 'DEPARTAMENTOS');

  assert.equal(lesson.title, 'Departamentos: primeras etiquetas');
  assert.equal(lesson.id, 'lesson-4-departamentos');
  assert.equal(lesson.category, 'DEPARTAMENTOS');
});

test('buildBeginnerLessons rejects empty or one-card categories for beginner progression', () => {
  const lessons = buildBeginnerLessons([
    { id: 'a', label: 'uno', displayLabel: 'Uno', category: 'A', validationStatus: 'placeholder' },
    { id: 'b', label: 'dos', displayLabel: 'Dos', category: 'A', validationStatus: 'placeholder' },
    { id: 'c', label: 'solo', displayLabel: 'Solo', category: 'B', validationStatus: 'placeholder' }
  ]);

  assert.deepEqual(lessons.map((lesson) => lesson.category), ['A']);
  assert.equal(lessons[0].entries.length, 2);
});

test('practice session tracks progress in memory without mutating lesson data', () => {
  const [lesson] = buildBeginnerLessons(STARTER_CATALOG);
  const session = createPracticeSession(lesson);
  const prompt = getPracticePrompt(session, lesson);

  assert.equal(session.correctCount, 0);
  assert.equal(session.completed, false);
  assert.equal(prompt.options.length, lesson.entries.length);
  assert.equal(prompt.answerId, lesson.entries[0].id);

  const answered = answerPracticeStep(session, lesson, prompt.answerId);
  assert.equal(answered.correct, true);
  assert.equal(answered.nextSession.correctCount, 1);
  assert.equal(answered.nextSession.currentIndex, 1);
  assert.equal(session.correctCount, 0);
});

test('practice session reports completion only for the current browser session', () => {
  const [lesson] = buildBeginnerLessons(STARTER_CATALOG);
  let session = createPracticeSession(lesson);

  for (const entry of lesson.entries) {
    const result = answerPracticeStep(session, lesson, entry.id);
    session = result.nextSession;
  }

  assert.equal(session.completed, true);
  assert.equal(session.currentIndex, lesson.entries.length - 1);
  assert.equal(getPracticePrompt(session, lesson), null);
});
