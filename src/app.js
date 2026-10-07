import {
  CATALOG_VERSION,
  STARTER_CATALOG,
  getPlayableSequence,
  lookupText
} from './catalog.mjs';
import {
  answerPracticeStep,
  buildBeginnerLessons,
  createPracticeSession,
  getPracticePrompt
} from './lessons.mjs';
import {
  DEFAULT_RECORDING_LIMIT_MS,
  DEFAULT_STOP_PENDING_TIMEOUT_MS,
  buildCaptureMetadata,
  chooseSupportedMimeType,
  createMetadataBlob,
  createSafeFileStem,
  freezeResolvedLabel,
  getCaptureSupport,
  isCurrentRecorderStopEvent,
  isCurrentRecordingSession,
  isResolvedLabelValid,
  resolveCaptureLabel,
  stopStreamTracks,
  streamHasAudioTracks
} from './capture.mjs';

const form = document.querySelector('#lookup-form');
const input = document.querySelector('#lookup-input');
const summary = document.querySelector('#summary');
const recognizedList = document.querySelector('#recognized-list');
const unknownPanel = document.querySelector('#unknown-panel');
const unknownList = document.querySelector('#unknown-list');
const exampleButtons = document.querySelectorAll('[data-example]');
const playbackStatus = document.querySelector('#playback-status');
const sequenceVideo = document.querySelector('#sequence-video');
const previousVideoButton = document.querySelector('#previous-video');
const playCurrentVideoButton = document.querySelector('#play-current-video');
const nextVideoButton = document.querySelector('#next-video');
const lessonList = document.querySelector('#lesson-list');
const practiceTitle = document.querySelector('#practice-title');
const practiceStatus = document.querySelector('#practice-status');
const practiceCard = document.querySelector('#practice-card');
const captureSupport = document.querySelector('#capture-support');
const catalogLabelSelect = document.querySelector('#catalog-label');
const customLabelInput = document.querySelector('#custom-label');
const cameraPreview = document.querySelector('#camera-preview');
const cameraPlaceholder = document.querySelector('#camera-placeholder');
const recordedPreview = document.querySelector('#recorded-preview');
const recordedPlaceholder = document.querySelector('#recorded-placeholder');
const startCameraButton = document.querySelector('#start-camera');
const startRecordingButton = document.querySelector('#start-recording');
const stopRecordingButton = document.querySelector('#stop-recording');
const captureStatus = document.querySelector('#capture-status');
const downloadVideoLink = document.querySelector('#download-video');
const downloadMetadataLink = document.querySelector('#download-metadata');
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
let recordingObjectUrl = null;
let metadataObjectUrl = null;
let selectedMimeType = '';
let recorderFailed = false;
let activeRecordingLabel = null;
let recordingSessionId = 0;
let cleanupSessionId = 0;
let timedOutSessionId = 0;
let captureIsSupported = false;

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

function renderRecognized(result) {
  clearChildren(recognizedList);

  for (const item of result.recognized) {
    const card = createElement('article', 'sign-card');
    card.setAttribute('tabindex', '0');

    const header = createElement('div', 'card-header');
    const titleGroup = createElement('div');
    titleGroup.appendChild(createElement('h3', null, item.entry.displayLabel));
    titleGroup.appendChild(createElement('p', 'meta', `Token reconocido: ${item.token}`));
    header.appendChild(titleGroup);
    header.appendChild(createElement('span', 'badge', item.entry.category));
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
    summary.textContent = `Catálogo ${CATALOG_VERSION}: ${STARTER_CATALOG.length} etiquetas iniciales disponibles para búsqueda textual.`;
  } else {
    summary.textContent = `${recognizedCount} palabra(s) reconocida(s) y ${unknownCount} sin coincidencia, respetando el orden escrito.`;
  }

  preparePlayback(result);
  renderRecognized(result);
  renderUnknown(result);
}

function selectLesson(lesson) {
  selectedLesson = lesson;
  practiceSession = createPracticeSession(lesson);
  renderLessons();
  renderPractice();
}

function renderLessons() {
  clearChildren(lessonList);

  for (const lesson of beginnerLessons) {
    const card = createElement('article', 'lesson-card');
    if (lesson.id === selectedLesson?.id) {
      card.classList.add('is-active');
    }

    card.appendChild(createElement('p', 'eyebrow', `Lección ${lesson.position}`));
    card.appendChild(createElement('h3', null, lesson.title));
    card.appendChild(createElement('p', 'meta', lesson.summary));

    const list = document.createElement('ul');
    for (const entry of lesson.entries) {
      const item = document.createElement('li');
      item.textContent = entry.displayLabel;
      list.appendChild(item);
    }
    card.appendChild(list);
    card.appendChild(createElement('p', 'unavailable', lesson.validationNote));

    const actions = createElement('div', 'lesson-actions');
    const startButton = createElement('button', null, lesson.id === selectedLesson?.id ? 'Reiniciar práctica' : 'Practicar esta categoría');
    startButton.type = 'button';
    startButton.addEventListener('click', () => selectLesson(lesson));
    actions.appendChild(startButton);
    card.appendChild(actions);

    lessonList.appendChild(card);
  }
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
  return STARTER_CATALOG.find((entry) => entry.id === catalogLabelSelect.value) ?? null;
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
  const labelIsReady = isResolvedLabelValid(currentResolvedLabel());
  const recorderIsBusy = mediaRecorder?.state === 'recording' || stopPendingSessionId !== 0;
  startRecordingButton.disabled = !captureIsSupported || !activeStream || recorderIsBusy || !labelIsReady;
  stopRecordingButton.disabled = mediaRecorder?.state !== 'recording' || stopPendingSessionId !== 0;
  startCameraButton.disabled = !captureIsSupported || recorderIsBusy;
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

function revokeCaptureUrls() {
  if (recordingObjectUrl) {
    URL.revokeObjectURL(recordingObjectUrl);
    recordingObjectUrl = null;
  }
  if (metadataObjectUrl) {
    URL.revokeObjectURL(metadataObjectUrl);
    metadataObjectUrl = null;
  }
}

function resetRecordedPreview() {
  revokeCaptureUrls();
  recordedPreview.pause?.();
  recordedPreview.hidden = true;
  recordedPreview.removeAttribute('src');
  recordedPreview.load();
  recordedPlaceholder.hidden = false;
  downloadVideoLink.hidden = true;
  downloadVideoLink.removeAttribute('href');
  downloadMetadataLink.hidden = true;
  downloadMetadataLink.removeAttribute('href');
  metadataPreview.hidden = true;
  metadataPreview.textContent = '';
}

function renderCatalogLabelOptions() {
  clearChildren(catalogLabelSelect);
  for (const entry of STARTER_CATALOG) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = `${entry.displayLabel} — ${entry.category}`;
    catalogLabelSelect.appendChild(option);
  }
}

function initializeCaptureSupport() {
  const support = getCaptureSupport(window);
  captureIsSupported = support.supported;
  captureSupport.textContent = support.supported
    ? 'Cámara y grabación disponibles: iniciá la cámara cuando estés listo para pedir permiso.'
    : support.message;
  syncCaptureButtons();
}

async function startCamera() {
  resetRecordedPreview();
  stopStreamTracks(activeStream);
  activeStream = null;
  const support = getCaptureSupport(window);
  if (!support.supported) {
    captureSupport.textContent = support.message;
    syncCaptureButtons();
    return;
  }

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }
    });
    cameraPreview.srcObject = activeStream;
    cameraPreview.hidden = false;
    cameraPlaceholder.hidden = true;
    await cameraPreview.play();
    setCaptureStatus('Cámara activa. Elegí una etiqueta clara y grabá un clip corto de movimiento.');
  } catch (error) {
    stopStreamTracks(activeStream);
    activeStream = null;
    resetCameraPreview();
    const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
    setCaptureStatus(denied
      ? 'Permiso de cámara denegado o contexto no seguro. Usá HTTPS/localhost y concedé permiso si querés grabar.'
      : 'No se pudo iniciar la cámara en este dispositivo. Revisá permisos, disponibilidad y navegador.');
  } finally {
    syncCaptureButtons();
  }
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
  const fileStem = createSafeFileStem({ label: resolvedLabel.label, recordedAt: endedAt });
  const metadataBlob = createMetadataBlob(metadata);

  revokeCaptureUrls();
  recordingObjectUrl = URL.createObjectURL(videoBlob);
  metadataObjectUrl = URL.createObjectURL(metadataBlob);

  recordedPreview.src = recordingObjectUrl;
  recordedPreview.hidden = false;
  recordedPlaceholder.hidden = true;
  downloadVideoLink.href = recordingObjectUrl;
  downloadVideoLink.download = `${fileStem}.${videoBlob.type.includes('mp4') ? 'mp4' : 'webm'}`;
  downloadVideoLink.hidden = false;
  downloadMetadataLink.href = metadataObjectUrl;
  downloadMetadataLink.download = `${fileStem}.json`;
  downloadMetadataLink.hidden = false;
  metadataPreview.textContent = JSON.stringify(metadata, null, 2);
  metadataPreview.hidden = false;
  setCaptureStatus('Clip listo en memoria temporal. Descargá el video y el JSON; nada se subió ni quedó guardado permanentemente.');
  recordedChunks = [];
  syncCaptureButtons();
}

function startRecording() {
  const resolvedLabel = currentResolvedLabel();
  if (!activeStream || !isResolvedLabelValid(resolvedLabel)) {
    setCaptureStatus('Antes de grabar necesitás cámara activa y una etiqueta del catálogo o personalizada.');
    return;
  }

  const recordingLabel = freezeResolvedLabel(resolvedLabel);
  resetRecordedPreview();
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
  safeStopRecorder('Grabación detenida. Preparando vista previa y descargas explícitas.');
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
  resetRecordedPreview();
  setCaptureStatus('Cámara y grabación cerradas. Los clips no descargados se descartaron al salir.');
  syncCaptureButtons();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderResult(input.value);
});

for (const button of exampleButtons) {
  button.addEventListener('click', () => {
    input.value = button.dataset.example;
    input.focus();
    renderResult(input.value);
  });
}

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

startCameraButton.addEventListener('click', startCamera);
startRecordingButton.addEventListener('click', startRecording);
stopRecordingButton.addEventListener('click', stopRecording);
catalogLabelSelect.addEventListener('change', syncCaptureButtons);
customLabelInput.addEventListener('input', syncCaptureButtons);
window.addEventListener('pagehide', cleanupCapture);
window.addEventListener('beforeunload', cleanupCapture);

renderLessons();
renderPractice();
renderCatalogLabelOptions();
initializeCaptureSupport();
renderResult('');
