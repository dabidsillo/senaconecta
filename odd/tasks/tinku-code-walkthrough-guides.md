# Tinku step-by-step code walkthroughs

## Goal
Create a linked set of student-facing Spanish documents that explain the public Tinku HTML, CSS and JavaScript in meaningful source blocks, so school students without programming experience can point at a block, say what it does and show the visible result. This expands, rather than replaces, `docs/guia-para-estudiantes.md`.

## Scope and safety
- Four short guides: `docs/codigo-html-paso-a-paso.md`, `docs/codigo-css-paso-a-paso.md`, `docs/codigo-js-catalogo-y-lecciones.md`, `docs/codigo-js-camara-y-descargas.md`. Explain blocks by purpose, not every individual punctuation mark or line. Each has a short map, exact bounded source excerpts (or clearly labeled pseudocode), a plain-language explanation, cross-links and one simple try-it exercise with expected result.
- Cover structure/navigation/dictionary/lessons/camera in HTML; theme/components/horizontal gallery/responsiveness/focus in CSS; catalog/text phrase lookup/selectors/lessons/gallery and UI event wiring in JS; capture support/permissions/label priority/frozen metadata/record and explicit downloads/cleanup in JS.
- Source snippets and paths must be verified against current public code; refer to exact symbol names and stable section anchors rather than brittle line-number ranges. Keep conceptual/technical claims accurate. Videos in the catalog remain unvalidated/absent, sign recognition/translation absent, progress and clips temporary; no upload or backend.
- Link docs through README and the existing beginner guide as suitable. Private thesis DOCX, private documentation log and `videos/` remain excluded. Commit local reviewable work units on `feat/lsb-mvp`; no push, PR or merge without separate user request.
- TDD mode off; verify Markdown links/snippets and Node tests, plus a separate read-only check for correctness and accessibility of explanations. Engram mirror `odd/tinku-code-walkthrough-guides/tasks`.

## Tasks
- [ ] **CODEGUIDE-1 — Explain HTML structure block by block.** Create HTML guide with accurate snippets and a prominent README link; verify source anchors, markup semantics and constraints. Progress: in progress. Commit: pending.
- [ ] **CODEGUIDE-2 — Explain CSS appearance and responsive behavior.** Create CSS guide with source-matched snippets, contrast/focus/snap and media-rule story; link it from the student guide. Progress: pending. Commit: pending.
- [ ] **CODEGUIDE-3 — Explain catalog, dictionary and lesson JavaScript.** Create one focused guide covering small pure modules and relevant UI wiring in `src/app.js`; link it from student guide. Progress: pending. Commit: pending.
- [ ] **CODEGUIDE-4 — Explain capture and downloads JavaScript.** Create guide tracing camera permissions, recording label, 15-second limit, video and JSON, explicit download, cleanup and no upload; link it from student guide. Progress: pending. Commit: pending.
- [ ] **CODEGUIDE-5 — Audit the full reading path.** Independently verify four guides, cross-links, source excerpts, omissions/claims and basic automated checks; document any untested student reading trial. Progress: pending. Commit: pending if tracked verification record changes.

## Next step
Write and verify one public guide per work unit before moving to the next; avoid overwhelming student and reviewer with a single huge document.
