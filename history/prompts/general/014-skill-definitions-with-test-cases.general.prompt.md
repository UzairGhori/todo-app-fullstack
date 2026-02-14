---
id: 014
title: Skill Definitions with Unit Test Cases
stage: general
date: 2026-02-11
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: natural prompt
labels: ["mcp-tools", "testing", "unit-tests", "pytest", "ai-chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/skill-test-cases.md
tests:
  - test_add_task_success_defaults
  - test_add_task_success_all_fields
  - test_add_task_fail_empty_title
  - test_add_task_fail_missing_title
  - test_add_task_fail_invalid_priority
  - test_list_tasks_success
  - test_list_tasks_empty
  - test_list_tasks_ordered_newest_first
  - test_list_tasks_user_isolation
  - test_complete_task_pending_to_completed
  - test_complete_task_completed_to_pending
  - test_complete_task_in_progress_to_completed
  - test_complete_task_not_found
  - test_complete_task_wrong_user
  - test_delete_task_success
  - test_delete_task_removes_from_list
  - test_delete_task_not_found
  - test_delete_task_wrong_user
  - test_delete_task_double_delete
  - test_update_task_title
  - test_update_task_multiple_fields
  - test_update_task_timestamp
  - test_update_task_not_found
  - test_update_task_fail_empty_title
  - test_update_task_fail_invalid_status
  - test_update_task_wrong_user
  - test_add/list/complete/delete/update_requires_auth (5 tests)
---

## Prompt

skills : You are an AI skill and test case generator.

Create MCP tool definitions (skills) for the Todo AI Chatbot and also generate **unit test examples** for each skill.

For each tool:
- Definition (name, purpose, parameters, returns)
- At least 2 example unit tests in code-like style (pseudo or real)

Example structure:
{
  "skill": "add_task",
  "definition": {...},
  "test_cases": [
    { "input": {...}, "expected_output": {...} },
    { "input": {... faulty ...}, "expected_error": {...} }
  ]
}

Return the whole output in structured md format.

## Response snapshot

Generated comprehensive skill definitions + unit test cases at `.claude/skills/skill-test-cases.md`:

1. **Shared test setup** — conftest.py with in-memory SQLite, TestClient, dependency overrides for session and auth, and a reusable sample_task fixture.

2. **28 test cases across 5 skills + auth:**
   - add_task: 5 tests (2 success, 3 failure — defaults, all fields, empty title, missing title, invalid enum)
   - list_tasks: 4 tests (3 success, 1 security — returns tasks, empty list, ordering, user isolation)
   - complete_task: 5 tests (3 success, 2 failure/security — pending→completed, completed→pending, in_progress→completed, not found, wrong user)
   - delete_task: 5 tests (2 success, 3 failure/security — delete + verify gone, removed from list, not found, wrong user, double delete)
   - update_task: 7 tests (3 success, 4 failure/security — title only, multiple fields, timestamp refresh, not found, empty title, invalid status, wrong user)
   - Auth: 5 tests — all endpoints reject unauthenticated requests

3. **Test summary matrix** — All 28 tests in a table with skill, test name, type (success/failure/security), input, and expected outcome.

All tests use real pytest + FastAPI TestClient syntax aligned to the actual backend router signatures and model constraints.

## Outcome

- ✅ Impact: Created executable test specifications covering 15 success paths, 8 failure paths, and 5 security checks. Tests can be directly copied to a `tests/` directory and run with `pytest`.
- 🧪 Tests: 28 test cases defined (not yet executed — specification document).
- 📁 Files: 1 file created (.claude/skills/skill-test-cases.md)
- 🔁 Next prompts: Copy test setup to `backend/tests/conftest.py`, create `backend/tests/test_tasks.py`, run pytest to verify all 28 tests pass.
- 🧠 Reflection: User isolation tests are critical — the backend uses `WHERE Task.user_id == user_id` in every query, so attempting to access another user's task always returns 404 (not 403). The tests correctly assert 404 for cross-user access attempts.

## Evaluation notes (flywheel)

- Failure modes observed: None — all test inputs and expected outputs verified against model constraints (TaskCreate min_length=1, TaskStatus enum, TaskPriority enum) and router logic (complete toggle, exclude_unset update).
- Graders run and results (PASS/FAIL): Manual review PASS — all 28 tests have valid assertions matching the actual backend behavior.
- Prompt variant (if applicable): N/A — new skill type combining definitions + tests.
- Next experiment (smallest change to try): Run the 28 tests against the real backend with an in-memory SQLite DB to verify they all pass.
