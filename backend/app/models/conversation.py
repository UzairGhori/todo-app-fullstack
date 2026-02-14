from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"


class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class Message(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    conversation_id: str = Field(index=True)
    role: MessageRole
    content: str = Field(max_length=5000)
    tool_calls: Optional[str] = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: Optional[str] = None


class MessageRead(BaseModel):
    id: str
    role: MessageRole
    content: str
    tool_calls: Optional[str]
    created_at: datetime


class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageRead
