export function getLocalDictionaryViewState({
  tokens = [],
  localRecognized = [],
  loading = false,
  unavailable = false
} = {}) {
  const isFreeTextSearch = Array.isArray(tokens) && tokens.length > 0;
  const matches = Array.isArray(localRecognized) ? localRecognized : [];

  if (!isFreeTextSearch) {
    return { visible: false, message: '', matches: [] };
  }

  if (loading) {
    return {
      visible: true,
      message: 'Buscando señas guardadas en este navegador…',
      matches
    };
  }

  if (unavailable) {
    return {
      visible: true,
      message: 'Las señas guardadas no están disponibles en este navegador. Los resultados del catálogo siguen disponibles.',
      matches: []
    };
  }

  return {
    visible: true,
    message: matches.length > 0
      ? `${matches.length} coincidencia(s) guardada(s) solo en este navegador.`
      : 'No hay señas guardadas que coincidan con esta búsqueda.',
    matches
  };
}
