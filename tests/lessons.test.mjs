import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_CATALOG } from '../src/catalog.mjs';
import {
  answerPracticeStep,
  buildBeginnerLessons,
  createPracticeSession,
  getPracticePrompt
} from '../src/lessons.mjs';

test('buildBeginnerLessons creates category lessons from the shared starter catalog', () => {
  const lessons = buildBeginnerLessons(STARTER_CATALOG);

  assert.deepEqual(lessons.map((lesson) => lesson.category), ['Escuela', 'Saludos', 'Vida diaria']);
  assert.equal(lessons.reduce((count, lesson) => count + lesson.entries.length, 0), STARTER_CATALOG.length);
  assert.ok(lessons.every((lesson, index) => lesson.position === index + 1));
  assert.ok(lessons.every((lesson) => lesson.entries.every((entry) => entry.validationStatus === 'placeholder')));
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
