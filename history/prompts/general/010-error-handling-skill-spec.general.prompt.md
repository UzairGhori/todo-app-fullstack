---
id: 010
title: Error Handling Skill Specification
stage: general
date: 2026-02-11
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: natural prompt
labels: ["error-handling", "mcp-tools", "ai-chatbot", "resilience"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/error-handling-spec.md
tests:
  - none
---

## Prompt

skills : You are an AI tool specification expert.

Generate MCP skill definitions for the Todo AI Chatbot that include:
- Skill name, purpose, parameters, return values
- How each tool should handle:
  - invalid user_id
  - missing required parameter
  - task not found
  - database error
  - empty or malformed input

Include clear instructions for how the agent should respond in each error case.

Return md

## Response snapshot

Generated comprehensive error handling specification at `.claude/skills/error-handling-spec.md` containing:

1. **Error Taxonomy** — 11 distinct error codes (E-AUTH-01 through E-AUTH-04, E-VALID-01 through E-VALID-03, E-NOTFOUND, E-DB-01, E-DB-02, E-SERVER) mapped to their exact backend source code locations.

2. **Per-tool error matrices** for all 5 tools (add_task, list_tasks, complete_task, delete_task, update_task), each covering:
   - Invalid user_id / auth failure (4 variants: no token, expired, invalid, no subject)
   - Missing required parameter (tool-specific: no title for add, no task reference for complete/delete/update, no fields for update)
   - Task not found (4 resolution variants: positional out-of-range, zero title matches, multiple title matches, UUID 404)
   - Database error (connection failure, query failure)
   - Empty/malformed input (empty title, title too long, desc too long, bad enum values)

3. **Global error handling** — Network unreachable, timeout, CORS, 502/503/504, rate limiting.

4. **Agent error response rules** — 6 principles including retry policy (auth: never, validation: never, 404: never, 500: once, network: once) and a complete decision tree flowchart.

All error responses traced directly to backend source: `auth.py:29-32` (token errors), `auth.py:52-56` (no subject), `tasks.py:55-58` (404), `main.py:40-45` (global 500 handler).

## Outcome

- ✅ Impact: Created the definitive error handling contract covering every failure path between the AI chatbot agent and FastAPI backend. Every HTTP status code from every endpoint has a mapped user-facing message.
- 🧪 Tests: No automated tests — specification document. Can be validated by tracing each error code to its backend raise statement.
- 📁 Files: 1 file created (.claude/skills/error-handling-spec.md)
- 🔁 Next prompts: Implement error handling middleware in the chatbot agent; build retry logic for 500/network errors; add error telemetry/logging.
- 🧠 Reflection: The delete_task tool has the most complex error surface because it combines pre-action confirmation (stateful conversation), resolution ambiguity, 404 after confirmation (race condition if task deleted between confirm and execute), and DB errors during delete. The agent must handle all of these gracefully.

## Evaluation notes (flywheel)

- Failure modes observed: None — all error paths verified against actual backend source code.
- Graders run and results (PASS/FAIL): Manual review PASS — every HTTPException and global_exception_handler in the codebase has a corresponding entry in the error taxonomy.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Simulate each error scenario via curl/httpie and verify the actual API response matches the documented detail strings.
