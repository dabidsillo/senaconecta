# Tinku final catalog and browser-local recordings

## Goal
Replace the old 112-term catalog with the user's exact 45 text terms in 9 categories, update suggested search phrases, and let visitors to a future static HTTPS deployment save demonstration recordings **only in that browser** with one “Guardar seña” action. Saved video and metadata must be viewable/replayable and deletable there, persist across reloads, never upload or automatically become a reviewed LSB catalog entry.

## Approved product boundary
- User supplied full vocabulary: ALIMENTOS Arroz, Café, Fideo, Leche, Pan; ANIMALES Cóndor, Gallina, Gato, Perro, Vaca; COLORES Amarillo, Azul, Rojo, Verde; DEPARTAMENTOS Beni, La Paz, Oruro, Potosí, Santa Cruz; DIAS DE LA SEMANA Jueves, Lunes, Martes, Miércoles, Viernes; FAMILIA Bebé, Hija, Hijo, Mamá, Papá; FRUTAS Guineo, Manzana, Naranja, Piña, Plátano; LUGARES Baño, Casa, Escuela, Hospital, Mercado; SALUDOS Chau, Gracias, Hola, Lo siento, Por favor, Te amo. Preserve displayed accents and exact terms; canonical grouping may retain DÍAS DE LA SEMANA accent for display. No synonyms or fabricated signs.
- User expressly selected per-browser persistence for new demonstration recordings. Use IndexedDB to store a Blob plus frozen metadata. Avoid accounts, backend, upload, analytics, automatic promotion into the catalog and cross-device sharing. A browser can clear storage and quotas can fail; show honest error and a delete control. Recordings of minors require prior consent and access/privacy care.
- Previously recorded seed sign videos were **not supplied**. Keep catalog `videoPath: null` and status placeholder until actual reviewed files, explicit publication permission and safe deployment asset hosting are provided. No linking private `/videos/` or claiming validated signs from text alone. Public deployment provider/URL is not yet selected; do not publish or push without separate authorization.
- Existing local preview `127.0.0.1:8001` serves a committed snapshot and will not auto-update. Do not touch unrelated port 8000 or private DOCX/media.
- Configured TDD off; use Node suite, source/snippet and HTTP/browser verification proportionately. Each work unit gets one local Conventional Commit. Engram mirror `odd/tinku-final-catalog-local-recordings/tasks`.

## Tasks
- [ ] **FINALCAT-1 — Replace inventory and examples.** Update `src/catalog.mjs` 45/9 and version, `index.html` suggested searches/help and tests for catalog/selectors/lessons; preserve phrase recognition and exact selection. Progress: in progress. Commit: pending.
- [ ] **LOCALSAVE-1 — Build tested IndexedDB storage.** Create a small persistence module with save/list/get/delete operations, Blob+metadata, explicit quota/unavailable errors and no object URL persistence; unit tests with a narrow fake IndexedDB seam. Progress: pending. Commit: pending.
- [ ] **LOCALSAVE-2 — Connect capture UI.** Replace two download links with one “Guardar seña” button; show saved local signs with playback and delete; keep frozen label, stop controls, 15s limit and safe object URL cleanup; update capture metadata/documentation in UI. Test helpers and flow. Progress: pending. Commit: pending.
- [ ] **PUBLICDOC-1 — Align overview and demonstration guides.** Update README and student/project/defense guides for 45/9, working examples and browser-only saved recordings (not publicly shared). Progress: pending. Commit: pending.
- [ ] **PUBLICDOC-2 — Align code walkthroughs.** Update HTML/CSS/JS catalog and capture walkthroughs for actual snippets, changed markup/style/state and new storage module; no broken links. Progress: pending. Commit: pending.
- [ ] **FINALVERIFY — Check deployed-static boundaries.** Independent Node tests and headless browser test of real UI with fake camera where feasible: save/reload/replay/delete/isolation, responsive selectors, no network uploads, clear errors; report actual versus skipped hardware/creator-video checks, record local commit. Progress: pending. Commit: pending if evidence record changes.

## Next step
Implement the exact final vocabulary first. After user supplies reviewed videos and publication authorization, attach seed media via a separate bounded task; deployment target must be decided before public release.
