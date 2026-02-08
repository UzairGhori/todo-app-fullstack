# REST API Contracts: Todo App MVP

**Feature**: 001-todo-app | **Date**: 2026-02-06
**Base URL**: `http://localhost:8000`

## Authentication

All endpoints except `GET /api/health` require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

Invalid or missing tokens return `401 Unauthorized`.

## Error Response Format

All error responses follow this structure:

```json
{
  "detail": "Human-readable error message"
}
```

## Endpoints

### GET /api/health

Health check endpoint. No authentication required.

**Response** `200 OK`:
```json
{
  "status": "healthy"
}
```

---

### GET /api/tasks

List all tasks for the authenticated user, ordered newest first.

**Headers**: `Authorization: Bearer <token>`

**Response** `200 OK`:
```json
[
  {
    "id": "uuid-string",
    "title": "Task title",
    "description": "Task description or null",
    "status": "pending",
    "priority": "medium",
    "user_id": "uuid-string",
    "created_at": "2026-02-06T12:00:00Z",
    "updated_at": "2026-02-06T12:00:00Z"
  }
]
```

**Errors**:
- `401`: `{"detail": "Not authenticated"}`

**Maps to**: FR-006, FR-009

---

### POST /api/tasks

Create a new task for the authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Task title",
  "description": "Optional description",
  "status": "pending",
  "priority": "medium"
}
```

| Field | Required | Default | Constraints |
|-------|----------|---------|-------------|
| title | Yes | — | Non-empty, max 255 chars |
| description | No | null | Max 2000 chars |
| status | No | "pending" | "pending" \| "in_progress" \| "completed" |
| priority | No | "medium" | "low" \| "medium" \| "high" |

**Response** `201 Created`:
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Optional description",
  "status": "pending",
  "priority": "medium",
  "user_id": "uuid-string",
  "created_at": "2026-02-06T12:00:00Z",
  "updated_at": "2026-02-06T12:00:00Z"
}
```

**Errors**:
- `401`: `{"detail": "Not authenticated"}`
- `422`: `{"detail": [{"loc": ["body", "title"], "msg": "field required", "type": "value_error.missing"}]}`

**Maps to**: FR-005, FR-009, FR-010

---

### GET /api/tasks/{task_id}

Get a single task by ID. Returns 404 if the task does not exist or belongs to another user.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `task_id` (string, UUID)

**Response** `200 OK`:
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Optional description",
  "status": "pending",
  "priority": "medium",
  "user_id": "uuid-string",
  "created_at": "2026-02-06T12:00:00Z",
  "updated_at": "2026-02-06T12:00:00Z"
}
```

**Errors**:
- `401`: `{"detail": "Not authenticated"}`
- `404`: `{"detail": "Task not found"}`

**Maps to**: FR-006, FR-009

---

### PATCH /api/tasks/{task_id}

Update a task. Only provided fields are updated. Returns 404 if the task does not exist or belongs to another user.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `task_id` (string, UUID)

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "high"
}
```

| Field | Required | Constraints |
|-------|----------|-------------|
| title | No | Non-empty if provided, max 255 chars |
| description | No | Max 2000 chars, can be null |
| status | No | "pending" \| "in_progress" \| "completed" |
| priority | No | "low" \| "medium" \| "high" |

**Response** `200 OK`:
```json
{
  "id": "uuid-string",
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "high",
  "user_id": "uuid-string",
  "created_at": "2026-02-06T12:00:00Z",
  "updated_at": "2026-02-06T14:30:00Z"
}
```

**Errors**:
- `401`: `{"detail": "Not authenticated"}`
- `404`: `{"detail": "Task not found"}`
- `422`: Validation error (empty title, invalid status/priority)

**Maps to**: FR-007, FR-009, FR-010

---

### DELETE /api/tasks/{task_id}

Delete a task. Returns 404 if the task does not exist or belongs to another user.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `task_id` (string, UUID)

**Response** `204 No Content`: (empty body)

**Errors**:
- `401`: `{"detail": "Not authenticated"}`
- `404`: `{"detail": "Task not found"}`

**Maps to**: FR-008, FR-009

## CORS Configuration

```
Allowed Origins: ["http://localhost:3000"]
Allowed Methods: ["GET", "POST", "PATCH", "DELETE"]
Allowed Headers: ["Authorization", "Content-Type"]
Allow Credentials: true
```
