"""Shared test fixtures — in-memory SQLite, TestClient, auth helpers."""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.dependencies.auth import create_access_token
from app.dependencies.database import get_session
from app.main import app
from app.models.user import User  # noqa: register table
from app.models.task import Task  # noqa: register table
from app.models.conversation import Conversation, Message  # noqa: register tables


# ── In-memory SQLite engine ──
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


# ── TestClient with overridden DB session ──
@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


# ── Helper: register a user directly in DB ──
@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    from app.dependencies.auth import hash_password

    user = User(
        name="Test User",
        email="test@example.com",
        password=hash_password("password123"),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# ── Helper: get auth headers for a user ──
@pytest.fixture(name="auth_headers")
def auth_headers_fixture(test_user: User):
    token = create_access_token(data={
        "sub": test_user.id,
        "email": test_user.email,
        "name": test_user.name,
        "role": test_user.role,
    })
    return {"Authorization": f"Bearer {token}"}


# ── Helper: create a second user for isolation tests ──
@pytest.fixture(name="other_user")
def other_user_fixture(session: Session):
    from app.dependencies.auth import hash_password

    user = User(
        name="Other User",
        email="other@example.com",
        password=hash_password("password123"),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="other_auth_headers")
def other_auth_headers_fixture(other_user: User):
    token = create_access_token(data={
        "sub": other_user.id,
        "email": other_user.email,
        "name": other_user.name,
        "role": other_user.role,
    })
    return {"Authorization": f"Bearer {token}"}


# ── Mock agent for chat tests (avoids calling OpenRouter) ──
@pytest.fixture(name="mock_agent")
def mock_agent_fixture():
    with patch("app.routers.chat.run_agent", new_callable=AsyncMock) as mock:
        mock.return_value = ("I can help you manage your tasks!", "[]")
        yield mock
