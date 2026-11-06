export function revealAndPlaySavedPreview(video) {
  video.scrollIntoView?.({ block: 'center' });
  video.focus?.({ preventScroll: true });

  try {
    const playResult = video.play?.();
    if (!playResult || typeof playResult.then !== 'function') {
      return Promise.resolve({ outcome: video.play ? 'playing' : 'failed' });
    }

    return playResult.then(
      () => ({ outcome: 'playing' }),
      (error) => ({ outcome: getPlaybackFailureOutcome(error) })
    );
  } catch (error) {
    return Promise.resolve({ outcome: getPlaybackFailureOutcome(error) });
  }
}

function getPlaybackFailureOutcome(error) {
  if (error?.name === 'NotAllowedError') return 'blocked';
  if (error?.name === 'NotSupportedError') return 'unsupported';
  return 'failed';
}
