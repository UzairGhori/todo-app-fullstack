---
id: 013
title: Post-Action Confirmations in Markdown
stage: general
date: 2026-02-11
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: natural prompt
labels: ["post-action", "confirmations", "mcp-tools", "ai-chatbot", "ux", "markdown"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/post-action-confirmations.md
tests:
  - none
---

## Prompt

skills: You are an AI skill designer.

Define the MCP skills for the Todo AI Chatbot with focus on **post-action confirmations**.
For each tool:
- Skill name
- Purpose
- Input parameters
- Return values
- Example tool call
- Example confirmation message the AI should send back to the user after success or failure

Example:
If add_task is successful, the AI should respond with:
"Task 'Buy groceries' created successfully with task_id 4."

Return results in md.

## Response snapshot

Generated comprehensive post-action confirmation Markdown at `.claude/skills/post-action-confirmations.md` covering all 5 MCP tools:

1. **add_task** — Success template with 4 scenario variants (simple, with description, as in-progress, low priority) + 10 failure messages (3 auth, 6 validation, 1 server).
2. **list_tasks** — 7 success variants (multiple tasks, single task, pending filter, priority filter, combined filter, empty list, filter-returns-nothing) with status display mapping + 3 failure messages.
3. **complete_task** — 2 direction-aware templates (marked completed vs reopened to pending) with 3 scenario examples + 4 resolution failures + 3 API failures.
4. **delete_task** — Full 3-phase flow: Phase 1 pre-action confirmation with confirm/cancel keyword tables, Phase 2 success after 204, Phase 3 cancellation acknowledgment + 4 resolution failures + 3 API failures.
5. **update_task** — Dynamic confirmation builder with per-field templates, Oxford comma joining rules for 2/3/4 fields, 9 scenario examples covering every field combination + 5 resolution failures + 9 API failures.
6. **Global confirmations** — Network errors, server errors, no-intent-detected, retry policy table.
7. **Quick reference** — All 5 tools with success template, pre-confirm flag, error response pattern, retry policy.

## Outcome

- ✅ Impact: Created the complete chatbot "voice" contract — every possible API outcome (success, auth error, validation error, not found, server error, resolution failure, user cancellation) has a defined, user-friendly message. The update_task dynamic builder with Oxford comma joining is the most sophisticated piece.
- 🧪 Tests: No automated tests — specification document. Can be validated by tracing each HTTP status code to its agent message.
- 📁 Files: 1 file created (.claude/skills/post-action-confirmations.md)
- 🔁 Next prompts: Implement the confirmation message builder in the conversation manager subagent; wire up the delete_task 3-phase flow with state management.
- 🧠 Reflection: The delete_task 3-phase flow is the most complex UX pattern — it requires holding state (resolved title + task_id) across conversational turns. The update_task dynamic builder requires tracking which fields were sent vs omitted to assemble the correct fragments.

## Evaluation notes (flywheel)

- Failure modes observed: None — all confirmations map to actual backend HTTP responses.
- Graders run and results (PASS/FAIL): Manual review PASS — every HTTPException in auth.py and tasks.py has a corresponding user-facing message. The 204 No Content for delete is correctly handled by remembering the title from resolution.
- Prompt variant (if applicable): Same intent as PHR-009 but requesting MD format instead of JSON.
- Next experiment (smallest change to try): Implement the dynamic confirmation builder as a utility function and test with all 9 update_task scenarios.
