# Tinku local preview and private documentation

## Goal
Keep the user-owned thesis DOCX and its change log out of ordinary Git publication, make the sticky navigation span the full viewport dynamically without widening main content, and add a Windows one-click local preview launcher.

## Scope and safety
- Private sources currently untracked: `docs/documentacion.docx`, `docs/cambios-documentacion.md`, and their progress file `odd/tasks/tinku-documentation-alignment.md`. Root-anchored ignore rules protect ordinary Git adds only; forced adds remain possible. Never stage, commit, push or upload those files without separate authorization.
- Existing branch `feat/lsb-mvp` is ahead of origin. New work-unit commits stay local; this user request does not authorize a push or PR.
- UI remains mobile-first and static; only the navbar becomes full-viewport width. Preserve sticky behavior, horizontal overflow on narrow screens, skip link and section offsets.
- Windows launcher requires Python 3 installed (`py -3` preferred, `python` fallback), binds only 127.0.0.1:8000 and opens that same URL after the server responds; diagnose missing Python/occupied port without downloading dependencies. A real Windows invocation is unavailable here and must be reported pending.
- TDD mode off per existing feature configuration; `node --test` is the JS runner and CSS/Windows batch need structural/manual verification.
- Engram mirror: `odd/tinku-local-preview/tasks`.

## Tasks
- [x] **LOCAL-1 — Protect private documentation.** Exact root `.gitignore` paths added for both requested files and the private progress artifact; `git check-ignore -v` matches all three and `git ls-files` lists none. No private file was staged. Progress: complete. Commit: `b473b91` (`chore: keep private thesis files out of Git`).
- [ ] **LOCAL-2 — Stretch navigation across viewport.** Make `.topbar` span the entire horizontal viewport at mobile and desktop sizes with responsive spacing; leave hero/main constrained for reading, and preserve sticky scrolling, anchors, focus and overflow. Check source/CSS readback and local HTTP; browser visual pending. Progress: in progress. Commit: pending.
- [ ] **LOCAL-3 — Windows one-click launcher.** Create a small root `.bat` that resolves its directory, chooses Python 3, reports missing Python/occupied port, starts the loopback static server and opens the local URL only after it responds; document the prerequisite and usage in README. Check static script and README against actual commands. Progress: pending. Commit: pending.
- [ ] **LOCAL-4 — Independent integration verification.** Confirm ignore/tracking, 31 Node tests/JS syntax, localhost HTTP, CSS/HTML and launcher logic without claiming Windows or visual browser execution. Surface manual Windows and mobile/desktop checks. Progress: pending. Commit: pending if a correction is required.

## Next step
Complete LOCAL-1 first, then navbar and Windows launcher as separate reviewable units. Keep documentation and its change record local/private.
