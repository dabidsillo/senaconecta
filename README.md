# Tinku MVP — dictionary, lessons, and local capture

Tinku is a mobile-first Spanish prototype for exploring textual vocabulary, practicing by category, and optionally recording a short labeled clip. The shared catalog has **45 text labels in 9 categories**. They are supplied vocabulary labels, not validated Bolivian Sign Language claims.

The dictionary search and practice are temporary: search does not store queries, and practice restarts after a reload. A recorded clip is different: after recording, use **Guardar seña** explicitly to save the clip and its frozen label in IndexedDB for this browser origin. Saved clips remain available after reloads in that same browser until you delete them or the browser evicts its storage. You can play or delete each saved clip from the local list.

No video or JSON files are downloaded. Tinku does not create accounts, use a backend, upload clips, or automatically promote a saved clip into the catalog. It does not translate signs, recognize movement, or validate a sign.

**Student guide (no programming required): [docs/guia-para-estudiantes.md](docs/guia-para-estudiantes.md).** **Learn the page block by block in Spanish: [docs/codigo-html-paso-a-paso.md](docs/codigo-html-paso-a-paso.md).** Beginner project guide: [docs/guia-del-proyecto.md](docs/guia-del-proyecto.md). Defense guide: [docs/guia-de-defensa.md](docs/guia-de-defensa.md).

## Catalog: exact labels

| Category | Labels |
| --- | --- |
| ALIMENTOS | Arroz, Café, Fideo, Leche, Pan |
| ANIMALES | Cóndor, Gallina, Gato, Perro, Vaca |
| COLORES | Amarillo, Azul, Rojo, Verde |
| DEPARTAMENTOS | Beni, La Paz, Oruro, Potosí, Santa Cruz |
| DÍAS DE LA SEMANA | Jueves, Lunes, Martes, Miércoles, Viernes |
| FAMILIA | Bebé, Hija, Hijo, Mamá, Papá |
| FRUTAS | Guineo, Manzana, Naranja, Piña, Plátano |
| LUGARES | Baño, Casa, Escuela, Hospital, Mercado |
| SALUDOS | Chau, Gracias, Hola, Lo siento, Por favor, Te amo |

Every current entry in `src/catalog.mjs` has `videoPath: null` and `validationStatus: 'placeholder'`. The UI therefore shows an unavailable-video state; it does not link to or publish creator sign videos. Do not claim that this repository hosts videos or that a site launch has been verified.

## Run locally

1. From this directory run `python3 -m http.server 8000 --bind 127.0.0.1`.
2. Open `http://localhost:8000` in a modern browser.
3. In **Diccionario**, choose a category and label, or use the suggested searches `Hola, mamá`, `Lo siento, papá`, and `Por favor, amigo`. The last one intentionally leaves `amigo` unmatched.
4. In **Lecciones**, move through the 9 categories and answer text-only practice prompts. Reload to see that practice progress resets.
5. In **Cámara**, choose for example `Familia` → `Papá`, or enter a custom label. Allow camera access only if you choose to record. A recording stops after at most 15 seconds; then select **Guardar seña** if you want to retain it locally.

### Windows (double-click)

1. Install Python 3 if it is not already available (`py -3` preferred; `python.exe` also works).
2. Double-click `iniciar-tinku.bat` in the project root. It works even when launched from another working directory.
3. The launcher opens `http://127.0.0.1:8000/` only after Python binds the local server to `127.0.0.1:8000`; it does not expose the site to the LAN. Leave the console open while using the site, and close it to stop serving.
4. Allow camera access in your browser only if you choose to record. If Python is missing or port 8000 is busy, the console shows an error instead of opening the browser.

The Windows launcher has not yet been tested on a Windows machine. Avoid `file://` because browser JavaScript modules and camera APIs may be blocked. Camera access generally requires `localhost` or HTTPS. Binding the local server to `127.0.0.1` keeps the repository off the LAN by default.

## Local capture and privacy

The capture tool records at most 15 seconds per clip. Select a catalog label or enter a custom one; the active label is frozen when recording starts. After the clip is ready, it is only a temporary preview until you explicitly choose **Guardar seña**.

Saving stores the video Blob and metadata in IndexedDB, scoped to this browser and this origin (for example, `localhost:8000`). The saved-recordings list lets you play a clip locally or permanently delete it. Browser privacy settings, storage quota, private browsing, clearing site data, or browser storage eviction can prevent saving or remove saved clips. Clips are not portable to another domain, browser profile, browser, computer, or device.

Get appropriate consent before recording anyone, especially minors. Do not project, share, or reuse a clip containing personal data without consent. A saved label is context for later review, not evidence that the movement is correct. Saving neither uploads a clip nor adds it to `src/catalog.mjs`.

## Catalog, videos, lessons, and capture

The dictionary selector, free-text search, and lessons all read `src/catalog.mjs`. Search is independent of exact category selection and can recognize catalog phrases such as `Lo siento` or `Santa Cruz`. Current labels are placeholders only: none has a linked or public video because every `videoPath` is `null`.

Lessons are generated from the shared categories. Practice state exists only in JavaScript memory for the current tab, so refreshing or closing the page loses it by design. Saved recordings are separate browser-local data and can remain after a reload.

Private creator media belongs outside any public build; the root `videos/` directory is ignored by Git for ordinary adds. Git ignore rules do **not** prevent a web server pointed at the repository root from serving private files to anyone who can reach it. For any public deployment, publish only an explicit allowlist of public app files—not the repository root, private documents, or media. No catalog entry or validation wording should change until a real review by qualified LSB creators or collaborators has happened.

## Future slices

Automatic sign-to-text recognition requires multiple labeled examples of each moving sign, people/device variation, evaluation, and a separately implemented model or matching strategy. This MVP intentionally never returns a guessed translation.

## Checks

Run the focused checks for this slice:

```sh
node --test
node --check src/app.js src/dictionary-select.mjs
```

A real browser walkthrough is still needed to observe responsive layout, camera permission, the 15-second limit, local save/play/delete behavior, and browser storage behavior.
