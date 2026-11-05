import {
  CATALOG_VERSION,
  STARTER_CATALOG,
  formatCategoryLabel,
  getPlayableSequence,
  lookupText
} from './catalog.mjs';
import {
  changeDictionaryCategory,
  getDictionaryCategories,
  resolveDictionaryEntry
} from './dictionary-select.mjs';
import {
  answerPracticeStep,
  buildBeginnerLessons,
  createPracticeSession,
  getPracticePrompt
} from './lessons.mjs';
import {
  getGalleryBoundaries,
  getNextGalleryTarget
} from './lesson-gallery.mjs';
import {
  DEFAULT_RECORDING_LIMIT_MS,
  DEFAULT_STOP_PENDING_TIMEOUT_MS,
  buildCaptureMetadata,
  buildSavedCaptureMetadata,
  chooseSupportedMimeType,
  freezeResolvedLabel,
  getCaptureControlState,
  getCaptureSupport,
  isCurrentRecorderStopEvent,
  isCurrentRecordingSession,
  isResolvedLabelValid,
  resolveCaptureLabel,
  stopStreamTracks,
  streamHasAudioTracks
} from './capture.mjs';
import { createCaptureStore } from './capture-store.mjs';

const form = document.querySelector('#lookup-form');
const input = document.querySelector('#lookup-input');
const summary = document.querySelector('#summary');
const recognizedList = document.querySelector('#recognized-list');
const unknownPanel = document.querySelector('#unknown-panel');
const unknownList = document.querySelector('#unknown-list');
const exampleButtons = document.querySelectorAll('[data-example]');
const dictionaryCategorySelect = document.querySelector('#dictionary-category');
const dictionaryWordSelect = document.querySelector('#dictionary-word');
const playbackStatus = document.querySelector('#playback-status');
const sequenceVideo = document.querySelector('#sequence-video');
const previousVideoButton = document.querySelector('#previous-video');
const playCurrentVideoButton = document.querySelector('#play-current-video');
const nextVideoButton = document.querySelector('#next-video');
const lessonList = document.querySelector('#lesson-list');
const previousLessonButton = document.querySelector('#previous-lesson');
const nextLessonButton = document.querySelector('#next-lesson');
const practiceTitle = document.querySelector('#practice-title');
const practiceStatus = document.querySelector('#practice-status');
const practiceCard = document.querySelector('#practice-card');
const captureSupport = document.querySelector('#capture-support');
const captureCategorySelect = document.querySelector('#capture-category');
const catalogLabelSelect = document.querySelector('#catalog-label');
const customLabelInput = document.querySelector('#custom-label');
const cameraPreview = document.querySelector('#camera-preview');
const cameraPlaceholder = document.querySelector('#camera-placeholder');
const recordedPreview = document.querySelector('#recorded-preview');
const recordedPlaceholder = document.querySelector('#recorded-placeholder');
const startCameraButton = document.querySelector('#start-camera');
const startRecordingButton = document.querySelector('#start-recording');
const captureStatus = document.querySelector('#capture-status');
const saveRecordingButton = document.querySelector('#save-recording');
const savedRecordingsStatus = document.querySelector('#saved-recordings-status');
const savedRecordingsList = document.querySelector('#saved-recordings-list');
const metadataPreview = document.querySelector('#metadata-preview');

const beginnerLessons = buildBeginnerLessons(STARTER_CATALOG);
let selectedLesson = beginnerLessons[0] ?? null;
let practiceSession = selectedLesson ? createPracticeSession(selectedLesson) : null;
let playbackSequence = [];
let currentPlaybackIndex = 0;
let skippedVideoCount = 0;
let activeStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordingStartedAt = null;
let recordingLimitTimer = null;
let stopPendingTimer = null;
let stopPendingSessionId = 0;
let pendingPreviewObjectUrl = null;
let savedPreviewObjectUrl = null;
let pendingVideoBlob = null;
let pendingMetadata = null;
let pendingCaptureId = 0;
let pendingClipSaved = false;
let saveInProgress = false;
let savedRecordings = [];
let savedListRequestId = 0;
let savedPreviewRequestId = 0;
let selectedSavedRecordingId = null;
let selectedMimeType = '';
let recorderFailed = false;
let activeRecordingLabel = null;
let recordingSessionId = 0;
let cleanupSessionId = 0;
let timedOutSessionId = 0;
let captureIsSupported = false;
let cameraRequestPending = false;
let cameraRequestId = 0;
let capturePageActive = true;
const captureStore = createCaptureStore();

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function currentPlaybackItem() {
  return playbackSequence[currentPlaybackIndex];
}

function setPlaybackStatus(message) {
  playbackStatus.textContent = message;
}

function disablePlayback(message) {
  sequenceVideo.pause();
  sequenceVideo.hidden = true;
  sequenceVideo.removeAttribute('src');
  sequenceVideo.removeAttribute('aria-label');
  sequenceVideo.load();
  previousVideoButton.disabled = true;
  playCurrentVideoButton.disabled = true;
  nextVideoButton.disabled = true;
  setPlaybackStatus(message);
}

function syncPlaybackControls() {
  const item = currentPlaybackItem();
  if (!item) {
    disablePlayback('No hay videos disponibles para esta búsqueda. Las entradas encontradas muestran estado pendiente.');
    return;
  }

  sequenceVideo.hidden = false;
  previousVideoButton.disabled = currentPlaybackIndex <= 0;
  playCurrentVideoButton.disabled = false;
  nextVideoButton.disabled = currentPlaybackIndex >= playbackSequence.length - 1;

  if (sequenceVideo.getAttribute('src') !== item.source) {
    sequenceVideo.src = item.source;
    sequenceVideo.load();
  }

  sequenceVideo.setAttribute('aria-label', `Video ${currentPlaybackIndex + 1} de ${playbackSequence.length}: ${item.entry.displayLabel}`);
  const skippedMessage = skippedVideoCount > 0 ? ` Se omitieron ${skippedVideoCount} coincidencia(s) sin video.` : '';
  setPlaybackStatus(`Video ${currentPlaybackIndex + 1} de ${playbackSequence.length}: ${item.entry.displayLabel}.${skippedMessage}`);
}

function preparePlayback(result) {
  playbackSequence = getPlayableSequence(result.recognized);
  currentPlaybackIndex = 0;
  skippedVideoCount = result.recognized.length - playbackSequence.length;

  if (result.tokens.length === 0) {
    disablePlayback('No hay secuencia preparada. Los videos nunca se reproducen automáticamente.');
    return;
  }

  if (playbackSequence.length === 0) {
    const recognizedMessage = result.recognized.length > 0
      ? 'Hay coincidencias textuales, pero ninguna tiene video cargado en este catálogo.'
      : 'No hay videos porque no se encontró ninguna entrada del catálogo.';
    disablePlayback(recognizedMessage);
    return;
  }

  syncPlaybackControls();
}

function appendMissingVideoState(card) {
  const placeholder = createElement('div', 'video-placeholder', 'Video no disponible');
  placeholder.setAttribute('role', 'status');
  card.appendChild(placeholder);
  card.appendChild(createElement(
    'p',
    'unavailable',
    'Esta entrada es una etiqueta de catálogo sin grabación validada. El diccionario no inventa señas ni reemplaza revisión de personas creadoras LSB.'
  ));
}

function appendVideoState(card, entry) {
  if (!entry.videoPath) {
    appendMissingVideoState(card);
    return;
  }

  const video = document.createElement('video');
  const errorMessage = createElement('p', 'video-error', 'No se pudo cargar o decodificar este video. Revisá la ruta declarada en el catálogo.');
  errorMessage.hidden = true;
  video.className = 'entry-video';
  video.controls = true;
  video.preload = 'metadata';
  video.src = entry.videoPath;
  video.setAttribute('aria-label', `Video para ${entry.displayLabel}`);
  video.addEventListener('error', () => {
    errorMessage.hidden = false;
  });
  card.appendChild(video);
  card.appendChild(errorMessage);
}

function renderRecognized(result, selected = false) {
  clearChildren(recognizedList);

  for (const item of result.recognized) {
    const card = createElement('article', 'sign-card');
    card.setAttribute('tabindex', '0');

    const header = createElement('div', 'card-header');
    const titleGroup = createElement('div');
    titleGroup.appendChild(createElement('h3', null, item.entry.displayLabel));
    titleGroup.appendChild(createElement('p', 'meta', selected ? 'Entrada seleccionada del catálogo' : `Token reconocido: ${item.token}`));
    header.appendChild(titleGroup);
    header.appendChild(createElement('span', 'badge', formatCategoryLabel(item.entry.category)));
    card.appendChild(header);

    card.appendChild(createElement('span', 'status-pill', item.entry.videoPath ? 'Video declarado' : 'Pendiente de video'));
    appendVideoState(card, item.entry);
    card.appendChild(createElement('p', 'meta', item.entry.description));
    recognizedList.appendChild(card);
  }
}

function renderUnknown(result) {
  clearChildren(unknownList);
  unknownPanel.hidden = result.unknown.length === 0;

  for (const token of result.unknown) {
    unknownList.appendChild(createElement('span', 'token', token));
  }
}

function renderResult(inputText) {
  const result = lookupText(inputText);
  const recognizedCount = result.recognized.length;
  const unknownCount = result.unknown.length;

  if (result.tokens.length === 0) {
    summary.textContent = `Catálogo ${CATALOG_VERSION}: ${STARTER_CATALOG.length} etiquetas disponibles para búsqueda textual.`;
  } else {
    summary.textContent = `${recognizedCount} palabra(s) reconocida(s) y ${unknownCount} sin coincidencia, respetando el orden escrito.`;
  }

  preparePlayback(result);
  renderRecognized(result);
  renderUnknown(result);
}

function renderSelectedDictionaryEntry(entry) {
  const result = {
    tokens: [entry.label],
    recognized: [{ token: entry.displayLabel, entry }],
    unknown: []
  };

  summary.textContent = `Término seleccionado: ${entry.displayLabel} (${formatCategoryLabel(entry.category)}). Esta es la entrada exacta elegida, no una búsqueda textual.`;
  preparePlayback(result);
  renderRecognized(result, true);
  renderUnknown(result);
}

function populateDictionaryWordOptions(entries) {
  clearChildren(dictionaryWordSelect);
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = entries.length > 0 ? 'Elegí una palabra o frase' : 'Primero elegí una categoría';
  dictionaryWordSelect.appendChild(placeholder);

  for (const entry of entries) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.displayLabel;
    dictionaryWordSelect.appendChild(option);
  }

  dictionaryWordSelect.disabled = entries.length === 0;
}

function resetDictionarySelectors() {
  dictionaryCategorySelect.value = '';
  populateDictionaryWordOptions([]);
}

function renderDictionarySelectorCategories() {
  for (const category of getDictionaryCategories()) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = formatCategoryLabel(category);
    dictionaryCategorySelect.appendChild(option);
  }
}

function getLessonCardOffsets() {
  const listLeft = lessonList.getBoundingClientRect().left;
  const offsets = Array.from(lessonList.children, (card) => (
    card.getBoundingClientRect().left - listLeft + lessonList.scrollLeft
  ));
  const firstOffset = offsets[0] ?? 0;
  return offsets.map((offset) => offset - firstOffset);
}

function syncLessonGalleryControls() {
  const boundaries = getGalleryBoundaries({
    scrollLeft: lessonList.scrollLeft,
    clientWidth: lessonList.clientWidth,
    scrollWidth: lessonList.scrollWidth
  });
  previousLessonButton.disabled = boundaries.atStart;
  nextLessonButton.disabled = boundaries.atEnd;
}

function scrollLessonGallery(direction) {
  const target = getNextGalleryTarget({
    scrollLeft: lessonList.scrollLeft,
    cardOffsets: getLessonCardOffsets(),
    direction,
    clientWidth: lessonList.clientWidth,
    scrollWidth: lessonList.scrollWidth
  });
  // Instant movement makes each click advance one card even when buttons are clicked rapidly.
  lessonList.scrollTo({ left: target, behavior: 'auto' });
}

function selectLesson(lesson, restoreGalleryFocus = false) {
  const scrollLeft = lessonList.scrollLeft;
  selectedLesson = lesson;
  practiceSession = createPracticeSession(lesson);
  const selectedAction = renderLessons(scrollLeft);
  renderPractice();
  if (restoreGalleryFocus) {
    selectedAction?.focus({ preventScroll: true });
  }
}

function renderLessons(scrollLeft = lessonList.scrollLeft) {
  clearChildren(lessonList);
  let selectedAction = null;

  for (const lesson of beginnerLessons) {
    const card = createElement('article', 'lesson-card');
    if (lesson.id === selectedLesson?.id) {
      card.classList.add('is-active');
    }

    card.appendChild(createElement('h3', null, lesson.title));
    card.appendChild(createElement('p', 'meta', lesson.summary));
    card.appendChild(createElement('p', 'unavailable', lesson.validationNote));

    const actions = createElement('div', 'lesson-actions');
    const startButton = createElement('button', null, lesson.id === selectedLesson?.id ? 'Reiniciar práctica' : 'Practicar esta categoría');
    startButton.type = 'button';
    startButton.addEventListener('click', () => selectLesson(lesson, document.activeElement === startButton));
    actions.appendChild(startButton);
    if (lesson.id === selectedLesson?.id) {
      selectedAction = startButton;
    }
    card.appendChild(actions);

    lessonList.appendChild(card);
  }

  lessonList.scrollLeft = getGalleryBoundaries({
    scrollLeft,
    clientWidth: lessonList.clientWidth,
    scrollWidth: lessonList.scrollWidth
  }).scrollLeft;
  syncLessonGalleryControls();
  return selectedAction;
}

function renderPracticeFeedback() {
  if (!practiceSession?.lastResult) {
    return;
  }

  const message = practiceSession.lastResult.correct
    ? 'Respuesta correcta. Avanzaste al siguiente paso.'
    : 'Todavía no. Probá de nuevo con la misma etiqueta.';
  practiceCard.appendChild(createElement('p', 'summary', message));
}

function renderPractice() {
  clearChildren(practiceCard);

  if (!selectedLesson || !practiceSession) {
    practiceTitle.textContent = 'Elegí una lección para practicar';
    practiceStatus.textContent = 'No se guarda progreso fuera de esta pestaña.';
    return;
  }

  practiceTitle.textContent = selectedLesson.title;

  if (practiceSession.completed) {
    practiceStatus.textContent = `Completaste ${practiceSession.correctCount} paso(s) en esta sesión. Este resultado no queda guardado.`;
    practiceCard.appendChild(createElement(
      'p',
      'unavailable',
      'La práctica termina solo en memoria de esta pestaña. Recargar la página reinicia el avance.'
    ));
    const restartButton = createElement('button', null, 'Reiniciar práctica');
    restartButton.type = 'button';
    restartButton.addEventListener('click', () => selectLesson(selectedLesson));
    practiceCard.appendChild(restartButton);
    return;
  }

  const prompt = getPracticePrompt(practiceSession, selectedLesson);
  if (!prompt) {
    practiceStatus.textContent = 'No hay pasos disponibles para esta lección.';
    return;
  }

  practiceStatus.textContent = `Paso ${prompt.stepNumber} de ${prompt.totalSteps}. Aciertos en sesión: ${practiceSession.correctCount}.`;
  practiceCard.appendChild(createElement('p', 'meta', 'Seleccioná la tarjeta que coincide con esta etiqueta del catálogo:'));
  practiceCard.appendChild(createElement('h3', null, prompt.label));
  practiceCard.appendChild(createElement('p', 'unavailable', 'No se muestran movimientos ni videos inventados; esta práctica solo reconoce etiquetas textuales.'));

  const options = createElement('div', 'practice-options');
  for (const option of prompt.options) {
    const button = createElement('button', null, option.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      const result = answerPracticeStep(practiceSession, selectedLesson, option.id);
      practiceSession = result.nextSession;
      renderPractice();
    });
    options.appendChild(button);
  }
  practiceCard.appendChild(options);
  renderPracticeFeedback();
}

function setCaptureStatus(message) {
  captureStatus.textContent = message;
}

function selectedCatalogEntry() {
  return resolveDictionaryEntry(captureCategorySelect.value, catalogLabelSelect.value);
}

function currentResolvedLabel() {
  const entry = selectedCatalogEntry();
  return resolveCaptureLabel({
    catalogId: entry?.id ?? '',
    catalogLabel: entry?.displayLabel ?? '',
    customLabel: customLabelInput.value
  });
}

function syncCaptureButtons() {
  const controls = getCaptureControlState({
    captureIsSupported,
    hasActiveStream: Boolean(activeStream),
    cameraRequestPending,
    isRecording: mediaRecorder?.state === 'recording',
    isFinalizing: stopPendingSessionId !== 0,
    labelIsReady: isResolvedLabelValid(currentResolvedLabel())
  });
  startCameraButton.textContent = controls.camera.label;
  startCameraButton.disabled = controls.camera.disabled;
  startRecordingButton.textContent = controls.recording.label;
  startRecordingButton.disabled = controls.recording.disabled;
}

function clearRecordingLimitTimer() {
  window.clearTimeout(recordingLimitTimer);
  recordingLimitTimer = null;
}

function cancelStopPendingWatchdog() {
  window.clearTimeout(stopPendingTimer);
  stopPendingTimer = null;
  stopPendingSessionId = 0;
}

function armStopPendingWatchdog(sessionId, recorder) {
  window.clearTimeout(stopPendingTimer);
  stopPendingSessionId = sessionId;
  stopPendingTimer = window.setTimeout(() => {
    if (!isCurrentRecordingSession(sessionId, {
      activeSessionId: recordingSessionId,
      cleanupSessionId,
      pendingTimeoutSessionId: timedOutSessionId
    })) {
      cancelStopPendingWatchdog();
      syncCaptureButtons();
      return;
    }

    timedOutSessionId = sessionId;
    cleanupSessionId = Math.max(cleanupSessionId, sessionId);
    if (mediaRecorder === recorder) {
      mediaRecorder = null;
    }
    clearRecordingLimitTimer();
    cancelStopPendingWatchdog();
    recordingStartedAt = null;
    activeRecordingLabel = null;
    recorderFailed = false;
    recordedChunks = [];
    setCaptureStatus('El navegador no confirmó el final de la grabación. No se preparó un clip parcial; reiniciá la cámara o probá otro navegador.');
    syncCaptureButtons();
  }, DEFAULT_STOP_PENDING_TIMEOUT_MS);
}

function safeStopRecorder(statusMessage) {
  if (mediaRecorder?.state !== 'recording') {
    return stopPendingSessionId !== 0;
  }

  const recorder = mediaRecorder;
  const sessionId = recordingSessionId;

  try {
    recorder.stop();
    clearRecordingLimitTimer();
    armStopPendingWatchdog(sessionId, recorder);
    if (statusMessage) {
      setCaptureStatus(statusMessage);
    }
    syncCaptureButtons();
    return true;
  } catch {
    recorderFailed = true;
    mediaRecorder = null;
    recordingStartedAt = null;
    activeRecordingLabel = null;
    recordedChunks = [];
    clearRecordingLimitTimer();
    cancelStopPendingWatchdog();
    setCaptureStatus('El navegador no pudo detener la grabación correctamente. No se preparó ningún clip.');
    syncCaptureButtons();
    return false;
  }
}

function resetCameraPreview() {
  cameraPreview.pause?.();
  cameraPreview.srcObject = null;
  cameraPreview.hidden = true;
  cameraPlaceholder.hidden = false;
}

function revokePendingPreviewUrl() {
  if (pendingPreviewObjectUrl) {
    URL.revokeObjectURL(pendingPreviewObjectUrl);
    pendingPreviewObjectUrl = null;
  }
}

function revokeSavedPreviewUrl() {
  if (savedPreviewObjectUrl) {
    URL.revokeObjectURL(savedPreviewObjectUrl);
    savedPreviewObjectUrl = null;
  }
}

function clearRecordedPreview() {
  recordedPreview.pause?.();
  recordedPreview.hidden = true;
  recordedPreview.removeAttribute('src');
  recordedPreview.load();
  recordedPlaceholder.hidden = false;
}

function syncSaveRecordingButton() {
  saveRecordingButton.disabled = saveInProgress
    || selectedSavedRecordingId !== null
    || !pendingVideoBlob
    || !pendingMetadata
    || pendingClipSaved;
}

function invalidateSavedPreviewSelection() {
  savedPreviewRequestId += 1;
  selectedSavedRecordingId = null;
  revokeSavedPreviewUrl();
}

function showPendingPreview() {
  invalidateSavedPreviewSelection();
  clearRecordedPreview();
  if (!pendingVideoBlob || !pendingMetadata) {
    metadataPreview.hidden = true;
    metadataPreview.textContent = '';
    syncSaveRecordingButton();
    return;
  }

  revokePendingPreviewUrl();
  pendingPreviewObjectUrl = URL.createObjectURL(pendingVideoBlob);
  recordedPreview.src = pendingPreviewObjectUrl;
  recordedPreview.hidden = false;
  recordedPlaceholder.hidden = true;
  metadataPreview.textContent = JSON.stringify(pendingMetadata, null, 2);
  metadataPreview.hidden = false;
  syncSaveRecordingButton();
}

function resetPendingCapture() {
  pendingCaptureId += 1;
  revokePendingPreviewUrl();
  pendingVideoBlob = null;
  pendingMetadata = null;
  pendingClipSaved = false;
  metadataPreview.hidden = true;
  metadataPreview.textContent = '';
  syncSaveRecordingButton();
}

function formatSavedRecording(entry) {
  const label = entry.metadata?.label || 'Sin etiqueta';
  const date = entry.createdAt ? new Date(entry.createdAt) : null;
  const dateText = date && !Number.isNaN(date.valueOf())
    ? date.toLocaleString('es-BO')
    : 'fecha no disponible';
  const sizeBytes = Number(entry.metadata?.sizeBytes) || 0;
  return `${label} — ${dateText} — ${sizeBytes} bytes`;
}

function renderSavedRecordings() {
  clearChildren(savedRecordingsList);
  if (savedRecordings.length === 0) {
    savedRecordingsStatus.textContent = 'No hay señas guardadas en este navegador todavía.';
    return;
  }

  savedRecordingsStatus.textContent = `${savedRecordings.length} seña(s) guardada(s) solo en este navegador.`;
  for (const entry of savedRecordings) {
    const item = createElement('li', 'saved-recording');
    item.appendChild(createElement('p', 'meta', formatSavedRecording(entry)));
    const actions = createElement('div', 'saved-recording-actions');
    const playButton = createElement('button', null, 'Reproducir');
    playButton.type = 'button';
    playButton.addEventListener('click', () => { void selectSavedRecording(entry.id); });
    const deleteButton = createElement('button', 'delete-recording', 'Eliminar');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', () => { void deleteSavedRecording(entry.id); });
    actions.append(playButton, deleteButton);
    item.appendChild(actions);
    savedRecordingsList.appendChild(item);
  }
}

async function loadSavedRecordings() {
  const requestId = savedListRequestId + 1;
  savedListRequestId = requestId;
  savedRecordingsStatus.textContent = 'Cargando señas guardadas localmente…';
  try {
    const entries = await captureStore.list();
    if (requestId !== savedListRequestId) return;
    savedRecordings = entries;
    renderSavedRecordings();
  } catch (error) {
    if (requestId !== savedListRequestId) return;
    savedRecordings = [];
    clearChildren(savedRecordingsList);
    savedRecordingsStatus.textContent = error?.code === 'unavailable'
      ? 'El almacenamiento local no está disponible en este navegador.'
      : 'No se pudieron leer las señas guardadas localmente.';
  }
}

async function selectSavedRecording(id) {
  const requestId = savedPreviewRequestId + 1;
  savedPreviewRequestId = requestId;
  selectedSavedRecordingId = id;
  syncSaveRecordingButton();
  setCaptureStatus('Cargando el clip guardado para reproducirlo localmente…');
  try {
    const entry = await captureStore.get(id);
    if (requestId !== savedPreviewRequestId || selectedSavedRecordingId !== id) return;
    if (!entry) {
      setCaptureStatus('La seña seleccionada ya no está disponible. Actualizando la lista local.');
      void loadSavedRecordings();
      return;
    }
    revokeSavedPreviewUrl();
    revokePendingPreviewUrl();
    savedPreviewObjectUrl = URL.createObjectURL(entry.video);
    recordedPreview.src = savedPreviewObjectUrl;
    recordedPreview.hidden = false;
    recordedPlaceholder.hidden = true;
    metadataPreview.textContent = JSON.stringify(entry.metadata, null, 2);
    metadataPreview.hidden = false;
    setCaptureStatus(`Vista previa local lista para “${entry.metadata?.label || 'Sin etiqueta'}”.`);
  } catch (error) {
    if (requestId !== savedPreviewRequestId || selectedSavedRecordingId !== id) return;
    setCaptureStatus(error?.code === 'unavailable'
      ? 'El almacenamiento local no está disponible para reproducir esta seña.'
      : 'No se pudo cargar la seña guardada localmente.');
  }
}

async function deleteSavedRecording(id) {
  const entry = savedRecordings.find((item) => item.id === id);
  const label = entry?.metadata?.label || 'esta seña';
  if (!window.confirm(`¿Eliminar “${label}” de este navegador? Esta acción no se puede deshacer.`)) return;

  if (selectedSavedRecordingId === id) {
    invalidateSavedPreviewSelection();
    showPendingPreview();
  }
  try {
    await captureStore.delete(id);
    setCaptureStatus('La seña se eliminó de este navegador.');
    await loadSavedRecordings();
  } catch (error) {
    setCaptureStatus(error?.code === 'unavailable'
      ? 'El almacenamiento local no está disponible para eliminar esta seña.'
      : 'No se pudo eliminar la seña guardada localmente.');
  }
}

async function savePendingRecording() {
  if (!pendingVideoBlob || !pendingMetadata || pendingClipSaved || saveInProgress) return;
  const captureId = pendingCaptureId;
  const video = pendingVideoBlob;
  const metadata = buildSavedCaptureMetadata(pendingMetadata);
  saveInProgress = true;
  saveRecordingButton.disabled = true;
  setCaptureStatus('Guardando la seña solo en este navegador…');
  try {
    await captureStore.save(video, metadata);
    if (captureId === pendingCaptureId) {
      pendingMetadata = metadata;
      pendingClipSaved = true;
      if (selectedSavedRecordingId === null) {
        metadataPreview.textContent = JSON.stringify(metadata, null, 2);
        setCaptureStatus('Seña guardada solo en este navegador. No se subió ni se agregó al catálogo.');
      }
    }
    await loadSavedRecordings();
  } catch (error) {
    if (captureId === pendingCaptureId) {
      setCaptureStatus(error?.code === 'quota-exceeded'
        ? 'No hay espacio local suficiente para guardar esta seña. Eliminá otra seña o liberá espacio y reintentá.'
        : error?.code === 'unavailable'
          ? 'El almacenamiento local no está disponible para guardar esta seña. El clip sigue disponible para reintentar.'
          : 'No se pudo guardar la seña localmente. El clip sigue disponible para reintentar.');
    }
  } finally {
    saveInProgress = false;
    syncSaveRecordingButton();
  }
}

function populateCatalogLabelOptions(entries) {
  clearChildren(catalogLabelSelect);
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = entries.length > 0 ? 'Elegí una palabra o frase' : 'Primero elegí una categoría';
  catalogLabelSelect.appendChild(placeholder);

  for (const entry of entries) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.displayLabel;
    catalogLabelSelect.appendChild(option);
  }

  catalogLabelSelect.disabled = entries.length === 0;
}

function renderCaptureCategoryOptions() {
  for (const category of getDictionaryCategories()) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = formatCategoryLabel(category);
    captureCategorySelect.appendChild(option);
  }

  populateCatalogLabelOptions([]);
}

function initializeCaptureSupport() {
  const support = getCaptureSupport(window);
  captureIsSupported = support.supported;
  captureSupport.textContent = support.supported
    ? 'Cámara y grabación disponibles: iniciá la cámara cuando estés listo para pedir permiso.'
    : support.message;
  syncCaptureButtons();
}

function stopCamera() {
  if (!activeStream || mediaRecorder?.state === 'recording' || stopPendingSessionId !== 0) {
    return;
  }

  const stream = activeStream;
  activeStream = null;
  stopStreamTracks(stream);
  resetCameraPreview();
  setCaptureStatus('Cámara detenida. La vista previa y las señas guardadas localmente siguen disponibles.');
  syncCaptureButtons();
}

function handleCameraTrackEnded(stream) {
  if (activeStream !== stream || !(stream.getTracks?.() ?? []).every((track) => track.readyState === 'ended')) {
    return;
  }

  activeStream = null;
  resetCameraPreview();
  if (mediaRecorder?.state === 'recording') {
    safeStopRecorder('La cámara se desconectó. Preparando el clip disponible.');
  } else if (stopPendingSessionId === 0) {
    setCaptureStatus('La cámara se detuvo en el dispositivo. Podés iniciarla de nuevo cuando estés listo.');
  }
  syncCaptureButtons();
}

function attachCameraTrackListeners(stream) {
  for (const track of stream.getTracks?.() ?? []) {
    track.addEventListener?.('ended', () => handleCameraTrackEnded(stream), { once: true });
  }
}

async function startCamera() {
  if (cameraRequestPending || activeStream) {
    return;
  }

  const support = getCaptureSupport(window);
  if (!support.supported) {
    captureSupport.textContent = support.message;
    syncCaptureButtons();
    return;
  }

  const requestId = cameraRequestId + 1;
  let stream = null;
  cameraRequestId = requestId;
  cameraRequestPending = true;
  syncCaptureButtons();

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }
    });
    if (!capturePageActive || requestId !== cameraRequestId) {
      stopStreamTracks(stream);
      return;
    }

    activeStream = stream;
    attachCameraTrackListeners(stream);
    cameraPreview.srcObject = stream;
    cameraPreview.hidden = false;
    cameraPlaceholder.hidden = true;
    await cameraPreview.play();
    setCaptureStatus('Cámara activa. Elegí una etiqueta clara y grabá un clip corto de movimiento.');
  } catch (error) {
    if (requestId !== cameraRequestId) {
      return;
    }
    if (activeStream === stream) {
      activeStream = null;
      stopStreamTracks(stream);
    }
    resetCameraPreview();
    const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
    setCaptureStatus(denied
      ? 'Permiso de cámara denegado o contexto no seguro. Usá HTTPS/localhost y concedé permiso si querés grabar.'
      : 'No se pudo iniciar la cámara en este dispositivo. Revisá permisos, disponibilidad y navegador.');
  } finally {
    if (requestId === cameraRequestId) {
      cameraRequestPending = false;
    }
    syncCaptureButtons();
  }
}

function toggleCamera() {
  if (activeStream) {
    stopCamera();
    return;
  }
  void startCamera();
}

function finishRecording(sessionId, recorder) {
  if (!isCurrentRecorderStopEvent({
    sessionId,
    recorder,
    activeRecorder: mediaRecorder,
    activeSessionId: recordingSessionId,
    cleanupSessionId,
    pendingTimeoutSessionId: timedOutSessionId
  })) {
    return;
  }

  clearRecordingLimitTimer();
  cancelStopPendingWatchdog();

  const resolvedLabel = activeRecordingLabel;
  const startedAt = recordingStartedAt;
  mediaRecorder = null;
  recordingStartedAt = null;
  activeRecordingLabel = null;

  if (recorderFailed || recordedChunks.length === 0 || !isResolvedLabelValid(resolvedLabel)) {
    recordedChunks = [];
    recorderFailed = false;
    setCaptureStatus('La grabación no produjo video descargable. Probá de nuevo con otro navegador o un clip más corto.');
    syncCaptureButtons();
    return;
  }

  const endedAt = new Date();
  const videoBlob = new Blob(recordedChunks, { type: selectedMimeType || 'video/webm' });
  const durationMs = startedAt ? endedAt.getTime() - startedAt.getTime() : 0;
  const metadata = buildCaptureMetadata({
    catalogVersion: CATALOG_VERSION,
    resolvedLabel,
    mimeType: videoBlob.type,
    sizeBytes: videoBlob.size,
    durationMs,
    startedAt,
    endedAt,
    recordingLimitMs: DEFAULT_RECORDING_LIMIT_MS
  });
  resetPendingCapture();
  pendingVideoBlob = videoBlob;
  pendingMetadata = metadata;
  showPendingPreview();
  setCaptureStatus('Clip listo en memoria temporal. Elegí “Guardar seña” para conservarlo solo en este navegador.');
  recordedChunks = [];
  syncCaptureButtons();
}

function startRecording() {
  if (mediaRecorder?.state === 'recording' || stopPendingSessionId !== 0) {
    return;
  }

  const resolvedLabel = currentResolvedLabel();
  if (!activeStream || !isResolvedLabelValid(resolvedLabel)) {
    setCaptureStatus('Antes de grabar necesitás cámara activa y una etiqueta del catálogo o personalizada.');
    return;
  }

  const recordingLabel = freezeResolvedLabel(resolvedLabel);
  invalidateSavedPreviewSelection();
  resetPendingCapture();
  clearRecordedPreview();
  recordedChunks = [];
  activeRecordingLabel = recordingLabel;
  selectedMimeType = chooseSupportedMimeType(MediaRecorder, { hasAudio: streamHasAudioTracks(activeStream) });
  recorderFailed = false;
  timedOutSessionId = 0;
  const recorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : undefined;

  try {
    mediaRecorder = new MediaRecorder(activeStream, recorderOptions);
  } catch {
    activeRecordingLabel = null;
    recordedChunks = [];
    setCaptureStatus('Este navegador no pudo crear el grabador de video con el formato disponible.');
    syncCaptureButtons();
    return;
  }

  const recorder = mediaRecorder;
  const sessionId = recordingSessionId + 1;
  recorder.addEventListener('dataavailable', (event) => {
    if (mediaRecorder === recorder && isCurrentRecordingSession(sessionId, {
      activeSessionId: recordingSessionId,
      cleanupSessionId,
      pendingTimeoutSessionId: timedOutSessionId
    }) && event.data?.size > 0) {
      recordedChunks.push(event.data);
    }
  });
  recorder.addEventListener('stop', () => finishRecording(sessionId, recorder), { once: true });
  recorder.addEventListener('error', () => {
    if (mediaRecorder !== recorder || !isCurrentRecordingSession(sessionId, {
      activeSessionId: recordingSessionId,
      cleanupSessionId,
      pendingTimeoutSessionId: timedOutSessionId
    })) {
      return;
    }

    clearRecordingLimitTimer();
    cancelStopPendingWatchdog();
    recorderFailed = true;
    const stopped = safeStopRecorder('La grabación falló. No se guardó el clip; probá de nuevo con un clip más corto.');
    if (!stopped) {
      mediaRecorder = null;
      recordingStartedAt = null;
      activeRecordingLabel = null;
      recordedChunks = [];
      setCaptureStatus('La grabación falló. No se guardó el clip; probá de nuevo con un clip más corto.');
    }
    syncCaptureButtons();
  });

  try {
    recordingStartedAt = new Date();
    mediaRecorder.start();
    recordingSessionId = sessionId;
  } catch {
    mediaRecorder = null;
    recordingStartedAt = null;
    activeRecordingLabel = null;
    recordedChunks = [];
    recorderFailed = false;
    setCaptureStatus('Este navegador no pudo iniciar la grabación. Probá con otro navegador compatible o un clip más corto.');
    syncCaptureButtons();
    return;
  }

  recordingLimitTimer = window.setTimeout(() => {
    if (mediaRecorder === recorder && recorder.state === 'recording' && isCurrentRecordingSession(sessionId, {
      activeSessionId: recordingSessionId,
      cleanupSessionId,
      pendingTimeoutSessionId: timedOutSessionId
    })) {
      safeStopRecorder('Se alcanzó el límite de 15 segundos y la grabación se detuvo automáticamente.');
    }
  }, DEFAULT_RECORDING_LIMIT_MS);
  setCaptureStatus(`Grabando “${recordingLabel.label}”. La etiqueta quedó congelada hasta finalizar el clip.`);
  syncCaptureButtons();
}

function stopRecording() {
  safeStopRecorder('Grabación detenida. Preparando vista previa local.');
}

function toggleRecording() {
  if (stopPendingSessionId !== 0) {
    return;
  }
  if (mediaRecorder?.state === 'recording') {
    stopRecording();
    return;
  }
  startRecording();
}

function cleanupCapture() {
  cleanupSessionId = recordingSessionId;
  clearRecordingLimitTimer();
  cancelStopPendingWatchdog();
  safeStopRecorder();
  stopStreamTracks(activeStream);
  activeStream = null;
  recordedChunks = [];
  recordingStartedAt = null;
  activeRecordingLabel = null;
  recorderFailed = false;
  resetCameraPreview();
  invalidateSavedPreviewSelection();
  resetPendingCapture();
  clearRecordedPreview();
  setCaptureStatus('Cámara y grabación cerradas. La vista previa temporal se descartó; las señas guardadas siguen en este navegador.');
  syncCaptureButtons();
}

dictionaryCategorySelect.addEventListener('change', () => {
  const selection = changeDictionaryCategory(dictionaryCategorySelect.value);
  dictionaryCategorySelect.value = selection.category;
  input.value = '';
  populateDictionaryWordOptions(selection.entries);
  renderResult('');
  if (selection.category) {
    summary.textContent = `Elegí una palabra o frase de ${formatCategoryLabel(selection.category)}.`;
  }
});

dictionaryWordSelect.addEventListener('change', () => {
  const entry = resolveDictionaryEntry(dictionaryCategorySelect.value, dictionaryWordSelect.value);
  if (!entry) {
    renderResult('');
    summary.textContent = `Elegí una palabra o frase de ${formatCategoryLabel(dictionaryCategorySelect.value)}.`;
    return;
  }

  renderSelectedDictionaryEntry(entry);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  resetDictionarySelectors();
  renderResult(input.value);
});

for (const button of exampleButtons) {
  button.addEventListener('click', () => {
    input.value = button.dataset.example;
    input.focus();
    resetDictionarySelectors();
    renderResult(input.value);
  });
}

previousLessonButton.addEventListener('click', () => scrollLessonGallery(-1));
nextLessonButton.addEventListener('click', () => scrollLessonGallery(1));
lessonList.addEventListener('scroll', syncLessonGalleryControls, { passive: true });
window.addEventListener('resize', syncLessonGalleryControls);

previousVideoButton.addEventListener('click', () => {
  if (currentPlaybackIndex > 0) {
    currentPlaybackIndex -= 1;
    syncPlaybackControls();
  }
});

nextVideoButton.addEventListener('click', () => {
  if (currentPlaybackIndex < playbackSequence.length - 1) {
    currentPlaybackIndex += 1;
    syncPlaybackControls();
  }
});

sequenceVideo.addEventListener('error', () => {
  const item = currentPlaybackItem();
  const label = item?.entry?.displayLabel ?? 'seleccionado';
  setPlaybackStatus(`No se pudo cargar o decodificar el video de ${label}. Probá otra entrada o revisá el archivo del catálogo.`);
});

playCurrentVideoButton.addEventListener('click', async () => {
  const item = currentPlaybackItem();
  if (!item) {
    return;
  }

  syncPlaybackControls();
  try {
    await sequenceVideo.play();
  } catch {
    setPlaybackStatus('El navegador no pudo reproducir este video. Probá usar los controles nativos del reproductor.');
  }
});

startCameraButton.addEventListener('click', toggleCamera);
startRecordingButton.addEventListener('click', toggleRecording);
saveRecordingButton.addEventListener('click', () => { void savePendingRecording(); });
captureCategorySelect.addEventListener('change', () => {
  const selection = changeDictionaryCategory(captureCategorySelect.value);
  captureCategorySelect.value = selection.category;
  populateCatalogLabelOptions(selection.entries);
  syncCaptureButtons();
});
catalogLabelSelect.addEventListener('change', syncCaptureButtons);
customLabelInput.addEventListener('input', syncCaptureButtons);
function cleanupCaptureOnPageExit() {
  capturePageActive = false;
  cameraRequestId += 1;
  cameraRequestPending = false;
  cleanupCapture();
}

window.addEventListener('pagehide', cleanupCaptureOnPageExit);
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) {
    return;
  }
  capturePageActive = true;
  setCaptureStatus('La página se restauró. Podés iniciar la cámara cuando estés listo.');
  syncCaptureButtons();
});
window.addEventListener('beforeunload', cleanupCapture);

renderLessons();
renderPractice();
renderDictionarySelectorCategories();
renderCaptureCategoryOptions();
initializeCaptureSupport();
void loadSavedRecordings();
renderResult('');
