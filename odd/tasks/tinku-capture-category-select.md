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
- [x] **CAPCAT-2 — Dependent camera labels.** Camera now has a labeled category selector and a dependent word/phrase selector, initially disabled and reset on category change; exact category+ID lookup distinguishes Papá/Papa. A custom label works without either selection, overrides catalog and freezes in metadata when recording starts; changing labels does not disable the stop button. Public guides and README updated. Independent verifier observed 40/40 Node tests, JS syntax/diff checks and existing loopback HTTP 200; real camera not tested. Progress: complete. Commit: `e2ad46c` (`feat: filter camera labels by category`).
- [x] **CAPCAT-3 — Independent integration verification.** Final independent verifier observed `node --test` 40/40 passed; JS syntax for catalog/app/lessons/selection/capture and diff checks passed; live `127.0.0.1:8001` served index/app/catalog as expected. Category→word reset, custom fallback/priority, frozen metadata and stop control verified by source/tests; private DOCX/media remain untracked/ignored. The one modified ODD task file was this intentional progress update. Browser visual and real camera/clip/download behavior remain pending human walkthrough. Progress: complete for automated checks. Evidence: commits `3a054f5`, `e2ad46c`; this record is a documentation-only work unit.

## Next step
Have the user hard-refresh `http://127.0.0.1:8001/`, compare dictionary and lessons category capitalization, then try Camera: select Familia → Papá, switch to Verduras → Papa, use custom text without category, and record/download a clip with consent. Do not push without the user's decision.
