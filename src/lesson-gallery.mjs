export const GALLERY_SCROLL_TOLERANCE_PX = 2;

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function clampGalleryScrollLeft(scrollLeft, maxScrollLeft) {
  return Math.min(Math.max(finiteNumber(scrollLeft), 0), Math.max(finiteNumber(maxScrollLeft), 0));
}

export function getGalleryBoundaries({
  scrollLeft,
  clientWidth,
  scrollWidth,
  tolerance = GALLERY_SCROLL_TOLERANCE_PX
} = {}) {
  const maxScrollLeft = Math.max(finiteNumber(scrollWidth) - finiteNumber(clientWidth), 0);
  const clampedScrollLeft = clampGalleryScrollLeft(scrollLeft, maxScrollLeft);
  const safeTolerance = Math.max(finiteNumber(tolerance), 0);

  return {
    scrollLeft: clampedScrollLeft,
    maxScrollLeft,
    atStart: clampedScrollLeft <= safeTolerance,
    atEnd: clampedScrollLeft >= maxScrollLeft - safeTolerance
  };
}

export function getNextGalleryTarget({
  scrollLeft,
  cardOffsets = [],
  direction,
  clientWidth,
  scrollWidth,
  tolerance = GALLERY_SCROLL_TOLERANCE_PX
} = {}) {
  const boundaries = getGalleryBoundaries({ scrollLeft, clientWidth, scrollWidth, tolerance });
  const safeTolerance = Math.max(finiteNumber(tolerance), 0);
  const offsets = cardOffsets
    .filter(Number.isFinite)
    .map((offset) => clampGalleryScrollLeft(offset, boundaries.maxScrollLeft))
    .sort((left, right) => left - right);

  if (direction > 0) {
    return offsets.find((offset) => offset > boundaries.scrollLeft + safeTolerance) ?? boundaries.maxScrollLeft;
  }

  if (direction < 0) {
    return [...offsets].reverse().find((offset) => offset < boundaries.scrollLeft - safeTolerance) ?? 0;
  }

  return boundaries.scrollLeft;
}
