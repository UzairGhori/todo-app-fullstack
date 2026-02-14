# Feature Specification: Phase-3 — Todo AI Chatbot

**Feature Branch**: `002-todo-ai-chatbot`
**Created**: 2026-02-12
**Status**: Draft
**Input**: Transform the Phase-2 Todo web application into an AI-powered chatbot experience where users manage tasks through natural language conversation, powered by OpenAI Agents SDK, MCP tools, and a ChatKit frontend.

---

## 1. Title & Overview

**Project Name**: Todo AI Chatbot (Phase-3)

**Description**: Phase-3 extends the Phase-2 Todo full-stack web application by adding a conversational AI chatbot interface. Instead of clicking buttons and filling forms, users interact with an intelligent agent that understands natural language commands like _"add a task to buy groceries tomorrow"_ or _"show me my pending tasks"_. The agent translates user intent into structured tool calls against the existing Task API via the Model Context Protocol (MCP).

**Goals**:
- Provide a natural language interface for all task CRUD operations
- Maintain conversation history per user for context-aware responses
- Demonstrate AI agent architecture with tool-use capabilities
- Keep the existing dashboard UI intact as an alternative interface
- Deliver a marketplace-publishable, demo-ready product

---

## 2. Objectives

### What Phase-3 Delivers
- A ChatKit-powered chat UI integrated into the frontend
- An OpenAI Agents SDK-powered AI agent on the backend
- 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) exposed to the agent
- Conversation and message persistence in PostgreSQL
- Intent detection and natural language → tool mapping
- Confirmation and error response flows

### Key User Outcomes
- Users can manage all tasks via natural language without touching forms
- Conversation context is preserved across messages within a session
- The chatbot provides clear confirmations and handles errors gracefully
- Existing Phase-2 dashboard remains fully functional alongside the chatbot

---

## 3. Technology Stack

| Technology | Role | Description |
|-----------|------|-------------|
| **OpenAI Agents SDK** | AI Agent Runtime | Orchestrates the conversational agent using `gpt-4o-mini` model, handles tool selection, manages agent instructions and response generation |
| **FastAPI** | Backend Framework | Serves the chat API endpoint, hosts MCP tools, handles auth and routing (existing from Phase-2) |
| **@chatscope/chat-ui-kit-react** | Chat UI Library | Provides pre-built React chat components (MessageList, Message, MessageInput, TypingIndicator, Avatar) for the frontend. MIT license, no backend dependency. |
| **MCP (Model Context Protocol)** | Tool Protocol | Standardized protocol for exposing task operations as callable tools to the AI agent |
| **SQLModel** | ORM | Database models for Conversation and Message entities (extends Phase-2 models) |
| **Neon Serverless PostgreSQL** | Database | Persistent storage for conversations, messages, and tasks (existing from Phase-2) |
| **Next.js 16+ (App Router)** | Frontend Framework | Hosts the chat page and existing dashboard (existing from Phase-2) |
| **JWT (HS256)** | Authentication | Same auth system from Phase-2 — all chat endpoints require valid JWT |

---

## 4. Architecture Diagram & Explanation

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                │
│                                                     │
│  ┌──────────────┐         ┌──────────────────────┐  │
│  │  Dashboard   │         │   Chat Page           │  │
│  │  (Phase-2)   │         │   (ChatKit UI)        │  │
│  │  /dashboard  │         │   /chat               │  │
│  └──────┬───────┘         └──────────┬───────────┘  │
│         │                            │               │
│         │  fetchWithAuth()           │ fetchWithAuth()│
└─────────┼────────────────────────────┼───────────────┘
          │                            │
          │ REST API                   │ POST /api/chat
          ▼                            ▼
┌─────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI)                    │
│                                                     │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │ Task Router  │    │     Chat Router            │  │
│  │ /api/tasks/* │    │     POST /api/chat         │  │
│  │ (Phase-2)    │    │                            │  │
│  └──────────────┘    │  ┌─────────────────────┐   │  │
│                      │  │  OpenAI Agents SDK  │   │  │
│                      │  │  (AI Agent)         │   │  │
│                      │  │                     │   │  │
│                      │  │  Instructions +     │   │  │
│                      │  │  Tool Definitions   │   │  │
│                      │  └────────┬────────────┘   │  │
│                      └───────────┼────────────────┘  │
│                                  │                    │
│                    ┌─────────────▼──────────────┐    │
│                    │      MCP Tool Layer        │    │
│                    │                            │    │
│                    │  add_task()                │    │
│                    │  list_tasks()              │    │
│                    │  complete_task()           │    │
│                    │  delete_task()             │    │
│                    │  update_task()             │    │
│                    └─────────────┬──────────────┘    │
│                                  │                    │
│                    ┌─────────────▼──────────────┐    │
│                    │     SQLModel + Neon DB     │    │
│                    │                            │    │
│                    │  app_user  task            │    │
│                    │  conversation  message     │    │
│                    └───────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Flow Explanation

1. **User sends message** via ChatKit UI on `/chat` page
2. **Frontend** sends `POST /api/chat` with `{ message, conversation_id? }` + JWT Bearer token
3. **Chat Router** authenticates user via JWT, loads/creates conversation, saves user message
4. **OpenAI Agents SDK** receives the message + conversation history + agent instructions
5. **Agent decides** which MCP tool(s) to call based on user intent
6. **MCP Tool** executes the task operation against the database (scoped to user_id)
7. **Agent generates** a natural language response with confirmation/results
8. **Chat Router** saves the assistant message, returns response to frontend
9. **ChatKit UI** displays the assistant's response in the chat interface

---

## 5. Detailed Database Models

### Existing Models (Phase-2, unchanged)

#### Task
| Field | Type | Purpose |
|-------|------|---------|
| id | str (UUID) | Primary key |
| title | str (max 255) | Task title |
| description | str? (max 2000) | Optional task description |
| status | TaskStatus enum | pending / in_progress / completed |
| priority | TaskPriority enum | low / medium / high |
| user_id | str (indexed) | Owner's user ID |
| created_at | datetime (UTC) | Creation timestamp |
| updated_at | datetime (UTC) | Last update timestamp |

#### User (app_user)
| Field | Type | Purpose |
|-------|------|---------|
| id | str (UUID) | Primary key |
| email | str (unique, indexed) | Login identifier |
| name | str (max 255) | Display name |
| password | str | Bcrypt-hashed password |
| role | str (default: "user") | User role |
| created_at | datetime (UTC) | Registration timestamp |

### New Models (Phase-3)

#### Conversation
| Field | Type | Purpose |
|-------|------|---------|
| id | str (UUID) | Primary key |
| user_id | str (indexed) | Owner's user ID — per-user isolation |
| title | str? (max 255) | Auto-generated from first message (optional) |
| created_at | datetime (UTC) | Conversation start time |
| updated_at | datetime (UTC) | Last message time |

#### Message
| Field | Type | Purpose |
|-------|------|---------|
| id | str (UUID) | Primary key |
| conversation_id | str (indexed, FK) | Parent conversation |
| role | MessageRole enum | "user" or "assistant" |
| content | str (max 5000) | Message text |
| tool_calls | str? (JSON) | Serialized tool calls made by agent (nullable) |
| created_at | datetime (UTC) | Message timestamp |

---

## 6. API Endpoints

### Existing Endpoints (Phase-2, unchanged)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/token` | User login (returns JWT) |
| GET | `/api/tasks` | List user's tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Get single task |
| PATCH | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Toggle completion |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/health` | Health check |

### New Endpoint (Phase-3)

#### `POST /api/chat`

**Description**: Send a natural language message to the AI agent. The agent interprets intent, calls MCP tools as needed, and returns a conversational response.

**Authentication**: Required (JWT Bearer token)

**Request Body**:
```json
{
  "message": "Add a task to buy groceries with high priority",
  "conversation_id": "optional-uuid-for-existing-conversation"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's natural language input (1–2000 chars) |
| conversation_id | string? | No | UUID of existing conversation. If omitted, a new conversation is created. |

**Response (200 OK)**:
```json
{
  "conversation_id": "conv-uuid-123",
  "message": {
    "id": "msg-uuid-456",
    "role": "assistant",
    "content": "Done! I've added \"Buy groceries\" to your tasks with high priority. Anything else?",
    "tool_calls": [
      {
        "tool": "add_task",
        "input": { "title": "Buy groceries", "priority": "high" },
        "result": { "id": "task-uuid-789", "title": "Buy groceries", "status": "pending", "priority": "high" }
      }
    ],
    "created_at": "2026-02-12T10:30:00Z"
  }
}
```

**Error Responses**:

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Empty or invalid message | `{ "detail": "Message is required and must be 1-2000 characters" }` |
| 401 | Missing/invalid JWT | `{ "detail": "Not authenticated" }` |
| 404 | Conversation not found or belongs to another user | `{ "detail": "Conversation not found" }` |
| 500 | Agent/LLM failure | `{ "detail": "Unable to process your request. Please try again." }` |

---

## 7. MCP Tools (Skills) Design

### Tool 1: `add_task`

| Property | Value |
|----------|-------|
| **Name** | `add_task` |
| **Description** | Creates a new task for the authenticated user |
| **Parameters** | |
| &nbsp;&nbsp;`title` | string, **required** — Task title (1–255 chars) |
| &nbsp;&nbsp;`description` | string, optional — Task description (max 2000 chars) |
| &nbsp;&nbsp;`priority` | string, optional — "low", "medium" (default), or "high" |
| &nbsp;&nbsp;`status` | string, optional — "pending" (default), "in_progress", or "completed" |
| **Returns** | TaskRead object (id, title, description, status, priority, user_id, created_at, updated_at) |

**Example Input**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high"
}
```

**Example Output**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "priority": "high",
  "user_id": "user-uuid-123",
  "created_at": "2026-02-12T10:30:00Z",
  "updated_at": "2026-02-12T10:30:00Z"
}
```

---

### Tool 2: `list_tasks`

| Property | Value |
|----------|-------|
| **Name** | `list_tasks` |
| **Description** | Lists all tasks for the authenticated user, optionally filtered by status or priority |
| **Parameters** | |
| &nbsp;&nbsp;`status` | string, optional — Filter by "pending", "in_progress", or "completed" |
| &nbsp;&nbsp;`priority` | string, optional — Filter by "low", "medium", or "high" |
| **Returns** | Array of TaskRead objects |

**Example Input**:
```json
{
  "status": "pending"
}
```

**Example Output**:
```json
[
  {
    "id": "a1b2c3d4",
    "title": "Buy groceries",
    "status": "pending",
    "priority": "high",
    "created_at": "2026-02-12T10:30:00Z"
  },
  {
    "id": "b2c3d4e5",
    "title": "Call dentist",
    "status": "pending",
    "priority": "medium",
    "created_at": "2026-02-12T09:00:00Z"
  }
]
```

---

### Tool 3: `complete_task`

| Property | Value |
|----------|-------|
| **Name** | `complete_task` |
| **Description** | Toggles a task's completion status (pending ↔ completed) |
| **Parameters** | |
| &nbsp;&nbsp;`task_id` | string, **required** — UUID of the task to toggle |
| **Returns** | Updated TaskRead object |

**Example Input**:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Example Output**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries",
  "status": "completed",
  "priority": "high",
  "updated_at": "2026-02-12T11:00:00Z"
}
```

---

### Tool 4: `delete_task`

| Property | Value |
|----------|-------|
| **Name** | `delete_task` |
| **Description** | Permanently deletes a task belonging to the authenticated user |
| **Parameters** | |
| &nbsp;&nbsp;`task_id` | string, **required** — UUID of the task to delete |
| **Returns** | Confirmation object `{ "deleted": true, "task_id": "..." }` |

**Example Input**:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Example Output**:
```json
{
  "deleted": true,
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries"
}
```

---

### Tool 5: `update_task`

| Property | Value |
|----------|-------|
| **Name** | `update_task` |
| **Description** | Updates one or more fields of an existing task |
| **Parameters** | |
| &nbsp;&nbsp;`task_id` | string, **required** — UUID of the task to update |
| &nbsp;&nbsp;`title` | string, optional — New title (1–255 chars) |
| &nbsp;&nbsp;`description` | string, optional — New description (max 2000 chars) |
| &nbsp;&nbsp;`status` | string, optional — "pending", "in_progress", or "completed" |
| &nbsp;&nbsp;`priority` | string, optional — "low", "medium", or "high" |
| **Returns** | Updated TaskRead object |

**Example Input**:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries and snacks",
  "priority": "medium"
}
```

**Example Output**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries and snacks",
  "status": "pending",
  "priority": "medium",
  "updated_at": "2026-02-12T11:15:00Z"
}
```

---

## 8. AI Agent Specification

### Main Agent

**Name**: TaskFlow Assistant

**Instructions**:
```
You are TaskFlow Assistant, a helpful AI that manages the user's todo tasks through conversation.

CAPABILITIES:
- Create, list, update, complete, and delete tasks using your available tools.
- Answer questions about the user's tasks (counts, status, priorities).
- Provide brief, friendly confirmations after every action.

RULES:
1. Always use tools for task operations — never guess or fabricate task data.
2. When the user's intent is ambiguous, ask a clarifying question before acting.
3. When listing tasks, format them as a numbered list with status and priority.
4. After creating/updating/deleting a task, confirm what was done with the task title.
5. If a tool returns an error, explain the issue in user-friendly language.
6. If the user asks something unrelated to task management, politely redirect:
   "I'm your task management assistant. I can help you create, view, update, or delete tasks. What would you like to do?"
7. Keep responses concise — no more than 3 sentences unless listing tasks.
8. When deleting, confirm the task title before proceeding if the user only gave a partial match.
```

### Subagents

No subagents are required for MVP. The main agent handles all intents directly via tool calls. Subagent architecture can be introduced in future phases for:
- Priority-based scheduling recommendations
- Daily summary generation
- Smart task categorization

### Skills and Behavior Mapping

| User Intent | Agent Behavior | Tool Called |
|------------|---------------|-------------|
| Create a task | Extract title, description, priority → call tool | `add_task` |
| List/show tasks | Determine if filtered → call tool → format as list | `list_tasks` |
| Mark task done | Identify task by title/context → call tool | `complete_task` |
| Delete a task | Identify task → confirm if ambiguous → call tool | `delete_task` |
| Update a task | Identify task + changed fields → call tool | `update_task` |
| Greeting | Respond warmly, suggest actions | None |
| Off-topic | Politely redirect to task management | None |

---

## 9. Conversation Flow

### Step-by-Step Request → Response Lifecycle

```
1. User types: "Add a task to buy groceries with high priority"
   │
2. Frontend sends POST /api/chat
   │  { message: "Add a task to buy groceries with high priority",
   │    conversation_id: null }
   │  Headers: Authorization: Bearer <jwt>
   │
3. Chat Router:
   │  a. Verify JWT → extract user_id
   │  b. conversation_id is null → create new Conversation(user_id)
   │  c. Save Message(role="user", content="Add a task...")
   │  d. Load conversation history (all messages for this conversation)
   │
4. OpenAI Agents SDK:
   │  a. Build context: agent instructions + conversation history + user message
   │  b. Agent analyzes intent → decides to call add_task tool
   │  c. Agent calls add_task(title="Buy groceries", priority="high")
   │
5. MCP Tool Execution:
   │  a. add_task() creates Task in DB with user_id from auth context
   │  b. Returns TaskRead object to agent
   │
6. Agent Response Generation:
   │  a. Agent receives tool result
   │  b. Generates: "Done! I've added 'Buy groceries' with high priority. Anything else?"
   │
7. Chat Router:
   │  a. Save Message(role="assistant", content="Done!...", tool_calls=[...])
   │  b. Update Conversation.updated_at
   │  c. Return response JSON to frontend
   │
8. Frontend (@chatscope/chat-ui-kit-react):
      a. Receive response
      b. Display assistant message in chat bubble
      c. Store conversation_id in component state for follow-up messages
      d. Note: Each page visit starts a fresh conversation (no resume)
```

### Context Reconstruction Logic

For each chat request, the backend reconstructs conversation context by:

1. Loading all messages for the given `conversation_id` ordered by `created_at ASC`
2. Formatting them as `[{ role: "user"|"assistant", content: "..." }, ...]`
3. Passing the full history (up to last 20 messages) to the OpenAI Agents SDK
4. The agent uses this history to understand references like "mark **that** as done" or "delete **the first one**"

### Context Window Limit

- Maximum 20 messages per conversation are sent to the agent
- If conversation exceeds 20 messages, only the most recent 20 are included
- Older messages remain in the database but are not sent to the LLM

---

## 10. Intent to Tool Mapping

| Natural Language Example | Detected Intent | Tool | Parameters |
|-------------------------|----------------|------|------------|
| "Add a task to buy groceries" | create_task | `add_task` | `{ title: "Buy groceries" }` |
| "Create a high priority task: finish report" | create_task | `add_task` | `{ title: "Finish report", priority: "high" }` |
| "Show me my tasks" | list_tasks | `list_tasks` | `{}` |
| "What are my pending tasks?" | list_tasks | `list_tasks` | `{ status: "pending" }` |
| "Show high priority items" | list_tasks | `list_tasks` | `{ priority: "high" }` |
| "Mark buy groceries as done" | complete_task | `complete_task` | `{ task_id: "<resolved-uuid>" }` |
| "I finished the report task" | complete_task | `complete_task` | `{ task_id: "<resolved-uuid>" }` |
| "Delete the dentist appointment" | delete_task | `delete_task` | `{ task_id: "<resolved-uuid>" }` |
| "Remove task 3" | delete_task | `delete_task` | `{ task_id: "<resolved-uuid>" }` |
| "Change the report deadline to Friday" | update_task | `update_task` | `{ task_id: "<resolved-uuid>", title: "Report - due Friday" }` |
| "Set groceries to low priority" | update_task | `update_task` | `{ task_id: "<resolved-uuid>", priority: "low" }` |
| "Hello" | greeting | None | N/A |
| "What's the weather?" | off_topic | None | N/A |

### Task Resolution by Title

When the user references a task by name (not UUID), the agent:
1. Calls `list_tasks()` to get all user tasks
2. Matches the user's reference against task titles (case-insensitive partial match)
3. If exactly one match → proceeds with that task
4. If multiple matches → asks user to clarify: "I found multiple tasks matching 'groceries': 1. Buy groceries, 2. Order groceries online. Which one?"
5. If no match → responds: "I couldn't find a task matching 'groceries'. Would you like me to show all your tasks?"

---

## 11. Confirmation & Error Response Guidelines

### Success Confirmations

| Action | Agent Response Pattern |
|--------|----------------------|
| Task created | "Done! I've added **'{title}'** to your tasks with {priority} priority." |
| Task completed | "**'{title}'** has been marked as completed. Nice work!" |
| Task uncompleted | "**'{title}'** has been moved back to pending." |
| Task updated | "Updated **'{title}'** — {changed_fields}." |
| Task deleted | "**'{title}'** has been removed from your tasks." |
| Tasks listed (has tasks) | "Here are your {filter} tasks:\n1. {title} — {status}, {priority}\n..." |
| Tasks listed (empty) | "You don't have any {filter} tasks right now. Would you like to create one?" |

### Error Types and Fallback Messages

| Error Type | Agent Response |
|-----------|---------------|
| Task not found | "I couldn't find that task. Would you like me to show all your tasks?" |
| Ambiguous task reference | "I found multiple tasks matching that. Could you be more specific? Here are the matches: ..." |
| Missing required field | "I need a title to create a task. What should I call it?" |
| Tool execution failure | "Something went wrong while {action}. Please try again." |
| LLM/Agent failure | "I'm having trouble processing that right now. Please try again in a moment." |
| Off-topic request | "I'm your task management assistant. I can help you create, view, update, or delete tasks. What would you like to do?" |

---

## 12. Deployment Checklist

### Environment Variables (Backend)

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `SECRET_KEY` | JWT signing secret | `min-32-char-random-string` |
| `FRONTEND_URL` | CORS allowed origins | `https://your-app.vercel.app` |
| `OPENAI_API_KEY` | OpenAI API key for Agents SDK | `sk-...` |

### Environment Variables (Frontend)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://your-api.hf.space` |

### Database Migrations

- New tables: `conversation`, `message`
- Existing tables unchanged: `app_user`, `task`
- Tables auto-created via `SQLModel.metadata.create_all(engine)` on backend startup

### Deployment Steps

1. **Backend** (HuggingFace Spaces):
   - Update `requirements.txt` with `openai-agents` package (Official OpenAI Agents SDK)
   - Add `OPENAI_API_KEY` to Spaces secrets
   - Deploy updated Dockerfile
   - Verify: `GET /api/health` returns `{"status": "healthy"}`

2. **Frontend** (Vercel):
   - Set `NEXT_PUBLIC_API_URL` environment variable
   - Deploy via `vercel --prod` or Git push
   - Verify: `/chat` page loads with ChatKit UI

3. **CORS Configuration**:
   - Add Vercel production domain to `FRONTEND_URL`
   - Verify: Chat requests from frontend are not blocked by CORS

---

## 13. Deliverables

### Must-Complete Items

- [ ] **D-001**: `Conversation` and `Message` SQLModel models created and tables generated
- [ ] **D-002**: `POST /api/chat` endpoint implemented with JWT auth
- [ ] **D-003**: 5 MCP tools implemented (add_task, list_tasks, complete_task, delete_task, update_task)
- [ ] **D-004**: OpenAI Agents SDK integration with agent instructions and tool bindings
- [ ] **D-005**: Conversation history persistence (user + assistant messages saved to DB)
- [ ] **D-006**: Context reconstruction (load last 20 messages for agent context)
- [ ] **D-007**: ChatKit UI integrated on `/chat` page with message display and input
- [ ] **D-008**: Navigation updated — dashboard layout includes link to chat and vice versa
- [ ] **D-009**: Frontend sends JWT with chat requests via `fetchWithAuth()`
- [ ] **D-010**: Error handling — agent failures return user-friendly messages
- [ ] **D-011**: Task resolution by title — agent matches user references to task titles
- [ ] **D-012**: Off-topic handling — agent redirects non-task queries gracefully
- [ ] **D-013**: Backend deployed to HuggingFace Spaces with OPENAI_API_KEY configured
- [ ] **D-014**: Frontend deployed to Vercel with chat page accessible

---

## User Scenarios & Testing

### User Story 1 — Chat-Based Task Creation (Priority: P1)

An authenticated user opens the chat interface and creates a task by typing a natural language message.

**Why this priority**: Task creation via chat is the primary value proposition of Phase-3. Without this, the chatbot has no purpose.

**Independent Test**: Sign in, navigate to `/chat`, type "Add a task to buy groceries", verify the agent confirms creation and the task appears in the dashboard.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the chat page, **When** they type "Add a task to buy groceries", **Then** the agent creates the task and responds with a confirmation including the task title.
2. **Given** an authenticated user, **When** they type "Create a high priority task: finish report by Friday", **Then** a task is created with title "Finish report by Friday" and priority "high".
3. **Given** an authenticated user, **When** they type "Add a task" without a title, **Then** the agent asks: "What should I call the task?"
4. **Given** an authenticated user, **When** the task is created via chat, **Then** it appears in the `/dashboard` task list with correct fields.

---

### User Story 2 — Chat-Based Task Listing (Priority: P1)

An authenticated user asks the chatbot to show their tasks, optionally filtered by status or priority.

**Why this priority**: Users need to see their tasks to reference them in subsequent operations (complete, update, delete).

**Independent Test**: Create several tasks with different statuses, ask "Show my tasks", verify all are listed. Ask "Show pending tasks", verify only pending ones appear.

**Acceptance Scenarios**:

1. **Given** a user with 3 tasks, **When** they type "Show me my tasks", **Then** the agent lists all 3 tasks with title, status, and priority.
2. **Given** a user with tasks in different statuses, **When** they type "What are my pending tasks?", **Then** only pending tasks are listed.
3. **Given** a user with no tasks, **When** they type "Show my tasks", **Then** the agent responds: "You don't have any tasks yet. Would you like to create one?"

---

### User Story 3 — Chat-Based Task Completion (Priority: P1)

An authenticated user tells the chatbot to mark a task as complete using natural language.

**Why this priority**: Completing tasks is a core workflow — users need to mark progress via chat.

**Independent Test**: Create a task, then type "Mark buy groceries as done", verify the task status changes to completed.

**Acceptance Scenarios**:

1. **Given** a user with a task "Buy groceries", **When** they type "Mark buy groceries as done", **Then** the agent toggles the task to completed and confirms.
2. **Given** a user with a completed task, **When** they type "Undo buy groceries", **Then** the agent toggles it back to pending.
3. **Given** a user, **When** they type "Mark homework as done" but no matching task exists, **Then** the agent responds: "I couldn't find a task matching 'homework'."
4. **Given** a user with tasks "Buy groceries" and "Order groceries online", **When** they type "Complete groceries", **Then** the agent asks which one they mean.

---

### User Story 4 — Chat-Based Task Update (Priority: P2)

An authenticated user updates a task's fields via natural language.

**Why this priority**: Updates are important but less frequent than create/list/complete.

**Independent Test**: Create a task, type "Change buy groceries to high priority", verify the priority updates.

**Acceptance Scenarios**:

1. **Given** a user with a task "Buy groceries" at medium priority, **When** they type "Set buy groceries to high priority", **Then** the task priority is updated and the agent confirms.
2. **Given** a user with a task, **When** they type "Rename buy groceries to buy organic groceries", **Then** the task title is updated.
3. **Given** a user, **When** they type "Update homework" but no matching task exists, **Then** the agent responds that no matching task was found.

---

### User Story 5 — Chat-Based Task Deletion (Priority: P2)

An authenticated user deletes a task via natural language.

**Why this priority**: Deletion is needed for housekeeping but is the least frequent operation.

**Independent Test**: Create a task, type "Delete buy groceries", verify the task is removed.

**Acceptance Scenarios**:

1. **Given** a user with a task "Buy groceries", **When** they type "Delete buy groceries", **Then** the agent deletes the task and confirms removal.
2. **Given** a user with multiple similar tasks, **When** they type "Delete groceries", **Then** the agent asks which one to delete.
3. **Given** a user, **When** they type "Remove all tasks", **Then** the agent asks for confirmation before proceeding.

---

### User Story 6 — Conversation Continuity (Priority: P2)

An authenticated user has a multi-turn conversation where the agent understands context from previous messages.

**Why this priority**: Context-awareness makes the chatbot feel intelligent and usable.

**Independent Test**: Say "Add a task to buy groceries", then say "Make it high priority", verify the agent understands "it" refers to the just-created task.

**Acceptance Scenarios**:

1. **Given** a user who just created a task via chat, **When** they say "Make it high priority", **Then** the agent updates the most recently created/referenced task.
2. **Given** a user who just listed tasks, **When** they say "Complete the first one", **Then** the agent completes the first task from the list.
3. **Given** a user returning to an existing conversation, **When** they send a new message, **Then** the agent has access to previous conversation context.

---

### User Story 7 — Off-Topic & Error Handling (Priority: P3)

The chatbot gracefully handles non-task requests and errors.

**Why this priority**: Polish and robustness — not core functionality but important for user experience.

**Independent Test**: Type "What's the weather?", verify the agent redirects to task management.

**Acceptance Scenarios**:

1. **Given** a user, **When** they type "What's the weather?", **Then** the agent responds: "I'm your task management assistant..." and suggests task-related actions.
2. **Given** a user, **When** the OpenAI API is unreachable, **Then** the endpoint returns a user-friendly error message (not a stack trace).
3. **Given** a user, **When** they type "Hello", **Then** the agent responds warmly and suggests what it can help with.

---

### Edge Cases

- What happens when the user sends an empty message? → 400 error: "Message is required."
- What happens when the conversation has more than 20 messages? → Only last 20 are sent to agent; older messages remain in DB.
- What happens when the OPENAI_API_KEY is invalid? → 500 error with user-friendly message; no key leakage.
- What happens when the user references a task that was deleted between messages? → Agent responds: "That task no longer exists."
- What happens when two users have tasks with the same title? → Each user only sees their own tasks; no cross-user leakage.
- What happens when the database is unreachable? → 500 error with "Unable to process your request."

---

## Requirements

### Functional Requirements

- **FR-014**: The system MUST provide a `POST /api/chat` endpoint that accepts natural language messages and returns AI-generated responses.
- **FR-015**: The system MUST use OpenAI Agents SDK to power the conversational agent with tool-calling capabilities.
- **FR-016**: The system MUST expose 5 MCP tools to the agent: add_task, list_tasks, complete_task, delete_task, update_task.
- **FR-017**: All MCP tools MUST scope operations to the authenticated user's `user_id` — no cross-user data access.
- **FR-018**: The system MUST persist conversation history (user and assistant messages) in the database.
- **FR-019**: The system MUST reconstruct conversation context (last 20 messages) for each agent call.
- **FR-020**: The agent MUST resolve task references by title using case-insensitive partial matching.
- **FR-021**: The agent MUST ask clarifying questions when task references are ambiguous (multiple matches).
- **FR-022**: The agent MUST politely redirect off-topic requests to task management.
- **FR-023**: The system MUST provide a ChatKit-powered chat UI on the `/chat` page.
- **FR-024**: The frontend MUST send JWT tokens with chat API requests using the existing `fetchWithAuth()` helper.
- **FR-025**: The system MUST handle agent/LLM failures gracefully — return user-friendly error messages, never expose API keys or stack traces.
- **FR-026**: The existing Phase-2 dashboard and task API MUST remain fully functional and unchanged.

### Key Entities

- **Conversation**: Represents a chat session between a user and the AI agent. Attributes: unique ID, user ID, optional title, timestamps. Isolated per user.
- **Message**: Represents a single message within a conversation. Attributes: unique ID, conversation ID, role (user/assistant), content, optional tool calls JSON, timestamp.

---

## Non-Functional Requirements

- **NFR-007**: Chat API MUST timeout after 30 seconds if OpenAI does not respond. No automatic retry — return user-friendly error and let user resend manually.
- **NFR-008**: The ChatKit UI MUST be responsive on mobile (320px) and desktop (1920px).
- **NFR-009**: The OPENAI_API_KEY MUST never appear in source code, logs, or error responses.
- **NFR-010**: Conversation history queries MUST be indexed on `conversation_id` and `user_id` for performance.
- **NFR-011**: The chat feature MUST work alongside the existing dashboard without interference.

---

## Success Criteria

### Measurable Outcomes

- **SC-008**: A user can create a task via chat in under 15 seconds (message sent → confirmation received).
- **SC-009**: The agent correctly identifies user intent and calls the right tool in 90%+ of standard requests.
- **SC-010**: Off-topic messages receive a polite redirect response, never a tool call or error.
- **SC-011**: Conversation context enables multi-turn interactions — "add groceries" then "make it high priority" works correctly.
- **SC-012**: The existing dashboard remains fully functional with zero regressions from Phase-2.
- **SC-013**: All error states return user-friendly messages — no API keys, stack traces, or raw error codes exposed.
- **SC-014**: The chat UI loads and is interactive within 3 seconds on standard broadband.

---

## Assumptions

- OpenAI API is available and the `OPENAI_API_KEY` is provisioned with sufficient quota.
- The OpenAI Agents SDK supports tool definitions compatible with MCP tool schemas.
- ChatKit library is compatible with Next.js 16+ and React 19.
- The existing Neon PostgreSQL database can handle the additional Conversation and Message tables without provisioning changes.
- Users interact with the chatbot in English.
- Each conversation stays within the 20-message context window for meaningful interactions.

---

## Clarifications

### Session 2026-02-12

- Q: Which OpenAI model should the agent use? → A: `gpt-4o-mini` — fast, cheap, strong tool-calling, ideal for CRUD chatbot.
- Q: Which ChatKit library for the frontend? → A: `@chatscope/chat-ui-kit-react` — popular, feature-rich, MIT license, no backend dependency.
- Q: What should happen when OpenAI API is down or slow? → A: 30-second timeout, no retry. Fail fast with user-friendly error; user can manually resend.
- Q: Should chat page start fresh or resume last conversation? → A: Fresh conversation every page visit. Simpler, no stale context. History saved in DB for future use.
- Q: Which OpenAI Agents SDK Python package? → A: `openai-agents` — Official Agents SDK with Agent class, Runner, function_tool decorator.

## In-Scope

- Chat endpoint (`POST /api/chat`)
- 5 MCP tools for task CRUD
- OpenAI Agents SDK integration
- ChatKit UI on `/chat` page
- Conversation + Message persistence
- Navigation links between dashboard and chat
- Task resolution by title
- Confirmation and error response patterns
- Deployment to HuggingFace Spaces (backend) and Vercel (frontend)

## Out-of-Scope

- Voice input / speech-to-text
- File/image uploads in chat
- Real-time streaming responses (SSE/WebSocket)
- Multiple conversation management UI (conversation list/history)
- Task scheduling / reminders via chat
- Multi-language support
- Rate limiting on chat endpoint
- Chat analytics or usage metrics
- Subagent architecture (deferred to future phases)
