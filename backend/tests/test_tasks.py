"""Tests for the tasks CRUD endpoints."""


TASK_PAYLOAD = {
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
}


# ── Helpers ──


def _create_task(client, auth_headers, **overrides):
    payload = {**TASK_PAYLOAD, **overrides}
    resp = client.post("/api/tasks", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    return resp.json()


# ── Create ──


def test_create_task(client, auth_headers, test_user):
    data = _create_task(client, auth_headers)
    assert data["title"] == "Buy groceries"
    assert data["description"] == "Milk, eggs, bread"
    assert data["status"] == "pending"
    assert data["priority"] == "high"
    assert data["user_id"] == test_user.id


# ── List ──


def test_list_tasks(client, auth_headers):
    _create_task(client, auth_headers, title="Task A")
    _create_task(client, auth_headers, title="Task B")
    resp = client.get("/api/tasks", headers=auth_headers)
    assert resp.status_code == 200
    tasks = resp.json()
    assert len(tasks) == 2


# ── Get ──


def test_get_task(client, auth_headers):
    created = _create_task(client, auth_headers)
    resp = client.get(f"/api/tasks/{created['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


# ── Update ──


def test_update_task(client, auth_headers):
    created = _create_task(client, auth_headers)
    resp = client.patch(
        f"/api/tasks/{created['id']}",
        json={"title": "Updated title", "priority": "low"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Updated title"
    assert data["priority"] == "low"


# ── Delete ──


def test_delete_task(client, auth_headers):
    created = _create_task(client, auth_headers)
    resp = client.delete(f"/api/tasks/{created['id']}", headers=auth_headers)
    assert resp.status_code == 204

    # Confirm it's gone
    resp = client.get(f"/api/tasks/{created['id']}", headers=auth_headers)
    assert resp.status_code == 404


# ── Toggle completion ──


def test_toggle_task_completion(client, auth_headers):
    created = _create_task(client, auth_headers)
    assert created["status"] == "pending"

    # First toggle → completed
    resp = client.patch(
        f"/api/tasks/{created['id']}/complete", headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"

    # Second toggle → back to pending
    resp = client.patch(
        f"/api/tasks/{created['id']}/complete", headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending"


# ── 404 for non-existent task ──


def test_get_nonexistent_task(client, auth_headers):
    resp = client.get("/api/tasks/nonexistent-id", headers=auth_headers)
    assert resp.status_code == 404


# ── Auth required ──


def test_tasks_require_auth(client):
    resp = client.get("/api/tasks")
    assert resp.status_code in (401, 403)


# ── User isolation ──


def test_user_isolation(client, auth_headers, other_auth_headers):
    created = _create_task(client, auth_headers, title="Private task")
    # Other user cannot see it
    resp = client.get(
        f"/api/tasks/{created['id']}", headers=other_auth_headers
    )
    assert resp.status_code == 404

    # Other user's list is empty
    resp = client.get("/api/tasks", headers=other_auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 0


# ── Validation ──


def test_create_task_empty_title(client, auth_headers):
    resp = client.post(
        "/api/tasks",
        json={"title": "", "description": "no title"},
        headers=auth_headers,
    )
    assert resp.status_code == 422
