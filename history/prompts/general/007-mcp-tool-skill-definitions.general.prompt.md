---
id: 007
title: MCP Tool Skill Definitions Generated
stage: general
date: 2026-02-11
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: natural prompt
labels: ["mcp-tools", "skills", "ai-chatbot", "tool-definitions"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/mcp-tools.json
  - .claude/skills/mcp-tools.yaml
tests:
  - none
---

## Prompt

analyze a project than install all depedencies and laibraries for need this project

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
Return output in structured JSON or YAML format, labeled clearly.

## Response snapshot

1. **Project Analysis**: Full-stack Todo app (Next.js 16 + FastAPI + SQLModel + Neon PostgreSQL + JWT auth). Identified all files, structure, endpoints, and models.
2. **Dependency Installation**: Installed 356 npm packages for frontend (0 vulnerabilities) and verified all 7 Python backend packages already satisfied (fastapi, uvicorn, sqlmodel, PyJWT, python-dotenv, psycopg2-binary, bcrypt).
3. **Created `.claude/skills/` directory** per user request.
4. **Generated 5 MCP Tool Skill Definitions** in both JSON and YAML formats:
   - `add_task` — POST /api/tasks (create task from natural language)
   - `list_tasks` — GET /api/tasks (retrieve all user tasks, agent filters client-side)
   - `complete_task` — PATCH /api/tasks/{id}/complete (toggle completion)
   - `delete_task` — DELETE /api/tasks/{id} (permanent removal, requires confirmation)
   - `update_task` — PATCH /api/tasks/{id} (partial update of title/description/status/priority)
5. Each tool includes: parameters with types/constraints, return schema matching TaskRead model, example input/output, error handling (401/404/422).
6. Added **agent behavior config**: intent detection keyword mapping, 5-step task resolution strategy, priority inference from urgency keywords, confirmation rules.

## Outcome

- ✅ Impact: Created comprehensive MCP tool specifications that serve as the contract between the AI chatbot agent and the FastAPI backend. Both JSON (machine-readable) and YAML (human-readable) formats produced.
- 🧪 Tests: No tests added — these are specification/contract files, not executable code.
- 📁 Files: 2 files created (.claude/skills/mcp-tools.json, .claude/skills/mcp-tools.yaml)
- 🔁 Next prompts: Implement the AI chatbot agent that consumes these tool definitions; wire up the intent-parser subagent; build the MCP server bridge.
- 🧠 Reflection: Tool specs were derived directly from the existing backend models (TaskCreate, TaskUpdate, TaskRead) and router endpoints to ensure 1:1 alignment. The agent behavior section adds the NLP-to-tool mapping layer that the chatbot will need.

## Evaluation notes (flywheel)

- Failure modes observed: None — specifications generated cleanly from existing code.
- Graders run and results (PASS/FAIL): Manual review PASS — all 5 tools match backend endpoints, parameter types match SQLModel schemas, enum values match TaskStatus/TaskPriority.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate tool specs by running a dry-run intent parse against sample user messages.
