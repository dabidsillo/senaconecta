# Tinku local preview and private documentation

## Goal
Keep the user-owned thesis DOCX and its change log out of ordinary Git publication, make the sticky navigation span the full viewport dynamically without widening main content, and add a Windows one-click local preview launcher.

## Scope and safety
- Private sources currently untracked: `docs/documentacion.docx`, `docs/cambios-documentacion.md`, and their progress file `odd/tasks/tinku-documentation-alignment.md`. Root-anchored ignore rules protect ordinary Git adds only; forced adds remain possible. Never stage, commit, push or upload those files without separate authorization.
- Existing branch `feat/lsb-mvp` is ahead of origin. New work-unit commits stay local; this user request does not authorize a push or PR.
- UI remains mobile-first and static; only the navbar becomes full-viewport width. Preserve sticky behavior, horizontal overflow on narrow screens, skip link and section offsets.
- Windows launcher requires Python 3 installed (`py -3` preferred, `python.exe` fallback), binds only 127.0.0.1:8000 and opens that same URL only after its own server has bound the port; diagnose missing Python/occupied port without downloading dependencies. A real Windows invocation is unavailable here and must be reported pending.
- TDD mode off per existing feature configuration; `node --test` is the JS runner and CSS/Windows batch need structural/manual verification.
- Engram mirror: `odd/tinku-local-preview/tasks`.

## Tasks
- [x] **LOCAL-1 — Protect private documentation.** Exact root `.gitignore` paths added for both requested files and the private progress artifact; `git check-ignore -v` matches all three and `git ls-files` lists none. No private file was staged. Progress: complete. Commit: `b473b91` (`chore: keep private thesis files out of Git`).
- [x] **LOCAL-2 — Stretch navigation across viewport.** `.topbar` now fills the viewport (`width: 100%`) and `.nav-links` aligns to the right; hero/main remain capped, sticky/scroll behavior and HTML access links unchanged. Independent read-only check observed HTTP 200 for index/CSS. Browser visual check remains pending. Progress: complete. Commit: `8511f7f` (`style: stretch sticky navigation across viewport`).
- [x] **LOCAL-3 — Windows one-click launcher.** `iniciar-tinku.bat` changes to its own directory, checks Python 3, binds a standard-library HTTP server on loopback before opening the browser, reports runtime/port failure, and keeps the serving console open. README explains Python requirement and usage. Independent static audit and Linux equivalent confirmed bind order and occupied-port failure. Real Windows execution remains for the recipient, by user choice. Progress: complete. Commit: `089034d` (`feat: add Windows local preview launcher`).
- [x] **LOCAL-4 — Independent integration verification.** Confirmed exact ignore rules and none of the three private files tracked; HTTP 200 for index/CSS; source inspection of full-width nav with constrained content and unchanged accessibility anchors; `git diff --check`; static batch audit and Linux-equivalent bind/port behavior. No JavaScript changed; the earlier 31 Node tests were not rerun for this slice. Real Windows `cmd.exe` and browser layout remain unverified and must not be claimed. Progress: complete with manual checks disclosed. Evidence: LOCAL-1/2/3 work-unit commits above; no additional executable correction.

## Next step
The recipient can double-click `iniciar-tinku.bat` on Windows with Python 3 installed. Any later navigation visual walkthrough remains separate; keep documentation and its change record local/private. Do not push without the user's decision.
