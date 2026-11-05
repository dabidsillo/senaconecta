import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getGalleryBoundaries,
  getNextGalleryTarget
} from '../src/lesson-gallery.mjs';

test('gallery boundaries clamp scroll positions and tolerate small rounding differences', () => {
  const boundaries = getGalleryBoundaries({
    scrollLeft: 198.5,
    clientWidth: 100,
    scrollWidth: 300,
    tolerance: 2
  });

  assert.deepEqual(boundaries, {
    scrollLeft: 198.5,
    maxScrollLeft: 200,
    atStart: false,
    atEnd: true
  });

  assert.equal(getGalleryBoundaries({
    scrollLeft: -8,
    clientWidth: 100,
    scrollWidth: 300
  }).scrollLeft, 0);
});

test('gallery boundaries disable both directions with no overflow or no cards', () => {
  assert.deepEqual(getGalleryBoundaries({
    scrollLeft: 0,
    clientWidth: 320,
    scrollWidth: 320
  }), {
    scrollLeft: 0,
    maxScrollLeft: 0,
    atStart: true,
    atEnd: true
  });
});

test('gallery targets move one card at a time and clamp at first and last cards', () => {
  const layout = {
    cardOffsets: [0, 120, 240],
    clientWidth: 100,
    scrollWidth: 340
  };

  assert.equal(getNextGalleryTarget({ ...layout, scrollLeft: 0, direction: -1 }), 0);
  assert.equal(getNextGalleryTarget({ ...layout, scrollLeft: 0, direction: 1 }), 120);
  assert.equal(getNextGalleryTarget({ ...layout, scrollLeft: 120, direction: 1 }), 240);
  assert.equal(getNextGalleryTarget({ ...layout, scrollLeft: 240, direction: 1 }), 240);
  assert.equal(getNextGalleryTarget({ ...layout, scrollLeft: 240, direction: -1 }), 120);
});

test('gallery targets ignore nearby card offsets and handle an empty layout', () => {
  assert.equal(getNextGalleryTarget({
    scrollLeft: 120.5,
    cardOffsets: [0, 120, 240],
    direction: 1,
    clientWidth: 100,
    scrollWidth: 340,
    tolerance: 2
  }), 240);

  assert.equal(getNextGalleryTarget({
    scrollLeft: 0,
    cardOffsets: [],
    direction: 1,
    clientWidth: 100,
    scrollWidth: 100
  }), 0);
});
