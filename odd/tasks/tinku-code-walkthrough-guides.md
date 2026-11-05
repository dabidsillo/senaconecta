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
- [x] **CODEGUIDE-1 — Explain HTML structure block by block.** Created `docs/codigo-html-paso-a-paso.md` with beginner-friendly literal excerpts for page setup, navigation, dictionary, lessons, camera and accessible controls, linked from README. Independent verifier confirmed excerpts, links, 44 Node tests, diff and private exclusions; identified that generic `div.nav-links` does not reliably receive a name from `aria-label`, so documentation now distinguishes it from named nav/link roles and recheck passed. Real-student/browser check remains pending. Native low-risk docs review approved/acknowledged. Progress: complete. Commit: `3cc4bdf` (`docs: explain Tinku HTML section by section`).
- [x] **CODEGUIDE-2 — Explain CSS appearance and responsive behavior.** Added `docs/codigo-css-paso-a-paso.md` with base/theme, keyboard focus, sticky nav, panels, horizontal snap gallery, camera/download style and 720px/reduced-motion rules; links from student guide. Source excerpts are real selected lines with omissions explicitly signposted. Independent verifier confirmed explanations and links, 44/44 Node tests and diff check; no browser/student visual trial. Native low-risk docs review approved/acknowledged. Progress: complete. Commit: `c6532a3` (`docs: explain Tinku CSS in guided blocks`).
- [ ] **CODEGUIDE-3 — Explain catalog, dictionary and lesson JavaScript.** Create one focused guide covering small pure modules and relevant UI wiring in `src/app.js`; link it from student guide. Progress: in progress. Commit: pending.
- [ ] **CODEGUIDE-4 — Explain capture and downloads JavaScript.** Create guide tracing camera permissions, recording label, 15-second limit, video and JSON, explicit download, cleanup and no upload; link it from student guide. Progress: pending. Commit: pending.
- [ ] **CODEGUIDE-5 — Audit the full reading path.** Independently verify four guides, cross-links, source excerpts, omissions/claims and basic automated checks; document any untested student reading trial. Progress: pending. Commit: pending if tracked verification record changes.

## Next step
Write and verify one public guide per work unit before moving to the next; avoid overwhelming student and reviewer with a single huge document.
