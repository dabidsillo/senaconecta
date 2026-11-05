# Tinku horizontal learning gallery

## Goal
Replace the 15-category learning grid with a compact horizontally scrollable category gallery built only with HTML, CSS and vanilla JavaScript, while preserving the existing in-memory practice flow.

## Scope and safety
- The gallery is one row with touch/trackpad horizontal scrolling, CSS scroll snap and visible previous/next buttons; show one card plus a peek on narrow screens and 2–3 cards at desktop widths. Do not load libraries, introduce a backend or persist progress.
- Cards stay category-specific but compact: title, count/short summary and practice action; avoid rendering every vocabulary term in each category card. Preserve full practice prompts below, category source and the no-validated-video language.
- Keep keyboard access with focus-visible styles and real buttons. Ensure previous/next disabled at scroll limits and recomputed after scrolling/resizing; avoid stealing global arrow keys. Selecting a lesson must not strand focus or jump the gallery back to its start when the cards re-render. Respect reduced-motion preferences.
- No private DOCX or creator media should be read/staged/published. Work-unit commits stay local on `feat/lsb-mvp`; no push or PR without separate user request.
- Existing localhost preview: `http://127.0.0.1:8001/` when its server is alive. Browser-rendered behavior remains a manual check if no browser runtime available.
- Configured TDD mode off, runner `node --test`; Engram mirror `odd/tinku-lesson-gallery/tasks`.

## Tasks
- [ ] **GALLERY-1 — Build compact horizontal gallery shell.** Update learning markup and CSS to display horizontally scrollable snap cards with accessible navigation labels, visible buttons and compact content; do not change session logic or global layout. Verify structural HTML/CSS and local HTTP. Progress: in progress. Commit: pending.
- [ ] **GALLERY-2 — Wire gallery controls and preserve practice focus.** Implement previous/next per-card movement, disable at ends, update on scroll/resize, preserve focus and scroll on selection; update public README/guide instructions and tests where pure logic is introduced. Run Node suite/syntax and independent check. Progress: pending. Commit: pending.
- [ ] **GALLERY-3 — Confirm integrated UX boundaries.** Verify controls wiring, data/lesson counts, no-progress persistence, responsive source rules, tests and loopback HTTP. Report browser/mobile/keyboard visual checks as pending unless observed. Progress: pending. Commit: pending if verification changes tracked artifacts.

## Next step
Complete GALLERY-1, then controls and final checks. The previously uncommitted suggested-search fix was isolated in local commit `edb5e84` before this feature began.
