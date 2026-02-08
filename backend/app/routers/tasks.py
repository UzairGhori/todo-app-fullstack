from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_session
from app.models.task import Task, TaskCreate, TaskRead, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    body: TaskCreate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = Task(
        title=body.title,
        description=body.description,
        status=body.status,
        priority=body.priority,
        user_id=user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("", response_model=list[TaskRead])
def list_tasks(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()
    return tasks


@router.get("/{task_id}", response_model=TaskRead)
def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: str,
    body: TaskUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    session.delete(task)
    session.commit()
