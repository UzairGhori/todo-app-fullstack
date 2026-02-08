# Research: Todo App MVP

**Feature**: 001-todo-app | **Date**: 2026-02-06

## Decision 1: JWT Token Flow Between Services

**Decision**: Better Auth issues JWTs using HS256 with a shared secret. FastAPI verifies using `python-jose` with the same secret.

**Rationale**: HS256 with a shared secret is the simplest approach for two services deployed in the same trust boundary. Both services share `BETTER_AUTH_SECRET` / `JWT_SECRET` (same value). No need for RS256 key pair management in MVP.

**Alternatives considered**:
- RS256 (asymmetric): More secure for distributed systems, but adds key management complexity. Overkill for MVP with two services.
- Session-based auth with shared Redis: Violates Constitution Principle IV (stateless auth only).

## Decision 2: Better Auth Session Strategy

**Decision**: Use Better Auth's `jwt` session strategy so tokens are self-contained and can be forwarded to the FastAPI backend.

**Rationale**: The `jwt` strategy embeds user claims (sub, email, name) directly in the token. The backend can verify and extract user identity without calling back to the frontend or a session store. This aligns with Constitution Principle IV.

**Alternatives considered**:
- `cookie` session strategy: Requires the backend to call Better Auth's session endpoint for validation — adds latency and coupling.
- Custom token issuance: Unnecessary when Better Auth supports JWT natively.

## Decision 3: Task ID Generation

**Decision**: Use UUID v4 strings as primary keys for tasks, generated server-side.

**Rationale**: UUIDs prevent enumeration attacks (sequential IDs leak information about task count). Server-side generation ensures the client cannot forge IDs. String type is compatible across PostgreSQL and SQLModel.

**Alternatives considered**:
- Auto-increment integer: Exposes creation order, enables enumeration. Rejected per security-first principle.
- ULID: Sortable, but adds a dependency. UUID is sufficient for MVP.

## Decision 4: Frontend API Client Pattern

**Decision**: A single `fetchWithAuth` wrapper in `lib/api.ts` that attaches the JWT token to every backend request.

**Rationale**: Centralizes token management and backend URL configuration. All API calls flow through one function, making it easy to handle 401 redirects and network errors consistently.

**Alternatives considered**:
- Axios instance with interceptors: Adds a dependency. Native `fetch` is sufficient.
- Per-component fetch calls: Violates separation of concerns. Rejected per Constitution Principle III.

## Decision 5: Database Schema Ownership

**Decision**: Better Auth owns the `user` table (created by Better Auth's migration). The backend owns the `task` table (created by SQLModel). The `task.user_id` column references the Better Auth user ID.

**Rationale**: Better Auth requires its own schema for users, sessions, and accounts. Duplicating user data in a backend-managed table would create sync issues. The backend only needs the user ID (from JWT `sub` claim) to enforce ownership.

**Alternatives considered**:
- Backend manages its own user table: Creates data duplication and sync complexity. Rejected.
- Shared migration tool: Both services would need coordinated migrations. Overkill for MVP.

## Decision 6: Frontend State Management

**Decision**: Use React component state (`useState`) and direct API calls. No global state library.

**Rationale**: The MVP has a single dashboard page with a task list. After create/update/delete, the task list is re-fetched from the API. This is the simplest approach with zero additional dependencies.

**Alternatives considered**:
- React Context: Adds complexity without benefit for a single-page data flow.
- Redux/Zustand: Overkill for MVP scope.
- React Query/SWR: Useful for caching but adds a dependency. Can be added later if needed.
