import { STARTER_CATALOG, entriesByCategory } from './catalog.mjs';

export function buildBeginnerLessons(catalog = STARTER_CATALOG) {
  return entriesByCategory(catalog)
    .filter((group) => group.entries.length >= 2)
    .map((group, index) => ({
      id: `lesson-${index + 1}-${group.category.toLocaleLowerCase('es-BO').replace(/\s+/g, '-')}`,
      position: index + 1,
      category: group.category,
      title: `${group.category}: primeras etiquetas`,
      summary: `Reconocé ${group.entries.length} etiquetas del catálogo compartido.`,
      entries: group.entries,
      validationNote: 'Material ilustrativo pendiente de validación lingüística y de videos reales.'
    }));
}

export function createPracticeSession(lesson) {
  return {
    lessonId: lesson?.id ?? null,
    currentIndex: 0,
    correctCount: 0,
    attempts: 0,
    completed: false,
    lastResult: null
  };
}

export function getPracticePrompt(session, lesson) {
  if (!lesson || !session || session.completed) {
    return null;
  }

  const entry = lesson.entries[session.currentIndex];
  if (!entry) {
    return null;
  }

  return {
    answerId: entry.id,
    stepNumber: session.currentIndex + 1,
    totalSteps: lesson.entries.length,
    label: entry.displayLabel,
    description: entry.description,
    options: lesson.entries.map((option) => ({
      id: option.id,
      label: option.displayLabel,
      category: option.category
    }))
  };
}

export function answerPracticeStep(session, lesson, selectedEntryId) {
  const prompt = getPracticePrompt(session, lesson);
  if (!prompt) {
    return { correct: false, expectedId: null, nextSession: { ...session } };
  }

  const correct = selectedEntryId === prompt.answerId;
  const lastStep = session.currentIndex >= lesson.entries.length - 1;
  const nextIndex = correct && !lastStep ? session.currentIndex + 1 : session.currentIndex;
  const completed = correct && lastStep;

  return {
    correct,
    expectedId: prompt.answerId,
    nextSession: {
      ...session,
      currentIndex: nextIndex,
      correctCount: session.correctCount + (correct ? 1 : 0),
      attempts: session.attempts + 1,
      completed,
      lastResult: {
        correct,
        selectedEntryId,
        expectedId: prompt.answerId
      }
    }
  };
}
