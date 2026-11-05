# Keep Tinku lesson gallery cards readable

## Goal
Fix user-reported gallery cards shrinking to ~34px on a 360px viewport and ~50px on desktop; retain category-card width and horizontal scrolling without modifying lesson content or practice behavior.

## Evidence and scope
- Independent headless Brave CDP measurement: viewport 360px → lesson-list 279px, 15 lesson cards 34px each; viewport 1200px → lesson-list 958px, cards ~49.9px. Root cause in `styles.css`: `grid-auto-columns: minmax(0, min(84%, 20rem))` admits tiny implicit tracks. Temporary server/profile were cleaned; unrelated port 8000 untouched.
- Change only gallery sizing/containment in `styles.css`, and keep quoted CSS examples/explanations synchronized in `docs/guia-para-estudiantes.md` and `docs/codigo-css-paso-a-paso.md`. Favor an explicit viewport-based minimum and a maximum near 20rem so a narrow viewport shows a readable card with a peek and desktop shows multiple cards. Do not change category data, JS navigation, focus, recording or private media.
- Prove measured improvement at 360px and 1200px in a real local headless browser if available; also check 320px and 720px for overflow behavior, scroll limits, keyboard region and navigation controls where practical. Use temporary own 127.0.0.1 server and profile only; do not disturb existing services. Run `node --test` and `git diff --check`. Report browser results honestly.
- Track local work-unit commits on `feat/lsb-mvp`; no push or PR without a separate user request. Private DOCX/change log and `videos/` stay excluded. TDD mode off; Engram mirror `odd/tinku-gallery-card-width/tasks`.

## Tasks
- [ ] **WIDTH-1 — Give cards a stable minimum width.** Update CSS and two public explanations; preserve gallery controls, scroll-snap, focus and practice. Verify source excerpts and Node suite. Progress: in progress. Commit: pending.
- [ ] **WIDTH-2 — Measure the corrected gallery.** Independent browser measurements on mobile/desktop, structural checks, record observed and skipped interactions. Progress: pending. Commit: pending if tracking evidence changes.

## Next step
Implement bounded width fix, then measure before claiming resolved.
