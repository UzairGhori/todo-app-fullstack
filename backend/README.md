---
title: TaskFlow API
emoji: ✅
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
---

# TaskFlow API

FastAPI backend for the TaskFlow task management application.

## Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/token` - Login
- `POST /api/chat` - AI chatbot (auth required)
- `GET /api/tasks` - List tasks (auth required)
- `POST /api/tasks` - Create task (auth required)
- `PATCH /api/tasks/{id}` - Update task (auth required)
- `PATCH /api/tasks/{id}/complete` - Toggle completion (auth required)
- `DELETE /api/tasks/{id}` - Delete task (auth required)
- `GET /api/health` - Health check
