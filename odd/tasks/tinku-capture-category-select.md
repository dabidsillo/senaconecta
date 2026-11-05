# Tinku category display and capture selection

## Goal
Present category names with natural Spanish capitalization instead of uppercase while preserving canonical catalog data and stable IDs; replace the flat 112-option camera label list with a dependent category → sign/word selector, retaining the optional custom label and recording safety rules.

## Scope and constraints
- Keep canonical category values and entry IDs unchanged (e.g. `FAMILIA`, `VERDURAS`): selectors filter by canonical values; apply display formatting only in user-facing text. Prefer `Familia`, `Días de la semana`, `Departamentos de Bolivia` (sentence case, not Title Case or CSS uppercase).
- Both dictionary and capture category selectors should show friendly labels. Also update result badges/summary, lessons titles and public example copy; no video changes.
- Capture starts with category placeholder and disabled sign selector; changing category clears old sign. Custom label remains usable **without** a category. Changing selectors while recording cannot mutate the frozen active label or disable stopping a recording. JSON keeps existing ID/label/source contract; no uploads or persistence.
- Existing server for user walkthrough is `http://127.0.0.1:8001/` (PID recorded `/tmp/tinku-http-8001.pid`); do not kill/replace it. No browser automation available unless verified. Browser camera/download walkthrough remains a human check.
- Separate private DOCX files including `docs/DICCIONARIO LSB.docx` remain ignored, untracked and out of all commits/reviews; do not read them. No GitHub push/PR without a separate user decision.
- TDD mode off per prior Tinku work; runner `node --test` and JS syntax checks. Mirror key `odd/tinku-capture-category-select/tasks`.

## Tasks
- [x] **CAPCAT-1 — Friendly category display.** `formatCategoryLabel` renders all 15 categories as sentence-case Spanish, including `Departamentos de Bolivia`; dictionary options, result badges/summary, lesson titles and the temporary flat capture labels use it. Canonical keys and stable IDs unchanged. Independent verifier observed 39/39 Node tests, catalog/app/lesson syntax and diff checks passed. Public examples update with CAPCAT-2. Progress: complete. Commit: `3a054f5` (`style: display friendly category names`).
- [ ] **CAPCAT-2 — Dependent camera labels.** Add labeled camera category and sign/word selects using the shared catalog, reset sign on category change, retain custom label priority and frozen recording state, update helper/capture tests and public instructions. Progress: in progress. Commit: pending.
- [ ] **CAPCAT-3 — Independent integration verification.** Run Node suite, syntax/diff/privacy checks and HTTP smoke on existing 8001 server, review duplicate Papá/Papa selection, disabled/ready recording state and no-video boundary; note browser manual camera and layout checks. Progress: pending. Commit: pending if verification changes tracked artifacts.

## Next step
Complete CAPCAT-1, then camera cascade and final verification; commit each reviewable work unit locally, without pushing.
