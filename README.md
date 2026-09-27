# LSB school MVP — dictionary slice

This work-unit snapshot runs only the mobile-first Spanish dictionary shell for the bundled starter catalog. It supports text lookup, safe result rendering, ordered playback controls for entries that later declare videos, and clear missing-video states for the current placeholder catalog.

The bundled entries are illustrative catalog labels, not validated Bolivian Sign Language claims. This slice does not include lessons, camera capture, automatic sign recognition, accounts, analytics, uploads, or browser-persistent storage.

## Run locally

1. From this directory run `python3 -m http.server 8000`.
2. Open `http://localhost:8000` in a modern browser.
3. Search examples such as `Hola estudiante`, `Gracias por el agua`, or `Familia y libro`.

Avoid `file://` because browser JavaScript modules may be blocked. A static local server is enough for this dictionary-only slice.

## Catalog and videos

The dictionary reads `src/catalog.mjs`. Current starter entries intentionally have `videoPath: null`, so the UI shows “Video no disponible” instead of fabricating movement.

When a future reviewed recording exists, add the video asset in the deployed site and update the matching catalog entry with a real `videoPath`. Only change validation wording after actual review by qualified LSB creators or collaborators.

## Future slices

Beginner lessons and labeled camera capture are planned as separate verifiable work units. They are not linked from this snapshot because they are outside the dictionary slice.

## Checks

Run the focused checks for this slice:

```sh
node --test tests/catalog.test.mjs
node --check src/app.js
```

A real browser walkthrough is still needed to observe responsive layout and native video error behavior.
