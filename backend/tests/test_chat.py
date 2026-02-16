"""Tests for the chat endpoint (with mocked agent)."""


# ── Send message ──


def test_chat_send_message(client, auth_headers, mock_agent):
    resp = client.post(
        "/api/chat",
        json={"message": "Hello, help me with my tasks"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "conversation_id" in data
    assert data["message"]["role"] == "assistant"
    assert data["message"]["content"] == "I can help you manage your tasks!"
    mock_agent.assert_called_once()


# ── Conversation continuity ──


def test_chat_conversation_continuity(client, auth_headers, mock_agent):
    # First message creates a conversation
    resp1 = client.post(
        "/api/chat",
        json={"message": "First message"},
        headers=auth_headers,
    )
    assert resp1.status_code == 200
    conv_id = resp1.json()["conversation_id"]

    # Second message reuses the same conversation
    resp2 = client.post(
        "/api/chat",
        json={"message": "Follow up", "conversation_id": conv_id},
        headers=auth_headers,
    )
    assert resp2.status_code == 200
    assert resp2.json()["conversation_id"] == conv_id


# ── Auth required ──


def test_chat_requires_auth(client, mock_agent):
    resp = client.post("/api/chat", json={"message": "Hello"})
    assert resp.status_code in (401, 403)


# ── Empty message validation ──


def test_chat_empty_message(client, auth_headers, mock_agent):
    resp = client.post(
        "/api/chat",
        json={"message": ""},
        headers=auth_headers,
    )
    assert resp.status_code == 422
