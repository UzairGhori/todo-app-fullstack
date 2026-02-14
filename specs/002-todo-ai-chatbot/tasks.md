# Tasks: Phase-3 — Todo AI Chatbot

**Input**: Design documents from `/specs/002-todo-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)
**Tests**: Out of scope for MVP (manual testing only)
**Organization**: Tasks grouped by implementation phase with user story mapping

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task supports (e.g., US1–US7, ALL)
- Exact file paths included in descriptions

---

## Phase 1: Setup & Infrastructure

**Purpose**: Install dependencies, configure environment, prepare project structure for Phase-3

- [ ] T001 [P] [ALL] Install `openai-agents` in `backend/requirements.txt`
  - **Description**: Add `openai-agents` package to backend dependencies
  - **Assumptions**: Python 3.11+ environment exists from Phase-2
  - **Dependencies**: None
  - **Priority**: High
  - **Acceptance Criteria**: `pip install -r requirements.txt` succeeds with `openai-agents` installed
  - **Test**: `python -c "from agents import Agent, Runner, function_tool"` runs without error

- [ ] T002 [P] [ALL] Install `@chatscope/chat-ui-kit-react` and styles in `frontend/package.json`
  - **Description**: Add `@chatscope/chat-ui-kit-react` and `@chatscope/chat-ui-kit-styles` to frontend
  - **Assumptions**: Node.js and npm installed, `frontend/` exists from Phase-2
  - **Dependencies**: None
  - **Priority**: High
  - **Acceptance Criteria**: `npm install` succeeds; imports resolve in TypeScript
  - **Test**: `import { MainContainer } from "@chatscope/chat-ui-kit-react"` compiles

- [ ] T003 [P] [ALL] Update `backend/.env.example` with `OPENAI_API_KEY`
  - **Description**: Add `OPENAI_API_KEY=your-openai-api-key` to `.env.example`
  - **Assumptions**: `.env.example` exists from Phase-2
  - **Dependencies**: None
  - **Priority**: High
  - **Acceptance Criteria**: `.env.example` contains `OPENAI_API_KEY` with placeholder value

- [ ] T004 [P] [ALL] Create `backend/app/agent/__init__.py`
  - **Description**: Initialize the agent module package
  - **Assumptions**: `backend/app/` structure exists from Phase-2
  - **Dependencies**: None
  - **Priority**: High
  - **Acceptance Criteria**: `from app.agent import ...` resolves without ImportError

**Checkpoint**: All dependencies installed, environment configured, agent module ready.

---

## Phase 2: Database Models (Foundational)

**Purpose**: Create Conversation and Message models — MUST complete before any chat feature work

**CRITICAL**: No chat endpoint or agent work can begin until these models exist

- [ ] T005 [ALL] Create Conversation and Message SQLModel models in `backend/app/models/conversation.py`
  - **Description**: Define Conversation model (id, user_id, title, created_at, updated_at), Message model (id, conversation_id, role, content, tool_calls, created_at), MessageRole enum ("user", "assistant"), and Pydantic schemas (ChatRequest, ChatResponse, MessageRead)
  - **Assumptions**: SQLModel patterns established in Phase-2 models (task.py, user.py)
  - **Dependencies**: None
  - **Priority**: High
  - **Acceptance Criteria**:
    - Conversation model has: id (UUID PK), user_id (str, indexed), title (str?, max 255), created_at (UTC), updated_at (UTC)
    - Message model has: id (UUID PK), conversation_id (str, indexed), role (MessageRole enum), content (str, max 5000), tool_calls (str?, JSON), created_at (UTC)
    - ChatRequest schema has: message (str, 1–2000 chars), conversation_id (str?, optional)
    - ChatResponse schema has: conversation_id (str), message (MessageRead)
  - **Test**: Models can be imported; `SQLModel.metadata.create_all()` creates both tables

- [ ] T006 [ALL] Register Conversation and Message models in `backend/app/main.py` for create_all
  - **Description**: Import Conversation model in main.py so `SQLModel.metadata.create_all(engine)` picks up the new tables
  - **Assumptions**: `main.py` lifespan already calls `create_all` (Phase-2 pattern)
  - **Dependencies**: T005
  - **Priority**: High
  - **Acceptance Criteria**: Backend startup creates `conversation` and `message` tables in PostgreSQL
  - **Test**: Start backend → check DB → both tables exist

**Checkpoint**: Database models ready. Conversation and Message tables created on startup.

---

## Phase 3: MCP Tools (Backend)

**Purpose**: Implement 5 tool functions that the AI agent will call to manage tasks

- [ ] T007 [P] [US1] Implement `add_task` tool in `backend/app/agent/tools.py`
  - **Description**: Create `add_task` function decorated with `@function_tool`. Takes title (required), description (optional), priority (optional), status (optional). Creates Task in DB scoped to user_id. Returns dict with task fields.
  - **Assumptions**: Task model and TaskCreate schema exist from Phase-2
  - **Dependencies**: T004 (agent module init)
  - **Priority**: High
  - **Acceptance Criteria**:
    - Function creates a task in DB with correct user_id
    - Returns dict with id, title, description, status, priority, created_at
    - Title is required; other fields have defaults (status=pending, priority=medium)
  - **User Story**: US1 — "Add a task to buy groceries" → agent calls `add_task(title="Buy groceries")`

- [ ] T008 [P] [US2] Implement `list_tasks` tool in `backend/app/agent/tools.py`
  - **Description**: Create `list_tasks` function. Takes optional status and priority filters. Queries Task table filtered by user_id + optional filters. Returns list of task dicts.
  - **Assumptions**: Task model queries established in Phase-2 tasks router
  - **Dependencies**: T004
  - **Priority**: High
  - **Acceptance Criteria**:
    - Returns all tasks for user when no filters
    - Filters by status when status parameter provided
    - Filters by priority when priority parameter provided
    - Returns empty list (not error) when no tasks match
    - Ordered by created_at DESC
  - **User Story**: US2 — "Show my pending tasks" → agent calls `list_tasks(status="pending")`

- [ ] T009 [P] [US3, US4, US5] Implement `complete_task`, `delete_task`, `update_task` tools in `backend/app/agent/tools.py`
  - **Description**: Three tools in same file:
    - `complete_task(task_id)`: Toggle status pending ↔ completed, return updated task
    - `delete_task(task_id)`: Delete task, return `{ deleted: true, task_id, title }`
    - `update_task(task_id, title?, description?, status?, priority?)`: Update fields, return updated task
    All verify task ownership (user_id match), return 404-style error dict if not found.
  - **Assumptions**: Task CRUD patterns from Phase-2 tasks router can be reused
  - **Dependencies**: T004
  - **Priority**: High
  - **Acceptance Criteria**:
    - complete_task toggles pending→completed and completed→pending
    - delete_task removes task and returns confirmation with title
    - update_task only changes provided fields, preserves others
    - All three return error dict if task_id not found or not owned by user
  - **User Story**: US3 — "Mark groceries as done", US4 — "Set groceries to high priority", US5 — "Delete groceries"

**Checkpoint**: All 5 MCP tools implemented. Each can be called independently with user_id and DB session.

---

## Phase 4: AI Agent Definition

**Purpose**: Create the OpenAI Agents SDK agent with instructions and tool bindings

- [ ] T010 [US1–US7] Create agent definition in `backend/app/agent/agent.py`
  - **Description**: Define the TaskFlow Assistant agent using OpenAI Agents SDK:
    - `Agent(name="TaskFlow Assistant", model="gpt-4o-mini", instructions=AGENT_INSTRUCTIONS, tools=[add_task, list_tasks, complete_task, delete_task, update_task])`
    - AGENT_INSTRUCTIONS: system prompt from spec Section 8 (capabilities, 8 rules)
    - Import all 5 tools from `tools.py`
  - **Assumptions**: `openai-agents` package installed (T001), tools implemented (T007–T009)
  - **Dependencies**: T001, T007, T008, T009
  - **Priority**: High
  - **Acceptance Criteria**:
    - Agent object created with name "TaskFlow Assistant"
    - Model set to "gpt-4o-mini"
    - All 5 tools registered
    - Instructions contain all 8 rules from spec
  - **Test**: `from app.agent.agent import agent` succeeds; `agent.tools` has length 5

**Checkpoint**: Agent defined with tools. Ready to wire into chat endpoint.

---

## Phase 5: Chat Router & Context Logic (Backend)

**Purpose**: Create the chat API endpoint with conversation management and agent execution

- [ ] T011 [US1–US7] Create chat router in `backend/app/routers/chat.py`
  - **Description**: Implement `POST /api/chat` endpoint:
    1. Auth via `get_current_user` dependency (existing)
    2. Validate request body (ChatRequest: message 1–2000 chars, optional conversation_id)
    3. If conversation_id provided → load conversation (verify user ownership) → 404 if not found
    4. If no conversation_id → create new Conversation(user_id)
    5. Save user Message(role="user", content=message)
    6. Load last 20 messages for conversation ordered by created_at ASC
    7. Format as list of `{"role": ..., "content": ...}` for agent
    8. Run agent via `Runner.run(agent, messages)` with 30-second timeout
    9. Extract agent's text response and tool_calls
    10. Save assistant Message(role="assistant", content=response, tool_calls=JSON)
    11. Update Conversation.updated_at
    12. Return ChatResponse JSON
  - **Error handling**:
    - OpenAI timeout/error → 500 `{"detail": "Unable to process your request. Please try again."}`
    - Invalid conversation_id → 404
    - Empty message → 400
    - Never expose OPENAI_API_KEY in any error response
  - **Assumptions**: Agent definition exists (T010), models exist (T005)
  - **Dependencies**: T005, T006, T010
  - **Priority**: High
  - **Acceptance Criteria**:
    - Endpoint requires JWT auth
    - Creates conversation on first message (no conversation_id)
    - Reuses conversation on follow-ups (with conversation_id)
    - Saves both user and assistant messages
    - Loads last 20 messages for context
    - Returns conversation_id + assistant message + tool_calls
    - Handles OpenAI errors gracefully (30s timeout, user-friendly message)
    - Never leaks API key
  - **User Story**: Supports ALL user stories (US1–US7) — central endpoint

- [ ] T012 [ALL] Include chat router in `backend/app/main.py`
  - **Description**: Add `from app.routers import chat` and `app.include_router(chat.router)` to main.py
  - **Assumptions**: main.py pattern established with auth, health, tasks routers
  - **Dependencies**: T011
  - **Priority**: High
  - **Acceptance Criteria**: `POST /api/chat` is accessible; returns 401 without JWT, 400 with empty body
  - **Test**: `curl -X POST http://localhost:8000/api/chat` returns 401

**Checkpoint**: Full backend complete. Chat endpoint operational with agent + tools + conversation persistence.

---

## Phase 6: Frontend — Chat Page (US1–US7)

**Purpose**: Build the ChatKit-powered chat UI on `/chat` page

### User Story 1 — Chat-Based Task Creation (Priority: P1)

**Goal**: User creates tasks via natural language in chat
**Independent Test**: Sign in → /chat → "Add a task to buy groceries" → agent confirms → task appears in /dashboard

- [ ] T013 [US1] Create chat page at `frontend/app/chat/page.tsx`
  - **Description**: Build the chat interface using `@chatscope/chat-ui-kit-react`:
    - Import chatscope styles in the page or layout
    - Components: `MainContainer`, `ChatContainer`, `MessageList`, `Message`, `MessageInput`, `TypingIndicator`
    - State: `messages` array (for UI display), `conversationId` (null initially), `isTyping` (boolean)
    - Auth guard: check `isAuthenticated()` on mount, redirect to `/signin` if not
    - Fresh conversation on every page visit (conversationId starts null)
    - On message send:
      1. Add user message to messages state (display immediately)
      2. Set isTyping = true
      3. Call `fetchWithAuth("/api/chat", { method: "POST", body: { message, conversation_id } })`
      4. On success: set isTyping = false, add assistant message to state, store conversation_id
      5. On error: set isTyping = false, add error message to chat display
    - Layout: full-height chat container with header "TaskFlow Chat" and back-to-dashboard link
    - Responsive: works on 320px mobile and 1920px desktop
  - **Assumptions**: `@chatscope/chat-ui-kit-react` installed (T002), backend chat endpoint deployed (T012)
  - **Dependencies**: T002, T012
  - **Priority**: High
  - **Acceptance Criteria**:
    - Chat page loads at `/chat` with input bar and empty message area
    - User can type and send messages
    - Typing indicator shows while waiting for response
    - Assistant responses display in chat bubbles
    - Redirects to /signin if not authenticated
    - conversation_id stored after first response for follow-ups
    - Responsive on mobile and desktop
  - **User Story**: US1 — "Add a task to buy groceries" → message sent → agent responds with confirmation

### User Story 2 — Chat-Based Task Listing (Priority: P1)

**Goal**: User asks to see tasks and gets formatted list in chat
**Independent Test**: Create tasks via dashboard → /chat → "Show my tasks" → all tasks listed

*(Covered by T013 — same chat page handles all intents. No additional frontend task needed.)*

### User Story 3 — Chat-Based Task Completion (Priority: P1)

**Goal**: User marks tasks complete via chat
**Independent Test**: Create task → /chat → "Mark it as done" → task status changes

*(Covered by T013 — same chat page. Agent handles intent via complete_task tool.)*

### User Story 4 — Chat-Based Task Update (Priority: P2)

*(Covered by T013 — agent handles via update_task tool.)*

### User Story 5 — Chat-Based Task Deletion (Priority: P2)

*(Covered by T013 — agent handles via delete_task tool.)*

### User Story 6 — Conversation Continuity (Priority: P2)

**Goal**: Agent understands context from previous messages in same session
**Independent Test**: "Add groceries" → "Make it high priority" → agent updates groceries task

*(Covered by T013 + T011 — frontend sends conversation_id, backend loads last 20 messages.)*

### User Story 7 — Off-Topic & Error Handling (Priority: P3)

**Goal**: Agent redirects non-task queries and handles errors gracefully
**Independent Test**: "What's the weather?" → agent redirects to task management

*(Covered by T013 + T010 — agent instructions handle off-topic, frontend displays error messages.)*

---

## Phase 7: Navigation Update

**Purpose**: Connect the chat page to the existing dashboard navigation

- [ ] T014 [P] [ALL] Add Chat navigation link to `frontend/app/dashboard/layout.tsx`
  - **Description**: Add a "Chat" link/button in the dashboard navigation bar (next to TaskFlow logo or in header). Should navigate to `/chat`. Use an appropriate chat icon (SVG inline or emoji-free).
  - **Assumptions**: Dashboard layout exists from Phase-2 with nav bar
  - **Dependencies**: T013 (chat page must exist to link to)
  - **Priority**: Medium
  - **Acceptance Criteria**:
    - "Chat" link visible in dashboard nav bar
    - Clicking navigates to `/chat`
    - Chat page also has a link back to `/dashboard`
  - **Test**: Sign in → see "Chat" in nav → click → arrive at /chat → click back → arrive at /dashboard

---

## Phase 8: End-to-End Verification & Polish

**Purpose**: Verify the complete flow works and fix any integration issues

- [ ] T015 [ALL] End-to-end manual testing — full chat CRUD flow
  - **Description**: Perform the complete test scenario from plan Section 11:
    1. Sign in → navigate to `/chat`
    2. "Add a task to buy groceries with high priority" → verify created
    3. "Show my tasks" → verify listed with status/priority
    4. "Mark buy groceries as done" → verify toggled to completed
    5. "Set buy groceries to low priority" → verify priority changed
    6. "Delete buy groceries" → verify removed
    7. Navigate to `/dashboard` → verify changes reflected
    8. Multi-turn: "Add call dentist" → "Make it high priority" → verify context works
    9. Off-topic: "What's the weather?" → verify redirect
    10. Error: remove JWT → send message → verify 401 redirect
  - **Assumptions**: All previous tasks complete (T001–T014)
  - **Dependencies**: T001–T014
  - **Priority**: High
  - **Acceptance Criteria**:
    - All 10 test scenarios pass
    - No console errors or API key leakage
    - Dashboard still works (Phase-2 regression check)
    - Chat UI responsive on mobile
  - **Test**: All scenarios documented in plan Section 11

- [ ] T016 [ALL] Fix any issues discovered during E2E testing
  - **Description**: Address bugs, edge cases, or UI issues found during T015
  - **Assumptions**: T015 may reveal issues
  - **Dependencies**: T015
  - **Priority**: High
  - **Acceptance Criteria**: All T015 test scenarios pass after fixes

---

## Phase 9: Deployment

**Purpose**: Deploy updated backend and frontend to production

- [ ] T017 [P] [ALL] Deploy backend to HuggingFace Spaces
  - **Description**:
    1. Ensure `OPENAI_API_KEY` is set in HuggingFace Spaces secrets
    2. Push updated backend code (new files + updated requirements.txt + main.py)
    3. Wait for Docker build to complete
    4. Verify: `GET /api/health` returns healthy
    5. Verify: `POST /api/chat` returns 401 (auth required)
  - **Assumptions**: HuggingFace Space exists from Phase-2
  - **Dependencies**: T016
  - **Priority**: High
  - **Acceptance Criteria**: Backend live with chat endpoint accessible; new DB tables auto-created

- [ ] T018 [P] [ALL] Deploy frontend to Vercel
  - **Description**:
    1. Verify `NEXT_PUBLIC_API_URL` points to HuggingFace Spaces URL
    2. Push updated frontend code (new chat page + updated layout + package.json)
    3. Deploy via `vercel --prod` or Git push
    4. Verify: `/chat` page loads with ChatKit UI
    5. Test full chat flow in production browser
  - **Assumptions**: Vercel project exists from Phase-2
  - **Dependencies**: T016, T017
  - **Priority**: High
  - **Acceptance Criteria**: Chat page accessible in production; full CRUD flow works; CORS allows requests

- [ ] T019 [ALL] Post-deployment verification
  - **Description**: Run full E2E test (T015 scenarios) on production deployment
  - **Assumptions**: T017 and T018 deployed successfully
  - **Dependencies**: T017, T018
  - **Priority**: High
  - **Acceptance Criteria**:
    - Chat creates/lists/completes/updates/deletes tasks in production
    - Dashboard still works
    - No API keys in browser console/network
    - Mobile responsive
    - CORS working

**Checkpoint**: Phase-3 fully deployed and verified in production.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (T001–T004)          ← No dependencies, all parallel
    │
Phase 2: DB Models (T005–T006)      ← Depends on T004 (agent init)
    │
Phase 3: MCP Tools (T007–T009)      ← Depends on T004, parallel with Phase 2
    │
Phase 4: Agent (T010)               ← Depends on T001, T007–T009
    │
Phase 5: Chat Router (T011–T012)    ← Depends on T005, T006, T010
    │
Phase 6: Chat Page (T013)           ← Depends on T002, T012
    │
Phase 7: Navigation (T014)          ← Depends on T013
    │
Phase 8: E2E Testing (T015–T016)    ← Depends on ALL above
    │
Phase 9: Deployment (T017–T019)     ← Depends on T016
```

### Critical Path

```
T001 → T007/T008/T009 → T010 → T011 → T012 → T013 → T015 → T017/T018 → T019
```

### Parallel Opportunities

| Parallel Group | Tasks | Reason |
|---------------|-------|--------|
| Setup | T001, T002, T003, T004 | Different files, no deps |
| MCP Tools | T007, T008, T009 | Different functions in same file, independent logic |
| Tools + Models | T005 & T007–T009 | Models and tools can be written simultaneously |
| Deployment | T017, T018 | Backend and frontend deploy independently |

---

## Implementation Strategy

### Recommended Execution Order (Solo Developer)

```
Step 1:  T001, T002, T003, T004    (Setup — all parallel)
Step 2:  T005                       (DB models)
Step 3:  T007, T008, T009           (MCP tools — parallel)
Step 4:  T006, T010                 (Register models + Agent definition)
Step 5:  T011, T012                 (Chat router + wire into main)
Step 6:  T013                       (Chat page — largest frontend task)
Step 7:  T014                       (Navigation link)
Step 8:  T015, T016                 (E2E testing + fixes)
Step 9:  T017, T018, T019           (Deploy + verify)
```

### MVP First (Minimum Chat Works)

1. Complete T001–T012 (backend fully functional)
2. Complete T013 (chat page)
3. **STOP and VALIDATE**: Full chat CRUD flow works locally
4. Then T014–T019 (polish + deploy)

---

## Task Summary

| Phase | Tasks | Count | Priority |
|-------|-------|-------|----------|
| 1. Setup & Infrastructure | T001–T004 | 4 | High |
| 2. Database Models | T005–T006 | 2 | High |
| 3. MCP Tools | T007–T009 | 3 | High |
| 4. AI Agent | T010 | 1 | High |
| 5. Chat Router | T011–T012 | 2 | High |
| 6. Chat Page | T013 | 1 | High |
| 7. Navigation | T014 | 1 | Medium |
| 8. E2E Testing | T015–T016 | 2 | High |
| 9. Deployment | T017–T019 | 3 | High |
| **Total** | | **19** | |

---

## Notes

- [P] tasks = different files, no dependencies — can run simultaneously
- All Phase-2 code remains unchanged except: `main.py` (2 imports + 1 router), `dashboard/layout.tsx` (1 nav link), `requirements.txt` (1 line), `package.json` (2 deps)
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- The chat page (T013) is the single largest task — consider breaking it down further if needed during implementation
