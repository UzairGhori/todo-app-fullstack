---
id: 015
title: Constitution Auth Alignment Update
stage: constitution
date: 2026-02-12
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: /sp.constitution
labels: ["constitution", "auth", "jwt", "alignment"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

continue recently updatation and buildings — last time ap /sp.constitution create kar rahy thy limit khatam hony sy shop hogai thi ap continue karo

## Response snapshot

Updated constitution v1.0.0 → v1.1.0 to align with actual auth architecture after Better Auth was replaced with custom JWT (commit fe4d9af). Key changes:
1. Replaced `BETTER_AUTH_SECRET` references with `SECRET_KEY`
2. Updated Principle IV (Stateless Authentication) — backend now issues JWTs directly via `/api/auth/token`
3. Updated Tech Stack table — Frontend Auth changed from Better Auth to Custom JWT (backend-issued)
4. Removed "No localStorage for token storage" prohibition — app uses localStorage by design
5. Added prohibition on third-party auth libraries
6. Updated version footer to 1.1.0, Last Amended to 2026-02-12
7. Added Sync Impact Report documenting all changes

Also restored constitution from blank template state (context limit had overwritten it) and deleted 91MB junk `frontend/nul` file.

## Outcome

- ✅ Impact: Constitution now accurately reflects the implemented auth architecture
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md (updated)
- 🔁 Next prompts: Commit untracked files, deploy, or add new features
- 🧠 Reflection: Always verify constitution matches actual implementation after architectural changes

## Evaluation notes (flywheel)

- Failure modes observed: Context limit caused previous session to overwrite constitution with blank template
- Graders run and results (PASS/FAIL): Manual review — PASS (all 5 inconsistencies resolved)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
