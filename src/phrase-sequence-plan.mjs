import { STARTER_CATALOG, lookupText } from './catalog.mjs';

function toLocalEntry(record, listIndex) {
  const id = typeof record?.id === 'string' ? record.id.trim() : '';
  const label = typeof record?.metadata?.label === 'string' ? record.metadata.label.trim() : '';

  if (!id || !label) return null;

  return {
    id: `local-recording:${id}`,
    label,
    aliases: [],
    localRecording: {
      id,
      label,
      createdAt: record.createdAt,
      listIndex
    }
  };
}

function createdAtTime(createdAt) {
  if (typeof createdAt !== 'string' && typeof createdAt !== 'number' && !(createdAt instanceof Date)) {
    return Number.NEGATIVE_INFINITY;
  }

  const time = new Date(createdAt).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function compareLocalRecordings(left, right) {
  const leftTime = createdAtTime(left.createdAt);
  const rightTime = createdAtTime(right.createdAt);
  if (leftTime !== rightTime) return rightTime > leftTime ? 1 : -1;

  const idDifference = left.id.localeCompare(right.id);
  if (idDifference !== 0) return idDifference;

  return left.listIndex - right.listIndex;
}

function isPlayableCatalogEntry(entry) {
  return typeof entry.videoPath === 'string' && entry.videoPath.trim() !== '';
}

/**
 * Builds a metadata-only phrase playback plan without reading browser storage or media.
 */
export function createPhraseSequencePlan(input, savedMetadataEntries, catalog = STARTER_CATALOG) {
  const localEntries = Array.isArray(savedMetadataEntries)
    ? savedMetadataEntries.map(toLocalEntry).filter(Boolean)
    : [];
  const result = lookupText(input, [...catalog, ...localEntries]);
  const sequence = [];

  for (const match of result.matches) {
    const playableCatalogEntries = match.entries.filter((entry) => !entry.localRecording && isPlayableCatalogEntry(entry));

    if (playableCatalogEntries.length > 0) {
      for (const entry of playableCatalogEntries) {
        sequence.push({
          kind: 'catalog',
          token: match.token,
          entry,
          source: entry.videoPath,
          position: sequence.length + 1
        });
      }
      continue;
    }

    const newestLocalRecording = match.entries
      .filter((entry) => entry.localRecording)
      .map((entry) => entry.localRecording)
      .sort(compareLocalRecordings)[0];

    if (newestLocalRecording) {
      sequence.push({
        kind: 'local',
        token: match.token,
        recordingId: newestLocalRecording.id,
        label: newestLocalRecording.label,
        position: sequence.length + 1
      });
    }
  }

  return {
    originalText: result.originalText,
    tokens: result.tokens,
    unknown: result.unknown,
    sequence
  };
}
