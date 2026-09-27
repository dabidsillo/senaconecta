import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_RECORDING_LIMIT_MS,
  DEFAULT_STOP_PENDING_TIMEOUT_MS,
  buildCaptureMetadata,
  chooseSupportedMimeType,
  createMetadataBlob,
  createSafeFileStem,
  createStopPendingWatchdog,
  freezeResolvedLabel,
  getCaptureSupport,
  isCurrentRecorderStopEvent,
  isCurrentRecordingSession,
  isResolvedLabelValid,
  mimeTypeDeclaresAudio,
  normalizeCustomLabel,
  resolveCaptureLabel,
  stopStreamTracks,
  streamHasAudioTracks
} from '../src/capture.mjs';

test('getCaptureSupport reports missing camera and recorder capabilities separately', () => {
  assert.deepEqual(getCaptureSupport({ navigator: {} }), {
    supported: false,
    reason: 'getUserMedia-unavailable',
    message: 'Este navegador no ofrece acceso a cámara con getUserMedia.'
  });

  assert.equal(getCaptureSupport({
    navigator: { mediaDevices: { getUserMedia() {} } }
  }).reason, 'mediaRecorder-unavailable');

  assert.equal(getCaptureSupport({
    navigator: { mediaDevices: { getUserMedia() {} } },
    MediaRecorder() {}
  }).supported, true);
});

test('chooseSupportedMimeType selects the first supported recorder format', () => {
  const recorder = {
    isTypeSupported(type) {
      return type === 'video/webm';
    }
  };

  assert.equal(chooseSupportedMimeType(recorder, ['video/mp4', 'video/webm']), 'video/webm');
  assert.equal(chooseSupportedMimeType({}, ['video/webm']), '');
});

test('chooseSupportedMimeType avoids audio codecs for video-only streams', () => {
  const checked = [];
  const recorder = {
    isTypeSupported(type) {
      checked.push(type);
      return type === 'video/webm;codecs=vp8';
    }
  };

  assert.equal(chooseSupportedMimeType(recorder, {
    hasAudio: false,
    candidates: ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8']
  }), 'video/webm;codecs=vp8');
  assert.deepEqual(checked, ['video/webm;codecs=vp8']);
  assert.equal(mimeTypeDeclaresAudio('video/webm;codecs=vp9,opus'), true);
  assert.equal(mimeTypeDeclaresAudio('video/webm;codecs=vp8'), false);
});

test('chooseSupportedMimeType permits audio codecs only when the stream has audio', () => {
  const recorder = {
    isTypeSupported(type) {
      return type === 'video/webm;codecs=vp8,opus';
    }
  };

  assert.equal(chooseSupportedMimeType(recorder, {
    hasAudio: true,
    candidates: ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8']
  }), 'video/webm;codecs=vp8,opus');
});

test('chooseSupportedMimeType falls back only to plain webm or browser default for video-only streams', () => {
  const recorder = {
    isTypeSupported(type) {
      return type === 'video/webm';
    }
  };

  assert.equal(chooseSupportedMimeType(recorder, {
    hasAudio: false,
    candidates: ['video/webm;codecs=vp8,opus', 'video/webm']
  }), 'video/webm');

  assert.equal(chooseSupportedMimeType(recorder, {
    hasAudio: false,
    candidates: ['video/webm;codecs=vp8,opus']
  }), '');
});

test('streamHasAudioTracks detects whether MIME selection may declare audio', () => {
  assert.equal(streamHasAudioTracks({ getAudioTracks: () => [{}] }), true);
  assert.equal(streamHasAudioTracks({ getAudioTracks: () => [] }), false);
  assert.equal(streamHasAudioTracks(null), false);
});

test('resolveCaptureLabel prefers an explicit custom label over catalog selection', () => {
  assert.deepEqual(resolveCaptureLabel({
    catalogId: 'daily-water',
    catalogLabel: 'Agua',
    customLabel: '  Seña nueva   de prueba  '
  }), {
    label: 'Seña nueva de prueba',
    source: 'custom',
    catalogId: null
  });

  assert.deepEqual(resolveCaptureLabel({ catalogId: 'daily-water', catalogLabel: 'Agua' }), {
    label: 'Agua',
    source: 'catalog',
    catalogId: 'daily-water'
  });

  assert.equal(isResolvedLabelValid(resolveCaptureLabel()), false);
});

test('normalizeCustomLabel bounds free text labels for metadata and filenames', () => {
  assert.equal(normalizeCustomLabel('  hola\n\t escuela   '), 'hola escuela');
  assert.equal(normalizeCustomLabel('x'.repeat(100)).length, 80);
});

test('freezeResolvedLabel snapshots a valid label for recording metadata', () => {
  const source = { label: '  Agua  ', source: 'catalog', catalogId: 'daily-water' };
  const frozen = freezeResolvedLabel(source);
  source.label = 'Familia';

  assert.deepEqual(frozen, {
    label: 'Agua',
    source: 'catalog',
    catalogId: 'daily-water'
  });
  assert.equal(Object.isFrozen(frozen), true);
  assert.deepEqual(freezeResolvedLabel({ label: '', source: 'custom' }), {
    label: '',
    source: 'missing',
    catalogId: null
  });
});

test('createSafeFileStem produces accent-free deterministic download names', () => {
  assert.equal(
    createSafeFileStem({ label: 'Água nueva!', recordedAt: new Date('2024-01-02T03:04:05.006Z') }),
    'lsb-capture-agua-nueva-2024-01-02T03-04-05-006Z'
  );
});

test('DEFAULT_RECORDING_LIMIT_MS caps recordings at fifteen seconds', () => {
  assert.equal(DEFAULT_RECORDING_LIMIT_MS, 15000);
});

test('DEFAULT_STOP_PENDING_TIMEOUT_MS bounds a missing recorder stop event', () => {
  assert.equal(DEFAULT_STOP_PENDING_TIMEOUT_MS, 3000);
});

test('createStopPendingWatchdog times out and cancels deterministically', () => {
  const timers = new Map();
  const cleared = [];
  const timedOut = [];
  let nextTimerId = 1;
  const watchdog = createStopPendingWatchdog({
    setTimeout(callback, delay) {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) {
      cleared.push(id);
      timers.delete(id);
    },
    timeoutMs: 25,
    onTimeout(sessionId) {
      timedOut.push(sessionId);
    }
  });

  watchdog.arm(7);
  assert.equal(watchdog.pendingSessionId, 7);
  assert.equal(timers.get(1).delay, 25);
  assert.equal(watchdog.cancel(8), false);
  assert.equal(watchdog.pendingSessionId, 7);
  assert.equal(watchdog.cancel(7), true);
  assert.equal(watchdog.pendingSessionId, 0);
  assert.deepEqual(cleared, [1]);

  watchdog.arm(9);
  timers.get(2).callback();
  assert.equal(watchdog.pendingSessionId, 0);
  assert.deepEqual(timedOut, [9]);
});

test('isCurrentRecordingSession rejects stale cleanup and timed-out recorder events', () => {
  assert.equal(isCurrentRecordingSession(3, { activeSessionId: 3, cleanupSessionId: 2 }), true);
  assert.equal(isCurrentRecordingSession(2, { activeSessionId: 3, cleanupSessionId: 2 }), false);
  assert.equal(isCurrentRecordingSession(3, { activeSessionId: 4, cleanupSessionId: 2 }), false);
  assert.equal(isCurrentRecordingSession(3, {
    activeSessionId: 3,
    cleanupSessionId: 2,
    pendingTimeoutSessionId: 3
  }), false);
});

test('isCurrentRecorderStopEvent rejects stale recorder identity before session cleanup', () => {
  const oldRecorder = { id: 'old' };
  const newRecorder = { id: 'new' };
  const currentChunks = [{ size: 42 }];

  assert.equal(isCurrentRecorderStopEvent({
    sessionId: 7,
    recorder: oldRecorder,
    activeRecorder: newRecorder,
    activeSessionId: 8,
    cleanupSessionId: 7,
    pendingTimeoutSessionId: 7
  }), false);
  assert.deepEqual(currentChunks, [{ size: 42 }]);

  assert.equal(isCurrentRecorderStopEvent({
    sessionId: 8,
    recorder: newRecorder,
    activeRecorder: newRecorder,
    activeSessionId: 8,
    cleanupSessionId: 7,
    pendingTimeoutSessionId: 0
  }), true);
});

test('buildCaptureMetadata states capture purpose without claiming translation', () => {
  const metadata = buildCaptureMetadata({
    catalogVersion: 'starter-placeholder-v1',
    resolvedLabel: { label: 'Agua', source: 'catalog', catalogId: 'daily-water' },
    mimeType: 'video/webm',
    sizeBytes: 1234,
    durationMs: 1499.8,
    startedAt: new Date('2024-01-02T03:04:05.000Z'),
    endedAt: new Date('2024-01-02T03:04:06.500Z'),
    recordingLimitMs: 15000
  });

  assert.equal(metadata.purpose, 'training-and-evaluation-sample');
  assert.match(metadata.warning, /no es una traducción/);
  assert.equal(metadata.upload, 'none');
  assert.equal(metadata.storage, 'browser-memory-until-explicit-download');
  assert.equal(metadata.durationMs, 1500);
});

test('createMetadataBlob serializes readable JSON metadata for explicit download', async () => {
  const blob = createMetadataBlob({ label: 'Agua', upload: 'none' });

  assert.equal(blob.type, 'application/json');
  assert.deepEqual(JSON.parse(await blob.text()), { label: 'Agua', upload: 'none' });
});

test('stopStreamTracks stops every available track and tolerates missing streams', () => {
  let stopped = 0;
  const stream = {
    getTracks() {
      return [{ stop: () => { stopped += 1; } }, { stop: () => { stopped += 1; } }];
    }
  };

  assert.equal(stopStreamTracks(stream), 2);
  assert.equal(stopped, 2);
  assert.equal(stopStreamTracks(null), 0);
});
