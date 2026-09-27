# LSB school MVP

## Objective and rationale
Build a mobile-first, browser-only Bolivian Sign Language school MVP. A bundled, editable catalog powers text-to-video lookup and categorized beginner lessons. Camera recording collects labeled movement samples for future sign-to-text work. Never claim that labeling or recording constitutes automatic recognition.

## Scope and constraints
- No account, backend, analytics, or browser-persistent user data. Captures are held temporarily and explicitly downloaded by the user; closing the page loses undownloaded work.
- Bundled catalog entries may lack user-supplied videos. Show a clear missing-video state instead of inventing signs.
- Camera use requires browser permission and a secure context (localhost or HTTPS); handle denials and unavailable devices.
- Spanish product UI to match this project's intended audience. Technical source identifiers in English.
- Automatic camera sign-to-text requires labeled temporal examples and evaluation; do not pretend it works without samples. No ML dependency in the initial units.
- Existing untracked `.gitignore` is out of scope and remains untouched.

## Delivery and checks
- Feature branch: `feat/lsb-mvp` (unborn until first commit). Delivery strategy: ask-on-risk; user selected feature-branch-chain for future review (no PR authorized). Original forecast ~500–750 authored lines was low; combined initial workspace contained ~2,000 source/test/doc lines. First cohesive, runnable dictionary-only staged snapshot: 1,037 additions including 45 lines of this progress doc. This exceeds the ~400-line advisory budget because the app shell, responsive styling, catalog, lookup/playback behavior, tests, and run instructions together form the first usable unit; no cosmetic compression or split-by-file. Later lessons and capture are separate work units and review slices.
- TDD mode: off (no project/session TDD configuration detected); source: inspected local project and Pi settings; runner: `node --test` for pure JavaScript unit tests, plus manual browser checks when available.
- Engram mirror topic: `odd/lsb-school-mvp/tasks`; unavailable because the `engram` binary is missing. Mirror pending; local file is the only current progress copy.
- User explicitly authorized Conventional work-unit commits on `feat/lsb-mvp`; did not authorize push or PR. User chose refactor into verifiable slices rather than a large bootstrap. Git author/committer identity now resolves as `David Chalar <davidchalarq@gmail.com>` after user configuration (verified with `git var`); commit creation is unblocked. Browser checks remain pending and must not be reported passed.

## Pre-slice preservation
Current final working files remain untouched. Before any future reconstruction, their Git blob object IDs were recorded (not commits):
- `README.md`: `6b9717ff90cae600c1e4afb22eab924ae65df167`
- `index.html`: `a84dc358bfe9d99a1d9f01fa68d0dc89138d29ce`
- `styles.css`: `95332c6fa3564bab03dd750fcef2ec4bbb3694f7`
- `src/app.js`: `f308f6c21d755b61176accccfdc86de36123fe3f`
- `src/catalog.mjs`: `7ee05ad625dcd7ec749d79eb1d6dc1302bc19f55`
- `src/lessons.mjs`: `19650459be10dd9af10625bf5aa4f860c9222692`
- `src/capture.mjs`: `7aee8f85232ded622d3bdd5f3d5e4b169ba3948f`
- `tests/catalog.test.mjs`: `067f7a85d9c0f7f29c3a51d6b4937d71933292b4`
- `tests/lessons.test.mjs`: `52d727d38527da2dd83b41d439a6a49eab96dfb6`
- `tests/capture.test.mjs`: `8ccd3b20642193639fb9efd7519c99b2ec6374a3`
Unreferenced blob objects can be pruned by Git garbage collection; do not treat them as durable backup. Keep the working files intact until the identity blocker is resolved and a safe slicing route is validated.

## Tasks
- [ ] **LSB-1 — Bundled catalog and text-to-video dictionary.** Route: delegated writer (multiple nontrivial files). Build an accessible responsive application shell, a small clearly labeled starter vocabulary with categories, matching and ordered playback for text input. Missing recordings must show a non-misleading state. Checks: `node --test`; structural readback; browser walkthrough pending if no browser harness. Progress: implementation complete in the pre-slice workspace; reconstructing runnable dictionary-only snapshot for the first work-unit commit. Final independent audit and parent spot check previously passed 20 tests / JS syntax on combined workspace. Browser playback walkthrough pending. Commit: authorized, pending slice verification.
- [ ] **LSB-2 — Beginner lessons.** Route: delegated writer (multiple nontrivial files). Present category lessons from the same catalog with meaningful progression and no false persistent completion. Checks: `node --test`; browser walkthrough. Progress: implementation complete; final independent audit and parent spot check passed 20 tests / JS syntax. Browser walkthrough pending. Commit: pending authorization.
- [ ] **LSB-3 — Labeled camera capture.** Route: delegated writer (multiple nontrivial files). Record movement on supported devices; label, preview, stop, and download recordings plus metadata with no server persistence. Explicitly separate capture from automatic recognition. Checks: `node --test` for testable helpers and browser permission / recording walkthrough. Progress: implementation complete, recorder/media issues corrected; final independent audit and parent spot check passed 20 tests / JS syntax. Real-device camera permission, recording and download walkthrough pending. Commit: pending authorization.

## Acceptance
- The first two features use the same versioned catalog; no recordings are fabricated.
- Capture creates user-controlled exports without uploading or silently persisting video.
- Sign-to-text is prominently described as a later research/implementation step dependent on usable temporal samples; the MVP never returns a guessed translation.

## Next step
User authorized commits and selected feature-branch-chain, then explicitly chose to refactor and separate verifiable functional units rather than accept one oversized bootstrap commit. A read-only scout proposed dictionary → lessons → capture as three runnable work-unit snapshots; current files remain intact and their pre-slice Git blob hashes were recorded locally in the object database. Git identity is configured; derive cohesive runnable snapshots and verify each before its work-unit commit. Then resolve real-device browser walkthrough and creator-provided videos. Native review inspect returned ready for a workspace snapshot, but no START was run: no work-unit commit exists and the workspace candidate spans all tasks. Engram mirror pending. Do not check off until observed outcome and checks; resolve mirror and commit blockers explicitly.
