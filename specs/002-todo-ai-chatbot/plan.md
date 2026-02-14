# Implementation Plan: Phase-3 — Todo AI Chatbot

**Branch**: `002-todo-ai-chatbot` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-todo-ai-chatbot/spec.md`

---

## 1. Project Summary

### Purpose & Vision

Transform the Phase-2 Todo web application into an AI-powered experience by adding a conversational chatbot interface. Users manage tasks through natural language — _"add a task to buy groceries"_, _"show my pending tasks"_, _"mark groceries as done"_ — powered by an OpenAI agent with MCP tool-calling capabilities.

### Core Features to Implement

1. **Chat Endpoint** — `POST /api/chat` with JWT auth, conversation persistence
2. **5 MCP Tools** — add_task, list_tasks, complete_task, delete_task, update_task
3. **AI Agent** — OpenAI Agents SDK (`gpt-4o-mini`) with tool bindings and instructions
4. **Chat UI** — `@chatscope/chat-ui-kit-react` on `/chat` page
5. **Conversation Persistence** — Conversation + Message models in PostgreSQL
6. **Context Reconstruction** — Load last 20 messages for agent context per request

---

## 2. Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLModel, `openai-agents`, `@chatscope/chat-ui-kit-react`, Next.js 16+, Tailwind CSS
**Storage**: PostgreSQL (Neon) — serverless, SSL required (existing from Phase-2)
**Testing**: Out of scope for MVP (per spec)
**Target Platform**: Web (modern browsers, responsive 320px–1920px)
**Project Type**: Web application (frontend + backend monorepo, extends Phase-2)
**Performance Goals**: Chat response < 30s (LLM included), UI load < 3s, no Phase-2 regressions
**Constraints**: 20-message context window, fresh conversation per page visit, no streaming, English only
**Scale/Scope**: 1 new endpoint, 2 new DB models, 5 MCP tools, 1 new page, nav updates

---

## 3. Constitution Check

*GATE: Must pass before implementation. Verified against Constitution v1.1.0.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Spec-Driven Development | PASS | Spec complete with 13 FRs (014–026), 5 NFRs (007–011), 7 SCs (008–014), 7 user stories |
| II | Security-First | PASS | FR-017 (user_id scoping on all tools), FR-025 (no API key leakage), JWT on chat endpoint |
| III | Clean Code & Separation | PASS | New router (chat.py), new models (conversation.py), tools in dedicated module, no cross-service imports |
| IV | Stateless Authentication | PASS | Chat endpoint uses same `get_current_user` JWT dependency from Phase-2 |
| V | Production-Ready | PASS | Env vars for OPENAI_API_KEY, error handling for LLM failures, Dockerfile update |
| VI | Smallest Viable Diff | PASS | Phase-2 code untouched. Only additive changes: new files, nav link update |
| VII | No Dead Code | PASS | No speculative features — all 5 tools serve spec'd user stories |
| VIII | Acceptance Criteria | PASS | All 7 user stories have Given/When/Then scenarios |
| IX | Demo-Ready | PASS | SC-014 (UI < 3s), SC-013 (no raw errors), responsive chat UI |
| X | Explicit Over Implicit | PASS | Model specified (gpt-4o-mini), timeout specified (30s), package specified (openai-agents) |

**Gate result**: PASS — proceed to implementation.

---

## 4. Phase Goals & Success Criteria

### What Denotes Completion of Phase-3

- [ ] A user can create, list, complete, update, and delete tasks via natural language chat
- [ ] Conversations are persisted in the database per user
- [ ] The agent uses MCP tools (never fabricates data)
- [ ] The Phase-2 dashboard remains fully functional
- [ ] The app is deployed (backend on HuggingFace Spaces, frontend on Vercel)

### Functional Test Cases

| Test | Expected Result |
|------|----------------|
| Type "Add a task to buy groceries" | Task created, agent confirms with title |
| Type "Show my tasks" | Agent lists all user's tasks with status/priority |
| Type "Mark buy groceries as done" | Task toggled to completed, agent confirms |
| Type "Set groceries to high priority" | Task priority updated, agent confirms |
| Type "Delete buy groceries" | Task deleted, agent confirms removal |
| Type "What's the weather?" | Agent redirects to task management |
| Type "Add a task" (no title) | Agent asks: "What should I call the task?" |
| Send message without JWT | 401 error returned |
| OpenAI API unreachable | 500 with user-friendly message, no key leakage |

### Performance & Stability Benchmarks

| Metric | Target |
|--------|--------|
| Chat API response (including LLM) | < 30 seconds |
| Chat API timeout | 30 seconds, no retry |
| Chat UI page load | < 3 seconds |
| Dashboard regression | Zero — all Phase-2 tests still pass |
| Context window | Last 20 messages per conversation |

---

## 5. Project Structure

### Documentation (this feature)

```text
specs/002-todo-ai-chatbot/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code — New & Modified Files

```text
backend/
├── app/
│   ├── main.py                    # MODIFIED — include chat router
│   ├── models/
│   │   ├── conversation.py        # NEW — Conversation + Message models
│   │   └── (task.py, user.py)     # UNCHANGED
│   ├── routers/
│   │   ├── chat.py                # NEW — POST /api/chat endpoint
│   │   └── (tasks.py, auth.py, health.py)  # UNCHANGED
│   ├── agent/
│   │   ├── __init__.py            # NEW
│   │   ├── agent.py               # NEW — Agent definition + instructions
│   │   └── tools.py               # NEW — 5 MCP tool functions
│   └── dependencies/
│       └── (auth.py, database.py) # UNCHANGED
├── requirements.txt               # MODIFIED — add openai-agents
└── .env.example                   # MODIFIED — add OPENAI_API_KEY

frontend/
├── app/
│   ├── chat/
│   │   └── page.tsx               # NEW — Chat page with @chatscope UI
│   └── dashboard/
│       └── layout.tsx             # MODIFIED — add Chat nav link
├── components/
│   └── (existing unchanged)
├── lib/
│   └── (api.ts, auth-client.ts)   # UNCHANGED — reused for chat requests
└── package.json                   # MODIFIED — add @chatscope/chat-ui-kit-react
```

**Structure Decision**: Extends Phase-2 web application structure. New backend module `agent/` contains agent definition and MCP tools. New frontend page `/chat`. All Phase-2 files remain unchanged except nav link and dependency lists.

---

## 6. Work Breakdown Structure (WBS)

### Backend (7 tasks)

| ID | Task | Dependencies |
|----|------|-------------|
| B1 | Create Conversation + Message SQLModel models | None |
| B2 | Create chat router with `POST /api/chat` endpoint | B1 |
| B3 | Implement `add_task` MCP tool function | None |
| B4 | Implement `list_tasks` MCP tool function | None |
| B5 | Implement `complete_task`, `delete_task`, `update_task` MCP tools | None |
| B6 | Create agent definition with OpenAI Agents SDK (gpt-4o-mini) | B3, B4, B5 |
| B7 | Wire agent into chat router with context reconstruction | B2, B6 |

### Frontend (3 tasks)

| ID | Task | Dependencies |
|----|------|-------------|
| F1 | Install `@chatscope/chat-ui-kit-react` and create `/chat` page | None |
| F2 | Wire chat page to `POST /api/chat` via `fetchWithAuth()` | F1, B7 |
| F3 | Update dashboard layout with Chat navigation link | None |

### Infrastructure (3 tasks)

| ID | Task | Dependencies |
|----|------|-------------|
| I1 | Update `requirements.txt` with `openai-agents` | None |
| I2 | Update `.env.example` with `OPENAI_API_KEY` | None |
| I3 | Register Conversation model in `main.py` for `create_all` | B1 |

### Integration & Deployment (2 tasks)

| ID | Task | Dependencies |
|----|------|-------------|
| D1 | End-to-end testing — full chat flow with all 5 tools | All B*, F*, I* |
| D2 | Deploy backend (HuggingFace) + frontend (Vercel) | D1 |

---

## 7. Timeline / Milestones

| Milestone | Description | Tasks | Status |
|-----------|-------------|-------|--------|
| **M1**: Spec & Architecture Review | Spec finalized, plan approved, constitution verified | Spec + Plan + Clarify | DONE |
| **M2**: Database & Infrastructure | Models created, dependencies added, env configured | B1, I1, I2, I3 | Pending |
| **M3**: MCP Tools | All 5 tool functions implemented and tested individually | B3, B4, B5 | Pending |
| **M4**: AI Agent Integration | Agent defined, tools bound, chat router wired with context logic | B2, B6, B7 | Pending |
| **M5**: ChatKit Frontend | Chat page built, API wired, navigation updated | F1, F2, F3 | Pending |
| **M6**: QA & Deployment | End-to-end testing, deployment to production | D1, D2 | Pending |

### Task Dependency Graph

```
I1, I2 ─────────────────────────────────┐
                                        │
B1 ──► I3 ──► B2 ──────────────────┐    │
                                   │    │
B3 ──┐                             │    │
B4 ──┼──► B6 ──► B7 ◄─────────────┘    │
B5 ──┘           │                      │
                 │                      │
F1 ──► F2 ◄─────┘                      │
                                        │
F3 (independent)                        │
                                        │
D1 ◄──── All above ────────────────────┘
D2 ◄──── D1
```

---

## 8. Dependencies

### SDK / Package Prerequisites

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `openai-agents` | latest | OpenAI Agents SDK (Agent, Runner, function_tool) | `pip install openai-agents` |
| `@chatscope/chat-ui-kit-react` | latest | Chat UI components | `npm install @chatscope/chat-ui-kit-react` |
| `@chatscope/chat-ui-kit-styles` | latest | Default CSS styles for chatscope | `npm install @chatscope/chat-ui-kit-styles` |

### Environment Configuration

| Variable | Service | Required |
|----------|---------|----------|
| `OPENAI_API_KEY` | Backend | Yes — must have sufficient quota |
| `DATABASE_URL` | Backend | Yes (existing) |
| `SECRET_KEY` | Backend | Yes (existing) |
| `FRONTEND_URL` | Backend | Yes (existing) |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes (existing) |

### Database Setup

- **No manual migration needed** — `SQLModel.metadata.create_all(engine)` auto-creates new tables on backend startup
- New tables: `conversation`, `message`
- Existing tables: `app_user`, `task` (unchanged)

---

## 9. Detailed Task List

### Phase A: Database Models & Infrastructure

**Task A1: Create Conversation and Message models**
- File: `backend/app/models/conversation.py` (NEW)
- Conversation: id (UUID), user_id (str, indexed), title (str?, max 255), created_at (UTC), updated_at (UTC)
- Message: id (UUID), conversation_id (str, indexed, FK), role (enum: user/assistant), content (str, max 5000), tool_calls (str?, JSON), created_at (UTC)
- MessageRole enum: "user", "assistant"
- Schemas: ConversationCreate, MessageCreate, MessageRead

**Task A2: Update infrastructure files**
- `backend/requirements.txt` — add `openai-agents`
- `backend/.env.example` — add `OPENAI_API_KEY`
- `backend/app/main.py` — import Conversation model for `create_all`, include chat router

### Phase B: MCP Tools

**Task B1: Implement add_task tool**
- File: `backend/app/agent/tools.py` (NEW)
- Decorated with `@function_tool`
- Parameters: title (str, required), description (str?, optional), priority (str?, optional), status (str?, optional)
- Creates Task via SQLModel session scoped to user_id
- Returns TaskRead dict

**Task B2: Implement list_tasks tool**
- Parameters: status (str?, optional), priority (str?, optional)
- Queries Task table filtered by user_id + optional status/priority
- Returns list of TaskRead dicts

**Task B3: Implement complete_task, delete_task, update_task tools**
- complete_task: Takes task_id, toggles status pending ↔ completed
- delete_task: Takes task_id, deletes task, returns confirmation
- update_task: Takes task_id + optional fields, updates matching task
- All tools verify task ownership (user_id match)

### Phase C: AI Agent

**Task C1: Create agent definition**
- File: `backend/app/agent/agent.py` (NEW)
- Define Agent with:
  - name: "TaskFlow Assistant"
  - model: "gpt-4o-mini"
  - instructions: Agent system prompt (from spec Section 8)
  - tools: [add_task, list_tasks, complete_task, delete_task, update_task]

**Task C2: Create chat router with context reconstruction**
- File: `backend/app/routers/chat.py` (NEW)
- `POST /api/chat` endpoint:
  - Auth: `get_current_user` dependency (existing)
  - Request: `{ message: str, conversation_id?: str }`
  - Logic:
    1. Validate message (1–2000 chars)
    2. Load or create Conversation (scoped to user_id)
    3. Save user Message
    4. Load last 20 messages for conversation (ordered by created_at ASC)
    5. Run agent via `Runner.run()` with message history
    6. Save assistant Message (with tool_calls JSON)
    7. Return response JSON
  - Timeout: 30 seconds on agent call
  - Error handling: catch OpenAI exceptions → 500 with user-friendly message

### Phase D: Frontend Chat UI

**Task D1: Install @chatscope and create /chat page**
- `npm install @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles`
- File: `frontend/app/chat/page.tsx` (NEW)
- Components used:
  - `MainContainer`, `ChatContainer`, `MessageList`, `Message`, `MessageInput`, `TypingIndicator`
- State: messages array, conversation_id, loading/typing indicator
- Auth guard: redirect to `/signin` if not authenticated
- Fresh conversation on every page visit

**Task D2: Wire chat API calls**
- Use `fetchWithAuth("/api/chat", { method: "POST", body: ... })`
- On send: add user message to UI, show typing indicator, call API
- On response: hide typing indicator, add assistant message to UI
- Store `conversation_id` from first response for follow-ups
- Handle errors: display error message in chat

**Task D3: Update navigation**
- File: `frontend/app/dashboard/layout.tsx` (MODIFIED)
- Add "Chat" link in navigation bar next to TaskFlow logo
- Chat page reuses same layout or has its own minimal layout with back-to-dashboard link

---

## 10. Risk & Mitigation

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|------------|------------|
| R1 | OpenAI API key quota exceeded | Chat stops working | Medium | Monitor usage; gpt-4o-mini is cheap ($0.15/1M tokens); set billing alerts |
| R2 | OpenAI API latency > 30s | User sees timeout error | Low | 30s timeout with clear error message; user can retry |
| R3 | `openai-agents` SDK API changes | Build breaks | Low | Pin version in requirements.txt; test before deploying |
| R4 | @chatscope incompatible with React 19 | UI won't render | Low | Test during F1; fallback to custom Tailwind chat UI if needed |
| R5 | CORS issues on deployed chat endpoint | Frontend can't reach API | Medium | Same CORS middleware as Phase-2; add `/api/chat` to same router prefix |
| R6 | Conversation table grows unbounded | DB performance degrades | Low | Out-of-scope for MVP; monitor; add cleanup job in future phase |
| R7 | Agent calls wrong tool | User gets unexpected result | Low | Clear agent instructions; gpt-4o-mini has strong tool-calling accuracy |

---

## 11. Testing & QA Plan

### Manual Test Scenarios (MVP — no automated testing)

**Chat CRUD Flow**:
1. Sign in → navigate to `/chat`
2. Type "Add a task to buy groceries with high priority" → verify task created
3. Type "Show my tasks" → verify groceries task listed
4. Type "Mark buy groceries as done" → verify status toggled
5. Type "Set buy groceries to low priority" → verify priority updated
6. Type "Delete buy groceries" → verify task removed
7. Navigate to `/dashboard` → verify task changes reflected

**Context & Multi-turn**:
1. Type "Add a task to call dentist" → confirmed
2. Type "Make it high priority" → verify "call dentist" updated (context reference)
3. Type "Show my tasks" → verify list
4. Type "Complete the first one" → verify first task toggled

**Error Handling**:
1. Type empty message → verify 400 error
2. Remove JWT from localStorage → send message → verify 401 redirect
3. Type "What's the weather?" → verify polite redirect
4. Type "Mark nonexistent task as done" → verify "task not found" response

**Regression**:
1. Verify `/dashboard` CRUD still works (create, edit, toggle, delete)
2. Verify signup/signin/signout flow unchanged
3. Verify mobile responsiveness on both dashboard and chat

---

## 12. Deployment & Launch Checklist

### Pre-Deployment

- [ ] `OPENAI_API_KEY` set in HuggingFace Spaces secrets
- [ ] `requirements.txt` includes `openai-agents`
- [ ] `frontend/package.json` includes `@chatscope/chat-ui-kit-react` and `@chatscope/chat-ui-kit-styles`
- [ ] All new models imported in `main.py` for `create_all`
- [ ] Chat router included in FastAPI app

### Backend Deployment (HuggingFace Spaces)

1. Push updated backend code
2. Verify Dockerfile unchanged (port 7860, uvicorn)
3. Add `OPENAI_API_KEY` to Spaces secrets
4. Wait for build → verify `GET /api/health` returns healthy
5. Test `POST /api/chat` with curl/Postman

### Frontend Deployment (Vercel)

1. Push updated frontend code
2. Verify `NEXT_PUBLIC_API_URL` points to HuggingFace Spaces URL
3. Deploy via `vercel --prod` or Git push
4. Verify `/chat` page loads
5. Test full chat flow in browser

### Post-Deployment Verification

- [ ] Chat page loads on mobile and desktop
- [ ] Task creation via chat works
- [ ] Task listing via chat works
- [ ] Dashboard still works (no regression)
- [ ] No API keys visible in browser console or network tab
- [ ] CORS allows chat requests from Vercel domain

---

## 13. Acceptance Criteria Mapping

| Spec Requirement | Implementation Location |
|-----------------|------------------------|
| FR-014 (chat endpoint) | `backend/app/routers/chat.py` POST /api/chat |
| FR-015 (OpenAI Agents SDK) | `backend/app/agent/agent.py` Agent definition |
| FR-016 (5 MCP tools) | `backend/app/agent/tools.py` 5 function_tool functions |
| FR-017 (user_id scoping) | `backend/app/agent/tools.py` all tools filter by user_id |
| FR-018 (conversation persistence) | `backend/app/routers/chat.py` save user + assistant messages |
| FR-019 (context reconstruction) | `backend/app/routers/chat.py` load last 20 messages |
| FR-020 (title resolution) | Agent instructions + list_tasks tool usage |
| FR-021 (ambiguity clarification) | Agent instructions rule #2 and #8 |
| FR-022 (off-topic redirect) | Agent instructions rule #6 |
| FR-023 (ChatKit UI) | `frontend/app/chat/page.tsx` @chatscope components |
| FR-024 (JWT on chat) | `frontend/lib/api.ts` fetchWithAuth (existing, reused) |
| FR-025 (error handling) | `backend/app/routers/chat.py` try/except → 500 |
| FR-026 (Phase-2 unchanged) | No modifications to existing Phase-2 route/model files |

---

## 14. Delivery Documentation

### Files to Deliver

| Document | Location | Purpose |
|----------|----------|---------|
| Spec | `specs/002-todo-ai-chatbot/spec.md` | Requirements and acceptance criteria |
| Plan | `specs/002-todo-ai-chatbot/plan.md` | This file — architecture and task breakdown |
| Tasks | `specs/002-todo-ai-chatbot/tasks.md` | Ordered implementation tasks (via /sp.tasks) |
| README | `README.md` (root) | Updated with Phase-3 chat feature description |
| API Reference | Inline in spec Section 6 | POST /api/chat request/response format |
| Setup Guide | `backend/.env.example`, `frontend/.env.local.example` | Environment variable documentation |

### Usage Examples (for README)

```
Chat with your tasks:
1. Sign in at /signin
2. Navigate to /chat
3. Type "Add a task to buy groceries with high priority"
4. Type "Show my tasks"
5. Type "Mark buy groceries as done"
6. Type "Delete buy groceries"
```

---

## Complexity Tracking

> No constitution violations detected. No complexity justifications needed.
> Phase-3 is strictly additive — no Phase-2 code is modified except:
> - `main.py` (add 2 import lines + 1 router include)
> - `dashboard/layout.tsx` (add 1 nav link)
> - `requirements.txt` (add 1 line)
> - `package.json` (add 2 dependencies)
