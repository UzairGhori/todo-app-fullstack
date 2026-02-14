from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import SQLModel

from app.config import FRONTEND_URL
from app.dependencies.database import engine
from app.models.user import User  # noqa: F401 - register model for create_all
from app.models.conversation import Conversation, Message  # noqa: F401 - register models for create_all
from app.routers import auth, chat, health, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(title="TaskFlow API", version="1.0.0", lifespan=lifespan)

# Build allowed origins list
allowed_origins = [
    origin.strip()
    for origin in FRONTEND_URL.split(",")
    if origin.strip()
]
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(health.router)
app.include_router(tasks.router)
