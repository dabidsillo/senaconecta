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
- Feature branch: `feat/lsb-mvp`. Delivery strategy: ask-on-risk; user selected feature-branch-chain for future review (no PR authorized). Original forecast ~500–750 authored lines was low; the original combined workspace held ~2,000 source/test/doc lines. Three runnable work-unit commits: LSB-1 `91d547d` (1,037 additions), LSB-2 `216e4de` (366 additions / 32 deletions), LSB-3 `2ad5230` (772 additions / 25 deletions). LSB-1/3 exceed the ~400-line advisory budget because each includes a coherent usable behavior, styling, tests and documentation; no cosmetic compression or split-by-file. These are separate potential feature-branch review slices; no PR has been created.
- TDD mode: off (no project/session TDD configuration detected); source: inspected local project and Pi settings; runner: `node --test` for pure JavaScript unit tests, plus manual browser checks when available.
- Engram mirror topic: `odd/lsb-school-mvp/tasks`; mirror the feature document only.
- User explicitly authorized Conventional work-unit commits on `feat/lsb-mvp`; did not authorize push or PR. User chose refactor into verifiable slices rather than a large bootstrap. Git author/committer identity now resolves as `David Chalar <davidchalarq@gmail.com>` after user configuration (verified with `git var`); commit creation is unblocked. Browser checks remain pending and must not be reported passed.

## Pre-slice preservation (historical)
Before reconstructing the now-committed three slices, original combined file versions were recorded as Git blob IDs:
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
Those unreferenced blob objects can be pruned by Git garbage collection; the three work-unit commits above are the durable source of current behavior.

## Tasks
- [ ] **LSB-1 — Bundled catalog and text-to-video dictionary.** Route: delegated writer (multiple nontrivial files). Build an accessible responsive application shell, a small clearly labeled starter vocabulary with categories, matching and ordered playback for text input. Missing recordings must show a non-misleading state. Checks: `node --test`; structural readback; browser walkthrough pending if no browser harness. Progress: dictionary-only snapshot independently verified (8 focused tests, JS syntax, static readback), then committed. Browser playback walkthrough pending, so task checkoff remains open. Commit: `91d547d48f8f4dce4b1aece6e11c069d5e88bfdd` (`feat(lsb): add placeholder dictionary and ordered playback`); first slice 1,037 added lines including progress file.
- [x] **LSB-2 — Beginner lessons.** Route: delegated writer (multiple nontrivial files). Present category lessons from the same catalog with meaningful progression and no false persistent completion. Checks: `node --test`; browser walkthrough. Progress: lessons-only increment independently verified (12 focused tests, JS syntax, static readback), then committed; user confirmed browser category practice completes correctly and progress resets on reload; LSB-2 outcome and checks observed, task closed. Commit: `216e4de51a57934201d1158f1f6f08356d390d33` (`feat(lsb): add category-based beginner lessons`), 366 additions / 32 deletions.
- [x] **LSB-3 — Labeled camera capture.** Route: delegated writer (multiple nontrivial files). Record movement on supported devices; label, preview, stop, and download recordings plus metadata with no server persistence. Explicitly separate capture from automatic recognition. Checks: `node --test` for testable helpers and browser permission / recording walkthrough. Progress: camera-only increment independently verified (22 tests, JS syntax, static readback), then committed. User observed recording/download of video and JSON in Brave Origin (Chromium). In Zen Browser (Gecko), pressing Detener leaves the UI indefinitely preparing, without preview or downloads. Source requests `audio: false` but prioritizes `opus` audio codecs; Mozilla bug 1881826 documents this event-stall pattern and recommends video-only VP8. Video-only MIME selection, bounded stop-event watchdog, and stale recorder-event guards implemented; independent verifier and parent spot check passed 30 Node tests / JS syntax. Fix commit: `30c6ca944b41862ee19bd5e3dec71b0d870376a5` (`fix(lsb): finalize video-only recordings across browsers`), 344 additions / 36 deletions. User explicitly confirmed post-fix recording, preview, and separate video and JSON downloads in both Zen (Gecko) and Brave Origin (Chromium). Combined with 30 passing Node tests, static independent verification and commits, the LSB-3 outcome and checks are observed; task closed. Catalog playback and lessons remain separate pending checks. Initial capture commit: `2ad5230fad3739a66183fe47f57f4e0cc3b2a850`.

## Acceptance
- The first two features use the same versioned catalog; no recordings are fabricated.
- Capture creates user-controlled exports without uploading or silently persisting video.
- Sign-to-text is prominently described as a later research/implementation step dependent on usable temporal samples; the MVP never returns a guessed translation.

## Next step
Three initial work units plus Gecko correction `30c6ca9` are committed. Independent verifier and parent spot check passed 30 Node tests and JS syntax for the fix. Native ASSESS for the committed range was unassessable because pre-existing untracked `.gitignore` needs explicit declaration; INSPECT excluding it returned an empty workspace/base-ref selection, not a committed candidate. No START/lineage or native approval exists; do not invent a base ref or review the accumulated branch. LSB-3 is closed: the user confirmed post-fix recording, preview, and both video/JSON downloads in Zen and Brave. LSB-2 is closed: the user confirmed category practice and session-only reset in a browser. Next, LSB-1 needs creator-validated video files added to the catalog and a text-to-video playback walkthrough. Other browser/responsive checks remain pending. Do not check off while applicable checks are unobserved. Never push/open PR without separate authorization.
