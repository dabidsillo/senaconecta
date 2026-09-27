const DEFAULT_MIME_TYPES = Object.freeze([
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=h264,opus',
  'video/webm',
  'video/mp4'
]);

export const DEFAULT_RECORDING_LIMIT_MS = 15000;

export function getCaptureSupport(environment = globalThis) {
  const navigatorRef = environment.navigator;
  const mediaDevices = navigatorRef?.mediaDevices;
  const MediaRecorderCtor = environment.MediaRecorder;

  if (!mediaDevices?.getUserMedia) {
    return {
      supported: false,
      reason: 'getUserMedia-unavailable',
      message: 'Este navegador no ofrece acceso a cámara con getUserMedia.'
    };
  }

  if (typeof MediaRecorderCtor !== 'function') {
    return {
      supported: false,
      reason: 'mediaRecorder-unavailable',
      message: 'Este navegador permite cámara, pero no puede grabar video con MediaRecorder.'
    };
  }

  return {
    supported: true,
    reason: 'supported',
    message: 'La cámara y la grabación parecen disponibles en este navegador.'
  };
}

export function chooseSupportedMimeType(mediaRecorder, candidates = DEFAULT_MIME_TYPES) {
  const isTypeSupported = mediaRecorder?.isTypeSupported;
  if (typeof isTypeSupported !== 'function') {
    return '';
  }

  return candidates.find((type) => isTypeSupported.call(mediaRecorder, type)) ?? '';
}

export function normalizeCustomLabel(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export function resolveCaptureLabel({ catalogId = '', catalogLabel = '', customLabel = '' } = {}) {
  const cleanedCustomLabel = normalizeCustomLabel(customLabel);
  if (cleanedCustomLabel) {
    return {
      label: cleanedCustomLabel,
      source: 'custom',
      catalogId: null
    };
  }

  const cleanedCatalogLabel = normalizeCustomLabel(catalogLabel);
  if (catalogId && cleanedCatalogLabel) {
    return {
      label: cleanedCatalogLabel,
      source: 'catalog',
      catalogId
    };
  }

  return {
    label: '',
    source: 'missing',
    catalogId: null
  };
}

export function isResolvedLabelValid(resolvedLabel) {
  return Boolean(resolvedLabel?.label && resolvedLabel.source !== 'missing');
}

export function freezeResolvedLabel(resolvedLabel) {
  const label = normalizeCustomLabel(resolvedLabel?.label);
  const source = ['catalog', 'custom'].includes(resolvedLabel?.source) && label
    ? resolvedLabel.source
    : 'missing';

  return Object.freeze({
    label: source === 'missing' ? '' : label,
    source,
    catalogId: source === 'catalog' && resolvedLabel?.catalogId ? String(resolvedLabel.catalogId) : null
  });
}

export function createSafeFileStem({ label, recordedAt = new Date() } = {}) {
  const date = recordedAt instanceof Date && !Number.isNaN(recordedAt.valueOf())
    ? recordedAt.toISOString()
    : new Date(0).toISOString();
  const safeDate = date.replace(/[:.]/g, '-');
  const safeLabel = normalizeCustomLabel(label)
    .toLocaleLowerCase('es-BO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'sin-etiqueta';

  return `lsb-capture-${safeLabel}-${safeDate}`;
}

export function buildCaptureMetadata({
  catalogVersion,
  resolvedLabel,
  mimeType,
  sizeBytes,
  durationMs,
  startedAt,
  endedAt,
  recordingLimitMs
} = {}) {
  return {
    schemaVersion: 1,
    purpose: 'training-and-evaluation-sample',
    warning: 'Esta captura etiquetada no es una traducción ni reconocimiento automático de señas.',
    catalogVersion: String(catalogVersion ?? ''),
    label: resolvedLabel?.label ?? '',
    labelSource: resolvedLabel?.source ?? 'missing',
    catalogId: resolvedLabel?.catalogId ?? null,
    mimeType: String(mimeType ?? ''),
    sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : 0,
    durationMs: Number.isFinite(durationMs) ? Math.max(0, Math.round(durationMs)) : 0,
    recordingLimitMs: Number.isFinite(recordingLimitMs) ? Math.max(0, Math.round(recordingLimitMs)) : 0,
    startedAt: startedAt instanceof Date ? startedAt.toISOString() : null,
    endedAt: endedAt instanceof Date ? endedAt.toISOString() : null,
    storage: 'browser-memory-until-explicit-download',
    upload: 'none'
  };
}

export function stopStreamTracks(stream) {
  const tracks = stream?.getTracks?.() ?? [];
  for (const track of tracks) {
    if (typeof track.stop === 'function') {
      track.stop();
    }
  }
  return tracks.length;
}

export function createMetadataBlob(metadata, BlobCtor = globalThis.Blob) {
  return new BlobCtor([`${JSON.stringify(metadata, null, 2)}\n`], { type: 'application/json' });
}
