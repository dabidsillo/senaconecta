# Tinku student explanation guide

## Goal
Help school students with no programming background explain the delivered Tinku prototype and give a truthful, simple account of its HTML, CSS and JavaScript code during a demonstration or oral presentation.

## Scope and constraints
- Write a short stand-alone Spanish guide at `docs/guia-para-estudiantes.md` for the existing project's Spanish audience. Use small accurate examples drawn from current public code, explain new terms before using them, and provide a speakable 1–2 minute script, demo checklist, questions and answers, and safe 'do not claim' boundaries.
- Explain dictionary (112 text labels/15 categories; Familia Papá versus Verduras Papa), horizontally scrollable Lessons with practice reset on reload, and optional Camera with 15-second capture plus explicit video and JSON downloads. Do not imply LSB signs are validated, recognition/translation exists, videos are in the published GitHub repo, or automatic uploads/persistent browser storage exist.
- Link the student guide visibly from README.md. Do not read, stage or publish thesis DOCX, private change log or `videos/`; do not push or open a PR without explicit request.
- One bounded documentation work unit and one read-only verification task. TDD off; markdown examples checked against source.
- Engram mirror: `odd/tinku-student-explanation-guide/tasks`.

## Tasks
- [x] **STUDENT-1 — Write and link accessible student guide.** Published a stand-alone Spanish school guide with an approximately one-minute script, plain HTML/CSS/JS explanation and literal snippets, three feature demos, honest limitations and Q&A; README links it. Independent verifier confirmed literal snippets/link, 112/15 vocabulary, capture/reload behavior and limits; shortened the time claim after it identified a ~112-word script could not fill two minutes. 44/44 Node tests and diff checks passed. Native low-risk docs review approved/acknowledged. Progress: complete. Commit: `de052cb` (`docs: teach students to explain Tinku simply`).
- [x] **STUDENT-2 — Verify pedagogical and technical accuracy.** Independent verifier confirmed the four literal snippets match index/CSS/app; ~112-word script aligns with the approximately one-minute heading, README link works, recording/storage/Windows/GitHub boundaries are accurate, and private documents/videos remain untracked. `node --test` passed 44/44, `git show --check de052cb` and `git diff --check` passed. A real-student reading/usability test was **not performed**; adjust the guide after their feedback. Progress: complete for source/automated evidence; learner trial pending. Commit: verification record committed locally (see Git history).

## Next step
Ask a student to explain one HTML/CSS/JS chain and show each feature without reading the guide verbatim; collect confusing words for a later revision. No push or PR without a separate user request.
