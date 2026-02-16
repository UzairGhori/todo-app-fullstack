"""Tests for the auth endpoints (register + login)."""

import jwt

from app.config import SECRET_KEY


# ── Register ──


def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "name": "New User",
        "email": "new@example.com",
        "password": "password123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert data["name"] == "New User"
    assert data["role"] == "user"
    assert "id" in data


def test_register_duplicate_email(client, test_user):
    response = client.post("/api/auth/register", json={
        "name": "Duplicate",
        "email": "test@example.com",  # same as test_user
        "password": "password123",
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_register_missing_fields(client):
    # Missing name
    response = client.post("/api/auth/register", json={
        "email": "bad@example.com",
        "password": "password123",
    })
    assert response.status_code == 422


# ── Login ──


def test_login_success(client, test_user):
    response = client.post("/api/auth/token", json={
        "email": "test@example.com",
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_login_wrong_password(client, test_user):
    response = client.post("/api/auth/token", json={
        "email": "test@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_login_token_structure(client, test_user):
    response = client.post("/api/auth/token", json={
        "email": "test@example.com",
        "password": "password123",
    })
    token = response.json()["access_token"]
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    assert payload["sub"] == test_user.id
    assert payload["email"] == "test@example.com"
    assert "exp" in payload
