import {
  CATALOG_VERSION,
  STARTER_CATALOG,
  entriesByCategory,
  getPlayableSequence,
  lookupText
} from './catalog.mjs';

const form = document.querySelector('#lookup-form');
const input = document.querySelector('#lookup-input');
const summary = document.querySelector('#summary');
const recognizedList = document.querySelector('#recognized-list');
const unknownPanel = document.querySelector('#unknown-panel');
const unknownList = document.querySelector('#unknown-list');
const catalogList = document.querySelector('#catalog-list');
const exampleButtons = document.querySelectorAll('[data-example]');
const playbackStatus = document.querySelector('#playback-status');
const sequenceVideo = document.querySelector('#sequence-video');
const previousVideoButton = document.querySelector('#previous-video');
const playCurrentVideoButton = document.querySelector('#play-current-video');
const nextVideoButton = document.querySelector('#next-video');

let playbackSequence = [];
let currentPlaybackIndex = 0;
let skippedVideoCount = 0;

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

function renderCatalog() {
  clearChildren(catalogList);

  for (const group of entriesByCategory()) {
    const card = createElement('article', 'category-card');
    card.appendChild(createElement('h3', null, group.category));
    const list = document.createElement('ul');

    for (const entry of group.entries) {
      const item = document.createElement('li');
      item.textContent = entry.videoPath
        ? `${entry.displayLabel} — video declarado en catálogo`
        : `${entry.displayLabel} — pendiente de video`;
      list.appendChild(item);
    }

    card.appendChild(list);
    catalogList.appendChild(card);
  }
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

renderCatalog();
renderResult('');
