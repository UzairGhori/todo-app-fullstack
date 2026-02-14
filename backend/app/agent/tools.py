from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from agents import RunContextWrapper, function_tool
from sqlmodel import Session, select

from app.models.task import Task, TaskStatus, TaskPriority


@dataclass
class AgentContext:
    user_id: str
    session: Session


@function_tool
def add_task(
    ctx: RunContextWrapper[AgentContext],
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
    status: str = "pending",
) -> dict:
    """Creates a new task for the authenticated user.

    Args:
        title: Task title (required, 1-255 chars)
        description: Optional task description (max 2000 chars)
        priority: Task priority - "low", "medium", or "high" (default: medium)
        status: Task status - "pending", "in_progress", or "completed" (default: pending)
    """
    session = ctx.context.session
    user_id = ctx.context.user_id

    task = Task(
        title=title,
        description=description,
        status=TaskStatus(status),
        priority=TaskPriority(priority),
        user_id=user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value,
        "priority": task.priority.value,
        "user_id": task.user_id,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
    }


@function_tool
def list_tasks(
    ctx: RunContextWrapper[AgentContext],
    status: Optional[str] = None,
    priority: Optional[str] = None,
) -> list[dict]:
    """Lists all tasks for the authenticated user, optionally filtered by status or priority.

    Args:
        status: Filter by status - "pending", "in_progress", or "completed" (optional)
        priority: Filter by priority - "low", "medium", or "high" (optional)
    """
    session = ctx.context.session
    user_id = ctx.context.user_id

    statement = (
        select(Task)
        .where(Task.user_id == user_id)
    )
    if status:
        statement = statement.where(Task.status == TaskStatus(status))
    if priority:
        statement = statement.where(Task.priority == TaskPriority(priority))

    statement = statement.order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()

    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status.value,
            "priority": t.priority.value,
            "user_id": t.user_id,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
        }
        for t in tasks
    ]


@function_tool
def complete_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
) -> dict:
    """Toggles a task's completion status (pending <-> completed).

    Args:
        task_id: UUID of the task to toggle completion status
    """
    session = ctx.context.session
    user_id = ctx.context.user_id

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return {"error": "Task not found"}

    if task.status == TaskStatus.completed:
        task.status = TaskStatus.pending
    else:
        task.status = TaskStatus.completed

    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value,
        "priority": task.priority.value,
        "user_id": task.user_id,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
    }


@function_tool
def delete_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
) -> dict:
    """Permanently deletes a task belonging to the authenticated user.

    Args:
        task_id: UUID of the task to delete
    """
    session = ctx.context.session
    user_id = ctx.context.user_id

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return {"error": "Task not found"}

    title = task.title
    task_id_val = task.id
    session.delete(task)
    session.commit()

    return {"deleted": True, "task_id": task_id_val, "title": title}


@function_tool
def update_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
) -> dict:
    """Updates one or more fields of an existing task.

    Args:
        task_id: UUID of the task to update
        title: New title (optional, 1-255 chars)
        description: New description (optional, max 2000 chars)
        status: New status - "pending", "in_progress", or "completed" (optional)
        priority: New priority - "low", "medium", or "high" (optional)
    """
    session = ctx.context.session
    user_id = ctx.context.user_id

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return {"error": "Task not found"}

    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if status is not None:
        task.status = TaskStatus(status)
    if priority is not None:
        task.priority = TaskPriority(priority)

    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value,
        "priority": task.priority.value,
        "user_id": task.user_id,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
    }
