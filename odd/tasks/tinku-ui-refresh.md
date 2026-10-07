# Tinku UI refresh

## Objective
Rename the active MVP identity to Tinku and simplify its presentation. Keep references to Bolivian Sign Language (LSB) when naming the language, not the product. Make section navigation remain available while scrolling, align the introductory heading/text with the card content, remove two redundant informational cards, and prevent camera controls from growing vertically when media expands.

## Scope and constraints
- User requested five UI changes on the existing local preview; no repo rename, remote migration, cloud integration, new feature claims, PR, or push was requested.
- Preserve dictionary, lessons, camera capture, download and honest placeholder/recognition warnings. Preserve `/videos/` exclusion from Git.
- Existing feature branch `feat/lsb-mvp` tracks `origin/feat/lsb-mvp`. Separate reviewable work-unit commits stay local until user requests publication.
- TDD mode off per existing feature configuration; `node --test` is the JavaScript runner. Browser behavior/layout require a browser walkthrough; no browser harness is currently exposed.
- Mirror key: `odd/tinku-ui-refresh/tasks`.

## Tasks
- [x] **TINKU-1 — Rename active project identity.** Route: delegated worker, because user-facing brand spans HTML, documentation, capture filename helper and tests. Update title/brand and both learning/defense guides plus README to Tinku; change export filename prefix and its test. Keep `LSB` where it describes the language or vocabulary, and do not rewrite historic commits, repository URL or category `Escuela`. Checks: `node --test`, `node --check src/app.js`, independent name/source scan and doc link checks. Progress: brand, title, README and both guides now say Tinku, export prefix and test updated; independent check passed 30 Node tests, JS syntax, doc links and no old active product names. Native medium review approved/acknowledged (`review-9778431d1ee3ddaf`). No visual browser test for this text/filename unit. Commit: `9ba48b853ce0baa0157648050e0561f17081d207` (`feat(tinku): rename MVP identity and capture exports`).
- [ ] **TINKU-2 — Simplify and stabilize layout.** Route: delegated worker, because HTML, CSS and app controller change together. Move sticky navigation outside the hero so it remains available at any scroll position on desktop/mobile, ensure anchor targets/focus are not obscured, align hero text with card contents, remove catalog and scope summary cards plus the orphan DOM renderer, and keep live/preview camera buttons intrinsic in height. Checks: `node --test`, `node --check src/app.js`, structural readback and desktop/mobile browser walkthrough if available. Progress: in progress. Commit: pending.
- [ ] **TINKU-3 — Verify integration and local preview.** Route: independent delegated verifier for command-running checks. Check active product name, links, removed DOM references, CSS navigation and grid behavior, tests, and HTTP availability. Report actual browser checks separately from source/CSS inspection, and request the user to confirm layout if no browser automation is available. Progress: pending. Commit: pending if any correction requires one.

## Next step
TINKU-1 is committed locally. Complete TINKU-2 next; TINKU-3 verifies both. Do not mark visual checks as observed without a browser. Previous feature `odd/tasks/lsb-school-mvp.md` retains its unfinished creator-reviewed video playback task.
