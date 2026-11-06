import { STARTER_CATALOG, lookupText } from './catalog.mjs';

function toLocalEntry(record) {
  const rawId = record?.id;
  const rawLabel = record?.metadata?.label;

  if (typeof rawId !== 'string' || typeof rawLabel !== 'string') {
    return null;
  }

  const id = rawId.trim();
  const label = rawLabel.trim();

  if (!id || !label) {
    return null;
  }

  return {
    id: `local-recording:${id}`,
    label,
    aliases: [],
    localRecording: {
      id,
      label,
      createdAt: record.createdAt
    }
  };
}

/**
 * Searches curated vocabulary and saved recording labels without loading media.
 */
export function lookupWithLocalRecordings(input, savedMetadataEntries, catalog = STARTER_CATALOG) {
  const localEntries = Array.isArray(savedMetadataEntries)
    ? savedMetadataEntries.map(toLocalEntry).filter(Boolean)
    : [];
  const result = lookupText(input, [...catalog, ...localEntries]);
  const curatedRecognized = [];
  const localRecognized = [];

  for (const item of result.recognized) {
    if (item.entry.localRecording) {
      localRecognized.push({
        token: item.token,
        ...item.entry.localRecording
      });
    } else {
      curatedRecognized.push(item);
    }
  }

  return {
    originalText: result.originalText,
    tokens: result.tokens,
    curatedRecognized,
    localRecognized,
    unknown: result.unknown
  };
}
