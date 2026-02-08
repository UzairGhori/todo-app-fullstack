# Implementation Plan: Todo App MVP

**Branch**: `001-todo-app` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-app/spec.md`

## Summary

Build a multi-user Todo application with two independently deployed services: a Next.js frontend (App Router, Better Auth, Tailwind CSS) and a FastAPI backend (SQLModel, Neon PostgreSQL). Users register and sign in via the frontend, receive a JWT, and use it to perform CRUD operations on tasks via the backend REST API. All task data is isolated per user at the query level.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLModel, python-jose, Better Auth, Next.js 14+, Tailwind CSS
**Storage**: PostgreSQL (Neon) — serverless, SSL required
**Testing**: Out of scope for MVP (per spec)
**Target Platform**: Web (modern browsers, responsive 320px–1920px)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: API responses < 2s, user actions < 3s end-to-end (per NFR-002, SC-003)
**Constraints**: No pagination, < 500 tasks per user, stateless JWT auth only
**Scale/Scope**: MVP — 6 pages, 5 API endpoints, 2 entities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Spec-Driven Development | PASS | Spec complete with 13 FRs, 6 NFRs, 7 SCs |
| II | Security-First | PASS | FR-009 (isolation), FR-010 (validation), JWT auth on all endpoints |
| III | Clean Code & Separation | PASS | Two-service architecture, layered backend (routers→deps→models→db) |
| IV | Stateless Authentication | PASS | JWT via Better Auth → FastAPI verification, no DB session lookups |
| V | Production-Ready | PASS | Monorepo structure, env config, consistent error format (FR-011) |
| VI | Smallest Viable Diff | PASS | Out-of-scope list explicitly excludes non-MVP features |
| VII | No Dead Code | PASS | Will enforce during implementation — no speculative code |
| VIII | Acceptance Criteria | PASS | All 6 user stories have Given/When/Then scenarios |
| IX | Demo-Ready | PASS | SC-005 (mobile), SC-006 (errors), SC-007 (auditor review) |
| X | Explicit Over Implicit | PASS | Env vars for config, typed models for contracts, Depends() for DI |

**Gate result**: PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-app/
├── plan.md              # This file
├── research.md          # Phase 0 — technology decisions
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — developer setup guide
├── contracts/           # Phase 1 — API endpoint contracts
│   └── rest-api.md      # REST endpoint specifications
└── tasks.md             # Phase 2 — ordered implementation tasks
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, router includes
│   ├── config.py            # Settings from environment variables
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # Task SQLModel (table + schemas)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── tasks.py         # Task CRUD endpoints
│   │   └── health.py        # Health check endpoint
│   └── dependencies/
│       ├── __init__.py
│       ├── auth.py          # JWT verification, get_current_user
│       └── database.py      # Engine, session provider
├── requirements.txt
├── .env.example
└── .gitignore

frontend/
├── app/
│   ├── layout.tsx           # Root layout (fonts, Tailwind, providers)
│   ├── page.tsx             # Root redirect (/ → signin or dashboard)
│   ├── globals.css          # Tailwind directives
│   ├── (auth)/
│   │   ├── signin/
│   │   │   └── page.tsx     # Signin page
│   │   └── signup/
│   │       └── page.tsx     # Signup page
│   ├── dashboard/
│   │   ├── layout.tsx       # Dashboard layout (auth guard, nav, signout)
│   │   └── page.tsx         # Task list + create form
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts # Better Auth catch-all handler
├── components/
│   ├── task-card.tsx        # Single task display with actions
│   ├── task-form.tsx        # Create/edit task form
│   └── delete-confirm.tsx   # Delete confirmation dialog
├── lib/
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth client (signIn, signUp, signOut, useSession)
│   └── api.ts               # Backend API client (fetchWithAuth)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── .env.local.example
└── .gitignore
```

**Structure Decision**: Web application (Option 2) — two independent services communicating via REST/JWT. Frontend owns auth flow and UI. Backend owns task data and business logic. No shared code between services.

## Complexity Tracking

> No constitution violations detected. No complexity justifications needed.

## Acceptance Criteria Mapping

| Spec Requirement | Implementation Location |
|-----------------|------------------------|
| FR-001 (signup) | `frontend/app/(auth)/signup/page.tsx` → Better Auth |
| FR-002 (signin + JWT) | `frontend/app/(auth)/signin/page.tsx` → Better Auth |
| FR-003 (signout) | `frontend/components/` via `auth-client.ts` signOut |
| FR-004 (redirect + root) | `frontend/app/page.tsx` + `dashboard/layout.tsx` |
| FR-005 (create task) | `backend/app/routers/tasks.py` POST + `frontend/components/task-form.tsx` |
| FR-006 (list tasks) | `backend/app/routers/tasks.py` GET + `frontend/app/dashboard/page.tsx` |
| FR-007 (update task) | `backend/app/routers/tasks.py` PATCH + `frontend/components/task-form.tsx` |
| FR-008 (delete task) | `backend/app/routers/tasks.py` DELETE + `frontend/components/delete-confirm.tsx` |
| FR-009 (isolation) | `backend/app/dependencies/auth.py` + WHERE user_id on all queries |
| FR-010 (validation) | `backend/app/models/task.py` Pydantic + `frontend/` form validation |
| FR-011 (error format) | `backend/app/main.py` exception handlers |
| FR-012 (statuses) | `backend/app/models/task.py` enum constraint |
| FR-013 (priorities) | `backend/app/models/task.py` enum constraint |
