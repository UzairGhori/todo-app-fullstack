<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0 (MINOR — auth architecture alignment)
  Modified principles:
    - II. Security-First Architecture — updated secret reference (BETTER_AUTH_SECRET → SECRET_KEY)
    - IV. Stateless Authentication — replaced Better Auth with custom JWT auth via backend
  Modified sections:
    - Technology Stack Constraints — Frontend Auth updated from Better Auth to Custom JWT (backend-issued)
    - Prohibited list — removed localStorage prohibition (token stored in localStorage by design)
  Templates requiring updates: None (no template-breaking changes)
  Follow-up TODOs: None
-->

# Todo App Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST originate from a written specification before any code is produced.
The pipeline is: Specify → Plan → Tasks → Implement → Validate.
- Specifications are the single source of truth for requirements.
- No implementation work begins without an approved spec.
- All acceptance criteria MUST be defined in the spec before coding starts.
- Changes to requirements MUST flow through a spec amendment, never through code alone.
- Specs take precedence over opinions, assumptions, and agent internal knowledge.

### II. Security-First Architecture

Security is not a feature; it is a constraint that governs every decision.
- All API endpoints MUST require JWT authentication (except health checks).
- User data isolation MUST be enforced at the query level — every SELECT, UPDATE, and DELETE includes `WHERE user_id = <authenticated_user_id>`.
- Return 404 (not 403) for resources belonging to other users to prevent existence leakage.
- The JWT signing secret (`SECRET_KEY`) MUST be consistent across services and MUST never be committed to version control.
- Input validation MUST use Pydantic models with explicit type, length, and format constraints.
- CORS MUST use explicit origin allowlists — never `*` with credentials.
- OWASP Top 10 mitigations MUST be applied: parameterized queries, token validation, no secrets in responses, strict access control.

### III. Clean Code & Separation of Concerns

Code MUST be organized by responsibility with clear boundaries between layers.
- Backend: routers → dependencies → models → database (no business logic in route handlers).
- Frontend: pages → components → lib/api → lib/auth (no API calls in components directly).
- Each service (frontend, backend) MUST be independently deployable.
- No cross-service imports; services communicate only via HTTP/REST.
- Functions MUST do one thing. Files MUST have a single purpose.
- No god files, no circular dependencies, no hidden side effects.

### IV. Stateless Authentication

Authentication between services MUST be stateless using JWT tokens.
- FastAPI backend issues JWTs on successful login via `/api/auth/token`.
- FastAPI backend verifies JWTs using `SECRET_KEY` (HS256) — no database session lookups.
- The `get_current_user` dependency extracts `user_id` from the token `sub` claim and injects it into every protected route.
- Token expiry MUST be validated on every request (default: 30 minutes). Clock skew tolerance: 30 seconds.
- Algorithm MUST be explicitly specified (HS256) — never allow `none` algorithm.
- Frontend stores JWT in localStorage and attaches it as `Authorization: Bearer <token>` on every API request.
- On 401 response, frontend clears stored token and redirects to sign-in.

### V. Production-Ready Architecture

The system MUST be architected for production from day one — not retrofitted later.
- Monorepo structure: `frontend/` (Next.js) + `backend/` (FastAPI) + `specs/` (SDD artifacts).
- Environment configuration via `.env` files — different values per environment.
- Error responses MUST follow a consistent JSON format and never leak internal details.
- CORS, authentication, and validation middleware MUST be configured before any route handler.
- The application MUST handle edge cases: empty inputs, duplicate entries, expired tokens, network failures.

### VI. Smallest Viable Diff

Every change MUST be the minimum required to satisfy the current task.
- No speculative features, premature abstractions, or "nice-to-have" additions.
- No refactoring of unrelated code during a feature task.
- Three similar lines of code is preferable to a premature utility function.
- YAGNI (You Aren't Gonna Need It) governs all implementation decisions.
- If a simpler approach works, it MUST be chosen over a clever one.

### VII. No Dead Code or Unused Files

The codebase MUST contain zero dead code, unused imports, orphaned files, or commented-out blocks.
- Every file MUST serve a documented purpose.
- Every import MUST be used. Every function MUST be called.
- Removed features MUST be fully deleted — no backward-compatibility shims, no `_unused` variables, no `// removed` comments.
- Unused dependencies MUST be removed from package.json / requirements.txt.

### VIII. Acceptance Criteria Compliance

Every feature MUST meet its defined acceptance criteria before being considered complete.
- Acceptance criteria are defined in the spec using Given/When/Then format.
- A feature is not done until every acceptance scenario passes.
- Edge cases documented in the spec MUST be handled in the implementation.
- Spec compliance audits MUST be performed after each feature milestone.

### IX. Demo-Ready & Review-Ready

The project MUST be presentable to senior marketplace auditors at any point.
- UI MUST be responsive (mobile-first via Tailwind breakpoints).
- API responses MUST be consistent, well-structured, and documented.
- Error states MUST be handled gracefully with user-friendly messages.
- The codebase MUST be navigable — clear naming, logical structure, no magic values.
- A reviewer should understand any file's purpose within 10 seconds of opening it.

### X. Explicit Over Implicit

All behavior MUST be traceable to an explicit decision, not a default or assumption.
- Configuration values MUST be loaded from environment variables, not hardcoded.
- API contracts (request/response shapes) MUST be defined via typed models.
- Dependencies MUST be injected via FastAPI's `Depends()`, not imported globally.
- Route permissions MUST be explicit — no "default allow" behavior.
- Every architectural decision of significance MUST be documented in an ADR.

## Technology Stack Constraints

The following stack is mandated. Deviations require an ADR with explicit justification.

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| Frontend Framework | Next.js (App Router) | TypeScript, Server Components default |
| Frontend Auth | Custom JWT (backend-issued) | HS256, localStorage + Bearer header |
| Frontend Styling | Tailwind CSS | Mobile-first, utility classes only |
| Backend Framework | FastAPI | Python, async handlers |
| Backend ORM | SQLModel | Pydantic + SQLAlchemy combined |
| Database | PostgreSQL (Neon) | Serverless, SSL required |
| Authentication | JWT (HS256) | Shared secret across services |
| API Style | REST | JSON request/response |

### Prohibited
- No ORMs other than SQLModel (no raw SQLAlchemy, no Django ORM).
- No CSS-in-JS or styled-components — Tailwind only.
- No session-based authentication — JWT only.
- No GraphQL — REST only.
- No third-party auth libraries (Better Auth, NextAuth, etc.) — custom JWT via backend only.

## Development Workflow & Quality Gates

### Workflow
1. **Specify**: Capture requirements in `specs/<feature>/spec.md` with acceptance criteria.
2. **Plan**: Generate architectural plan in `specs/<feature>/plan.md` with constitution checks.
3. **Tasks**: Break plan into ordered tasks in `specs/<feature>/tasks.md`.
4. **Implement**: Execute tasks in dependency order. Smallest viable diff per task.
5. **Validate**: Audit implementation against spec acceptance criteria.

### Quality Gates (must pass before feature is complete)
- [ ] All acceptance criteria from spec satisfied.
- [ ] No unresolved placeholder tokens in any artifact.
- [ ] Zero dead code or unused files introduced.
- [ ] All API endpoints enforce JWT authentication and user isolation.
- [ ] Input validation on all user-facing endpoints.
- [ ] CORS configured with explicit origins.
- [ ] Error responses follow consistent format.
- [ ] UI is responsive across mobile and desktop.
- [ ] Spec compliance audit passes.

### Code Review Checklist
- [ ] Does the change match the spec exactly?
- [ ] Is this the smallest possible diff?
- [ ] Are there any security implications?
- [ ] Is error handling explicit and complete?
- [ ] Would a senior auditor approve this code?

## Governance

- This constitution supersedes all other practices and agent instructions.
- Amendments require: (1) documented rationale, (2) version increment, (3) sync impact report.
- Specs take precedence over opinions. This constitution takes precedence over specs when principles conflict.
- Any violation of this constitution MUST be reported and non-compliant output MUST be revised.
- All PRs and code reviews MUST verify compliance with these principles.
- Complexity beyond the minimum MUST be justified with a written rationale.
- Architectural decisions meeting the significance threshold MUST be documented via ADR.

**Version**: 1.1.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-12
