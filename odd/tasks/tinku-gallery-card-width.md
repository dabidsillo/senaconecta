# Keep Tinku lesson gallery cards readable

## Goal
Fix user-reported gallery cards shrinking to ~34px on a 360px viewport and ~50px on desktop; retain category-card width and horizontal scrolling without modifying lesson content or practice behavior.

## Evidence and scope
- Independent headless Brave CDP measurement: viewport 360px → lesson-list 279px, 15 lesson cards 34px each; viewport 1200px → lesson-list 958px, cards ~49.9px. Root cause in `styles.css`: `grid-auto-columns: minmax(0, min(84%, 20rem))` admits tiny implicit tracks. Temporary server/profile were cleaned; unrelated port 8000 untouched.
- Change only gallery sizing/containment in `styles.css`, and keep quoted CSS examples/explanations synchronized in `docs/guia-para-estudiantes.md` and `docs/codigo-css-paso-a-paso.md`. Favor an explicit viewport-based minimum and a maximum near 20rem so a narrow viewport shows a readable card with a peek and desktop shows multiple cards. Do not change category data, JS navigation, focus, recording or private media.
- Prove measured improvement at 360px and 1200px in a real local headless browser if available; also check 320px and 720px for overflow behavior, scroll limits, keyboard region and navigation controls where practical. Use temporary own 127.0.0.1 server and profile only; do not disturb existing services. Run `node --test` and `git diff --check`. Report browser results honestly.
- Track local work-unit commits on `feat/lsb-mvp`; no push or PR without a separate user request. Private DOCX/change log and `videos/` stay excluded. TDD mode off; Engram mirror `odd/tinku-gallery-card-width/tasks`.

## Tasks
- [x] **WIDTH-1 — Give cards a stable minimum width.** `styles.css` now uses `clamp(15rem, 72vw, 20rem)` for columns and `min-width: 0` on `.lessons-panel`, with inline containment on `.lesson-list`; two public CSS examples updated. First independent browser run found fixed card width but page-level overflow and disabled arrows; parent containment correction was independently remeasured as passing. 44 Node tests, docs/source consistency and diff check passed; native reliability review approved/acknowledged. Progress: complete. Commit: `2e66faa` (`fix: preserve readable lesson card widths`).
- [x] **WIDTH-2 — Measure the corrected gallery.** Independent Brave headless browser measured 15 cards at viewport 320→240px, 360→259.19px, 720→320px and 1200→320px; document stayed within viewport, gallery scrolled internally, first/last arrow states and one-card movement passed at all widths. A final independent signoff confirmed commit `2e66faa` contains exactly the measured CSS and both docs match it; `node --test` passed 44/44, `git show --check` and `git diff --check` passed, and no private DOCX/videos are tracked. Browser was not rerun because source CSS had not changed. Late-card keyboard focus/scroll retention and manual human visual checks were **not observed**. Progress: complete for measured layout and controls; manual walkthrough pending. Commit: verification record committed locally (see Git history).

## Next step
Ask the user to hard-refresh the site and compare category card widths on their own phone/desktop, including keyboard focus on a late card. No push/PR without separate request.
