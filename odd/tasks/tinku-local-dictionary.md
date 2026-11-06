# Tinku browser-local dictionary overlay

## Goal and consented scope
The user chose **"Solo en mi navegador"** for saved sign recordings: searching the dictionary should find their custom label in a distinct **Mis señas** area and allow local playback. No public publication, catalog promotion, validation claim, accounts, server, uploads, analytics, or cross-device sharing.

## Design boundary
- Keep `STARTER_CATALOG` exactly 45 text entries/9 categories, `videoPath: null`, and placeholder status; category/word selectors, lessons, and curated playback stay catalog-only.
- Match local labels against free-text queries with the existing normalized, longest-phrase-first catalog search semantics. A saved label matching a public label yields both a curated placeholder and separately marked local recording(s); multiple saved clips with one label remain distinct by storage ID. Unknown tokens exclude locally recognized phrases. Do not treat local recordings as validated LSB.
- Read only metadata with `captureStore.list()` during search, never load Blobs or create object URLs until the user explicitly presses playback for a local result. Show an inline video within the dictionary, release Blob URLs on replacement/navigation, guard stale asynchronous gets and playback; preserve saved records and origin. Explain browser-only and potentially evictable storage.
- The existing `http://127.0.0.1:8002/` loopback public snapshot is the same origin as the user's saved clips. Refresh it from committed public files after implementation instead of switching port or clearing site data. Do not touch port 8000/8001, private media/DOCX, push, PR or deploy. Configured TDD off; Node tests, independent readback and native review as offered.

## Work units
- [x] **LOCALSEARCH-1 — Pure local search model.** Ephemeral metadata-only entries reuse phrase-aware `lookupText` and partition curated/local/unknown results. Tests cover accents, punctuation, multiword phrases, curated/local collisions, repeated local labels, invalid metadata and unchanged public catalog without Blob output. Independent static audit and 63/63 Node tests/syntax/diff passed. Native reliability review approved/acknowledged; informational non-blocking note about trimming opaque local IDs applies only to malformed future IDs (current store generates UUIDs). Progress: complete. Commit: `cda14ca` (`feat: match saved sign labels in local dictionary search`).
- [ ] **LOCALSEARCH-2 — Dictionary UI and documentation.** Add a visually separate, explicitly unvalidated Mis señas result panel with local inline playback, busy/error status, manual-control fallback, Blob URL cleanup and stale-response guards. Refresh results after explicit local save/delete/list, but leave curated selectors and lessons unchanged. Add scoped public-facing explanation and tests feasible without a browser. Progress: in progress. Commit: pending.
- [ ] **LOCALSEARCH-VERIFY — Isolated static preview and user browser retest.** Independently run all Node tests/syntax/links, verify new 8002 snapshot matches committed public files and excludes private assets, and request same-origin user search/play/reload/delete confirmation. Never claim real-browser success until observed. Progress: pending. Commit: pending if evidence changes.

## Prior pending check
BROWSERVERIFY in `odd/tasks/tinku-final-catalog-local-recordings.md` still awaits human browser playback/delete confirmation. This overlay work does not prove that earlier check by itself.
