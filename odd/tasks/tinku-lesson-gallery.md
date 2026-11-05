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
- [x] **GALLERY-1 — Build compact horizontal gallery shell.** Native touch/keyboard horizontal scroll with CSS snap and 84%-wide compact cards replaces the vertical grid, keeping 15 lessons and practice unchanged. Accessible gallery region and deliberately disabled buttons are ready for GALLERY-2. Independent verifier observed 40/40 Node tests, app syntax/diff checks and localhost index/CSS HTTP markers passed; no browser rendering observed. Native review approved with one non-blocking advisory on intentionally disabled arrows, resolved by planned GALLERY-2. Progress: complete. Commit: `e617379` (`feat: present lessons as compact horizontal gallery`).
- [x] **GALLERY-2 — Wire gallery controls and preserve practice focus.** Pure offset/boundary helper and tests wire one-card Previous/Next, disabled extremes and scroll/resize updates; focus and scroll position survive selecting a lesson without changing practice reset. README and both public guides describe the workflow. Independent verifier identified rapid-click risk with smooth scrolling; replaced with non-animated `behavior: 'auto'` and independently rechecked. 44/44 Node tests, JS syntax, diff and loopback HTTP checks passed; native review approved/acknowledged. Progress: complete. Commit: `aee9317` (`feat: navigate lessons one card at a time`).
- [x] **GALLERY-3 — Confirm integrated UX boundaries.** Independent verifier observed 44/44 Node tests, `node --check` for app/helper, diff checks for both implementation commits and task doc, HTTP 200 plus markers for index/CSS/app/helper, 15 lesson test, no new persistence/backend and no tracked DOCX/videos. No standard browser binary was found on PATH, so mobile rendering, touch/trackpad, keyboard focus and snap behavior were **not** observed and require the user's real-browser walkthrough. Progress: complete for automated/integration evidence; manual browser visual/interaction checks pending. Commit: verification record committed locally (see Git history).

## Next step
Hard-refresh `http://127.0.0.1:8001/` on a mobile-width browser and verify one full Previous/Next cycle, first/last disabled states, keyboard focus, selecting a late category without gallery jumping, practice below and no progress after reload. The previously uncommitted suggested-search fix was isolated in local commit `edb5e84` before this feature began. Do not push or open a PR without a separate request.
