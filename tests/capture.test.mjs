import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_RECORDING_LIMIT_MS,
  buildCaptureMetadata,
  chooseSupportedMimeType,
  createMetadataBlob,
  createSafeFileStem,
  freezeResolvedLabel,
  getCaptureSupport,
  isResolvedLabelValid,
  normalizeCustomLabel,
  resolveCaptureLabel,
  stopStreamTracks
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
