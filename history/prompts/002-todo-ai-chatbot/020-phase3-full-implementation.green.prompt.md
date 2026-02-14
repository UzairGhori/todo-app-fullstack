---
id: 020
title: Phase-3 Full Implementation — AI Chatbot Backend + Frontend
stage: green
date: 2026-02-13
surface: agent
model: claude-opus-4-6
feature: 002-todo-ai-chatbot
branch: main
user: developer
command: continue last mcp server connecting building
labels: ["implementation", "mcp-tools", "agent", "chat-ui", "openai-agents-sdk"]
links:
  spec: specs/002-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/requirements.txt
  - backend/.env.example
  - backend/app/config.py
  - backend/app/agent/__init__.py
  - backend/app/agent/tools.py
  - backend/app/agent/agent.py
  - backend/app/models/conversation.py
  - backend/app/routers/chat.py
  - backend/app/main.py
  - frontend/app/chat/page.tsx
  - frontend/app/dashboard/layout.tsx
tests:
  - Manual: pip install -r requirements.txt succeeds with openai-agents
  - Manual: Backend starts and creates conversation + message tables
  - Manual: POST /api/chat returns 401 without JWT
  - Manual: Full chat CRUD flow via /chat page
---

## Prompt

continue last mcp server connecting building

## Response snapshot

Implemented the complete Phase-3 AI Chatbot stack across 9 files (7 new, 2 modified):

**Backend:**
- Added `openai-agents` dependency and `OPENAI_API_KEY` config
- Created `Conversation` and `Message` SQLModel models with `ChatRequest`/`ChatResponse` Pydantic schemas
- Implemented 5 MCP tools (`add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`) using OpenAI Agents SDK `@function_tool` with `RunContextWrapper[AgentContext]` for user_id + session injection
- Defined the TaskFlow Assistant agent (gpt-4o-mini, 8 behavioral rules, 5 tools)
- Built `POST /api/chat` endpoint with: JWT auth, conversation creation/loading, message persistence, context reconstruction (last 20 messages), agent execution via `Runner.run()`, tool call extraction, error handling
- Registered all new models and chat router in `main.py`

**Frontend:**
- Built custom chat UI on `/chat` with: message bubbles, typing indicator, suggestion chips, auth guard, responsive design (matches existing premium Tailwind theme)
- Added "Chat" nav button to dashboard layout

## Outcome

- Impact: Full AI chatbot pipeline from user message to tool execution to DB persistence to UI display
- Tests: Manual testing required — install deps, set OPENAI_API_KEY, run backend + frontend, test chat CRUD
- Files: 9 files (7 new, 2 modified)
- Next prompts: E2E testing (T015), deployment to HuggingFace + Vercel (T017-T018)
- Reflection: Used custom Tailwind chat UI instead of ChatKit library to avoid React 19 compatibility issues while maintaining design consistency

## Evaluation notes (flywheel)

- Failure modes observed: None yet — implementation only, needs runtime testing
- Graders run and results (PASS/FAIL): N/A (manual testing phase)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run backend locally, verify table creation and chat endpoint response
