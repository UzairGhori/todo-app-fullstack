# Tasks: Todo App MVP

**Input**: Design documents from `/specs/001-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not included (out of scope per spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Initialize project structure and install dependencies for both services.

- [x] T001 Create backend directory structure: `backend/app/__init__.py`, `backend/app/models/__init__.py`, `backend/app/routers/__init__.py`, `backend/app/dependencies/__init__.py`
- [x] T002 Create `backend/requirements.txt` with dependencies: fastapi, uvicorn[standard], sqlmodel, python-jose[cryptography], python-dotenv, psycopg2-binary
- [x] T003 Create `backend/.env.example` with placeholders: DATABASE_URL, JWT_SECRET, FRONTEND_URL
- [x] T004 Create `backend/.gitignore` for Python (venv, __pycache__, .env)
- [x] T005 Initialize Next.js project in `frontend/` with TypeScript, Tailwind CSS, App Router
- [x] T006 Install frontend dependencies: better-auth in `frontend/`
- [x] T007 Create `frontend/.env.local.example` with placeholders: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL
- [x] T008 Create `frontend/.gitignore` for Next.js (node_modules, .next, .env.local)

**Checkpoint**: Both project directories initialized with dependencies and environment templates.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can begin.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Implement backend config loader in `backend/app/config.py` — load DATABASE_URL, JWT_SECRET, FRONTEND_URL from environment variables using python-dotenv
- [x] T010 [P] Implement database engine and session provider in `backend/app/dependencies/database.py` — create_engine with pool_pre_ping=True, get_session generator yielding Session
- [x] T011 [P] Implement JWT verification and get_current_user dependency in `backend/app/dependencies/auth.py` — extract Bearer token, decode with python-jose HS256, return user_id from sub claim, raise 401 on failure
- [x] T012 Implement Task SQLModel (table + schemas) in `backend/app/models/task.py` — Task (table=True with id, title, description, status, priority, user_id, created_at, updated_at), TaskCreate, TaskRead, TaskUpdate per data-model.md
- [x] T013 Implement health check router in `backend/app/routers/health.py` — GET /api/health returning {"status": "healthy"}, no auth required
- [x] T014 Implement FastAPI app entry point in `backend/app/main.py` — create FastAPI instance, add CORS middleware (origin: localhost:3000, credentials: true), include health router, add startup event to create tables
- [x] T015 [P] Configure Better Auth server in `frontend/lib/auth.ts` — betterAuth with pg database, emailAndPassword enabled, jwt session strategy, secret from BETTER_AUTH_SECRET
- [x] T016 [P] Configure Better Auth client in `frontend/lib/auth-client.ts` — createAuthClient with baseURL, export signIn, signUp, signOut, useSession
- [x] T017 Implement Better Auth API route handler in `frontend/app/api/auth/[...all]/route.ts` — export GET and POST using toNextJsHandler
- [x] T018 Implement backend API client in `frontend/lib/api.ts` — fetchWithAuth function that attaches Bearer token from session, handles 401 redirect to /signin, handles network errors with user-friendly message
- [x] T019 Implement root layout in `frontend/app/layout.tsx` — html, body, Tailwind globals.css import, Inter font
- [x] T020 Implement root page redirect in `frontend/app/page.tsx` — check session: authenticated → redirect to /dashboard, unauthenticated → redirect to /signin

**Checkpoint**: Foundation ready — backend serves health check, auth infrastructure configured, API client ready. User story implementation can now begin.

---

## Phase 3: User Story 1 — User Registration (Priority: P1)

**Goal**: New users can create an account with name, email, and password.

**Independent Test**: Navigate to /signup, fill form, submit, verify redirect to dashboard.

### Implementation for User Story 1

- [x] T021 [US1] Implement signup page in `frontend/app/(auth)/signup/page.tsx` — client component with name, email, password fields, form validation (name non-empty, email format, password min 8 chars), call signUp.email on submit, redirect to /dashboard on success, display error messages for duplicate email and validation failures
- [x] T022 [US1] Add navigation link from signup to signin in `frontend/app/(auth)/signup/page.tsx` — "Already have an account? Sign in" link to /signin

**Checkpoint**: User Story 1 complete — new users can register and land on the dashboard.

---

## Phase 4: User Story 2 — User Login & Logout (Priority: P1)

**Goal**: Registered users can sign in and sign out.

**Independent Test**: Navigate to /signin, enter credentials, verify dashboard. Click signout, verify redirect to /signin.

### Implementation for User Story 2

- [x] T023 [US2] Implement signin page in `frontend/app/(auth)/signin/page.tsx` — client component with email, password fields, call signIn.email on submit, redirect to /dashboard on success, display "Invalid email or password" on failure
- [x] T024 [US2] Add navigation link from signin to signup in `frontend/app/(auth)/signin/page.tsx` — "Don't have an account? Sign up" link to /signup
- [x] T025 [US2] Implement dashboard layout with auth guard and signout in `frontend/app/dashboard/layout.tsx` — check session on load, redirect to /signin if unauthenticated, render nav bar with app name and signout button, signout calls signOut() and redirects to /signin

**Checkpoint**: User Story 2 complete — users can sign in, access protected dashboard, and sign out.

---

## Phase 5: User Story 3 — Create a Task (Priority: P1)

**Goal**: Authenticated users can create tasks with title, description, status, and priority.

**Independent Test**: Sign in, create a task with title, verify it appears in the task list.

### Implementation for User Story 3

- [x] T026 [US3] Implement POST /api/tasks endpoint in `backend/app/routers/tasks.py` — accept TaskCreate body, inject user_id from get_current_user, create Task with uuid4 id, save to database, return TaskRead with 201 status
- [x] T027 [US3] Include tasks router in `backend/app/main.py` — import and include tasks router with prefix /api/tasks
- [x] T028 [US3] Implement task creation form in `frontend/components/task-form.tsx` — client component with title (required), description (optional), status dropdown (pending/in_progress/completed, default pending), priority dropdown (low/medium/high, default medium), submit calls POST /api/tasks via fetchWithAuth, validate title non-empty before submit
- [x] T029 [US3] Implement dashboard page with task list and create form in `frontend/app/dashboard/page.tsx` — client component that fetches tasks via GET /api/tasks on mount, renders task-form for creation, renders task list below, re-fetches after successful creation, shows empty state "No tasks yet. Create your first task!" when no tasks exist

**Checkpoint**: User Story 3 complete — users can create tasks and see them listed.

---

## Phase 6: User Story 4 — View Tasks (Priority: P1)

**Goal**: Authenticated users see all their tasks on the dashboard, ordered newest first, with user isolation.

**Independent Test**: Sign in as User A, verify only User A's tasks appear. Sign in as User B, verify only User B's tasks appear.

### Implementation for User Story 4

- [x] T030 [US4] Implement GET /api/tasks endpoint in `backend/app/routers/tasks.py` — query tasks WHERE user_id = authenticated user, ORDER BY created_at DESC, return list of TaskRead
- [x] T031 [US4] Implement GET /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py` — query task WHERE id = task_id AND user_id = authenticated user, return 404 if not found
- [x] T032 [US4] Implement task card component in `frontend/components/task-card.tsx` — display title, description (truncated), status badge (color-coded: pending=yellow, in_progress=blue, completed=green), priority badge, created_at timestamp, edit and delete action buttons

**Checkpoint**: User Story 4 complete — dashboard displays user's tasks with visual status/priority indicators, fully isolated per user.

---

## Phase 7: User Story 5 — Update a Task (Priority: P2)

**Goal**: Authenticated users can edit any field of their own tasks.

**Independent Test**: Sign in, select a task, change status to "completed", save, verify change persists.

### Implementation for User Story 5

- [x] T033 [US5] Implement PATCH /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py` — query task WHERE id = task_id AND user_id = authenticated user, return 404 if not found, apply partial update from TaskUpdate (exclude_unset=True), update updated_at timestamp, return TaskRead
- [x] T034 [US5] Add edit mode to task-form component in `frontend/components/task-form.tsx` — accept optional existing task prop, pre-fill fields when editing, submit calls PATCH /api/tasks/{id} via fetchWithAuth, validate title non-empty if provided
- [x] T035 [US5] Wire edit action in task-card to task-form in `frontend/app/dashboard/page.tsx` — clicking edit on a task-card opens task-form in edit mode with task data pre-filled, re-fetch task list after successful update

**Checkpoint**: User Story 5 complete — users can update any task field, changes persist and reflect immediately.

---

## Phase 8: User Story 6 — Delete a Task (Priority: P2)

**Goal**: Authenticated users can delete their own tasks after confirmation.

**Independent Test**: Sign in, select a task, click delete, confirm, verify task is removed from list.

### Implementation for User Story 6

- [x] T036 [US6] Implement DELETE /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py` — query task WHERE id = task_id AND user_id = authenticated user, return 404 if not found, delete task, return 204 No Content
- [x] T037 [US6] Implement delete confirmation dialog in `frontend/components/delete-confirm.tsx` — client component with "Are you sure?" message, confirm and cancel buttons, calls DELETE /api/tasks/{id} via fetchWithAuth on confirm
- [x] T038 [US6] Wire delete action in task-card to delete-confirm in `frontend/app/dashboard/page.tsx` — clicking delete on a task-card shows delete-confirm dialog, re-fetch task list after successful deletion

**Checkpoint**: User Story 6 complete — users can delete tasks with confirmation, task disappears from list.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, error handling, and auditor-readiness.

- [x] T039 [P] Apply responsive Tailwind styles across all pages — ensure signup, signin, and dashboard are usable at 320px–1920px with no horizontal scrolling, mobile-first breakpoints (per NFR-001, SC-005)
- [x] T040 [P] Add consistent error handling to all backend endpoints in `backend/app/main.py` — global exception handler returning {"detail": "Internal server error"} for unhandled exceptions, never expose stack traces (per FR-011, NFR-005)
- [x] T041 [P] Add loading states to frontend — show loading spinner/skeleton while fetching tasks and during form submissions in `frontend/app/dashboard/page.tsx`
- [x] T042 Verify environment configuration — ensure backend .env.example and frontend .env.local.example contain all required variables, .gitignore excludes .env and .env.local (per NFR-003)

**Checkpoint**: Application is demo-ready, responsive, and passes all quality gates.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 Registration (Phase 3)**: Depends on Foundational
- **US2 Login/Logout (Phase 4)**: Depends on Foundational
- **US3 Create Task (Phase 5)**: Depends on Foundational
- **US4 View Tasks (Phase 6)**: Depends on Foundational (integrates with US3 task list)
- **US5 Update Task (Phase 7)**: Depends on US3 + US4 (needs existing tasks + task-card)
- **US6 Delete Task (Phase 8)**: Depends on US4 (needs task-card with action buttons)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Registration)**: Independent after Foundational
- **US2 (Login/Logout)**: Independent after Foundational
- **US3 (Create Task)**: Independent after Foundational
- **US4 (View Tasks)**: Best after US3 (tasks exist to view), but independently testable
- **US5 (Update Task)**: Requires US3 + US4 (needs tasks + task-card component)
- **US6 (Delete Task)**: Requires US4 (needs task-card component)

### Within Each User Story

- Backend endpoints before frontend components that call them
- Models before routers
- Core implementation before integration wiring

### Parallel Opportunities

- T002, T003, T004 (backend setup files) can run in parallel
- T005, T006, T007, T008 (frontend setup) can run in parallel with backend setup
- T010, T011 (database + auth deps) can run in parallel
- T015, T016 (Better Auth server + client) can run in parallel
- US1, US2, US3 can run in parallel after Foundational
- T039, T040, T041 (polish tasks) can run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 + US4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Registration
4. Complete Phase 4: US2 — Login/Logout
5. Complete Phase 5: US3 — Create Task
6. Complete Phase 6: US4 — View Tasks
7. **STOP and VALIDATE**: Full auth + create + view flow works end-to-end

### Full Feature Set

8. Complete Phase 7: US5 — Update Task
9. Complete Phase 8: US6 — Delete Task
10. Complete Phase 9: Polish
11. **FINAL VALIDATION**: All acceptance criteria from spec verified
