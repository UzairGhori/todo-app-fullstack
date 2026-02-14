---
id: 011
title: Unified MCP Tool Definitions in Markdown
stage: general
date: 2026-02-11
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: natural prompt
labels: ["mcp-tools", "skills", "ai-chatbot", "unified-spec", "markdown"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/mcp-tool-definitions.md
tests:
  - none
---

## Prompt

skills : You are an expert AI tool generator.
Generate detailed **skills/tool definitions** for the Todo AI Chatbot project using MCP (Model Context Protocol) tools.

Each skill should include:
1. Skill name
2. Description / Purpose
3. Parameters (with types and meanings)
4. Return values (with types)
5. Example input
6. Example output
7. Expected error handling

Required skills (MCP Tools):
- add_task
- list_tasks
- complete_task
- delete_task
- update_task

Use the provided project context:
Users send natural language commands to the AI; the AI will call these tools to manage todos.
Return output in structured md format, labeled clearly.

## Response snapshot

Generated a unified Markdown reference at `.claude/skills/mcp-tool-definitions.md` combining all skill dimensions into one authoritative document:

1. **Shared Types** — TaskStatus, TaskPriority, TaskObject type definitions used across all tools.
2. **5 Complete Tool Definitions** — Each with: description, parameters table (types, constraints, defaults, meanings), return values table, HTTP method/endpoint, example input (user message + extracted JSON), example output (full API response), and agent confirmation message.
3. **Error Handling Per Tool** — Every HTTP status (401, 404, 422, 500) mapped to user-facing messages. Pre-API resolution errors (no reference, out-of-range, zero/multiple matches) with agent responses.
4. **delete_task 3-Phase Flow** — Resolve > Confirm > Execute with confirm/cancel keyword lists.
5. **update_task Dynamic Confirmations** — Change templates per field with joining rule for multi-field updates.
6. **Intent Detection Reference** — Trigger keywords per tool, priority inference, task reference resolution patterns, ambiguity protocol.
7. **Global Error Handling** — Cross-tool error table with retry policy (auth: never, 422: never, 404: never, 500: once, network: once).
8. **Quick Reference Table** — All 5 tools with method, endpoint, confirmation template, and pre-confirm flag.

## Outcome

- ✅ Impact: Single authoritative Markdown document that consolidates tool specs, intent mapping, confirmations, and error handling into one readable reference for the AI chatbot implementation.
- 🧪 Tests: No automated tests — specification document. All parameters, constraints, and errors verified against backend source (models/task.py, routers/tasks.py, dependencies/auth.py, main.py).
- 📁 Files: 1 file created (.claude/skills/mcp-tool-definitions.md)
- 🔁 Next prompts: Implement the chatbot agent that reads this spec; build the intent-parser; wire up the conversation manager with confirmation flow logic.
- 🧠 Reflection: Having a single Markdown reference is more maintainable than separate JSON/YAML/MD files for different aspects. This document serves as both human-readable documentation and agent-consumable context.

## Evaluation notes (flywheel)

- Failure modes observed: Previous session's JSON/YAML files were not persisted. Markdown-only approach is more resilient as a single file.
- Graders run and results (PASS/FAIL): Manual review PASS — all 5 tools cover all 7 required sections (name, description, parameters, returns, example input, example output, error handling).
- Prompt variant (if applicable): Same prompt as PHR-007 but requesting MD format instead of JSON/YAML.
- Next experiment (smallest change to try): Use this spec as system prompt context for the chatbot agent and verify it correctly routes 10 sample user messages.
