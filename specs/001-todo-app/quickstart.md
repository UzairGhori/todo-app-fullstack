# Quickstart: Todo App MVP

**Feature**: 001-todo-app | **Date**: 2026-02-06

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database (Neon account or local PostgreSQL)

## 1. Clone and Navigate

```bash
cd Phase-2
```

## 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Backend Environment

Copy `.env.example` to `.env` and fill in values:

```env
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-shared-secret-minimum-32-characters
FRONTEND_URL=http://localhost:3000
```

### Run Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: `http://localhost:8000/api/health` should return `{"status": "healthy"}`

## 3. Frontend Setup

```bash
cd frontend
npm install
```

### Frontend Environment

Copy `.env.local.example` to `.env.local` and fill in values:

```env
BETTER_AUTH_SECRET=your-shared-secret-minimum-32-characters
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**CRITICAL**: `BETTER_AUTH_SECRET` and backend `JWT_SECRET` MUST be the same value.

### Run Frontend

```bash
npm run dev
```

Verify: `http://localhost:3000` should redirect to the signin page.

## 4. Verify Full Stack

1. Open `http://localhost:3000` — redirects to signin
2. Click "Sign up" link — navigate to signup page
3. Register with name, email, and password (min 8 chars)
4. After signup, redirected to dashboard with empty state: "No tasks yet. Create your first task!"
5. Create a task with a title — appears in the task list
6. Update the task status to "completed" — change reflected
7. Delete the task — removed from list after confirmation
8. Sign out — redirected to signin page

## Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
