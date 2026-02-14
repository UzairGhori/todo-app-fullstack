---
id: 009
title: Post-Action Confirmation Skill Definitions
stage: general
date: 2026-02-11
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: natural prompt
labels: ["post-action", "confirmations", "mcp-tools", "ai-chatbot", "ux"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/post-action-confirmations.json
tests:
  - none
---

## Prompt

skills : You are an AI skill designer.

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

Return results in JSON or YAML.

## Response snapshot

Generated comprehensive post-action confirmation skill definitions at `.claude/skills/post-action-confirmations.json` covering all 5 MCP tools:

1. **add_task** — 3 success variants (simple, with description, as in_progress) + 4 error types (401 not authenticated, 401 token expired, 422 validation, 500 server error).
2. **list_tasks** — 4 success variants (with tasks, with filter, empty list, filter returns nothing) + 2 error types.
3. **complete_task** — 2 success variants (toggled to completed, toggled back to pending) + 4 error types including ambiguous/no-match resolution failures.
4. **delete_task** — Full 3-phase flow: pre-action confirmation prompt with user response keywords (confirm/cancel), success message, cancellation message + 4 error types.
5. **update_task** — Dynamic change summary templates that join multiple field changes with "and" (e.g., "title changed to 'X' and priority set to high") + 6 success examples covering single/multi/all field updates + 4 error types.

Also includes: global error handling (network, timeout, rate limit, unknown), message formatting rules (status/priority display names, task list line format, pluralization).

## Outcome

- ✅ Impact: Created the complete AI-to-user response contract. Every possible tool call outcome (success, error, resolution failure, user cancellation) now has a defined confirmation message template.
- 🧪 Tests: No automated tests — specification file. Templates can be validated by tracing each API status code to its corresponding agent message.
- 📁 Files: 1 file created (.claude/skills/post-action-confirmations.json)
- 🔁 Next prompts: Wire confirmation templates into the conversation manager subagent; implement the delete confirmation flow with user response parsing.
- 🧠 Reflection: The delete_task pre-action confirmation is the most complex flow — it requires holding state (resolved task title/ID) across two conversational turns (ask confirmation -> parse yes/no -> execute or cancel). This is the only tool that interrupts the parse-call-confirm cycle.

## Evaluation notes (flywheel)

- Failure modes observed: None — all confirmation templates traced back to actual backend HTTP status codes and error detail strings.
- Graders run and results (PASS/FAIL): Manual review PASS — every error in auth.py (401 Not authenticated, 401 Token expired, 401 Invalid token) and tasks.py (404 Task not found, 422 Validation) has a corresponding user-facing message.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test confirmation message generation by simulating 10 tool call responses and verifying the agent picks the correct template.
