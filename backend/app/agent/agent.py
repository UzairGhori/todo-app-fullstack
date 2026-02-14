import json
import re
from datetime import datetime, timezone

from openai import AsyncOpenAI
from sqlmodel import Session, select

from app.config import OPENROUTER_API_KEY
from app.models.task import Task, TaskStatus, TaskPriority

MODEL = "google/gemma-3-4b-it:free"

openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

SYSTEM_PROMPT = """You are TaskFlow Assistant, a helpful AI that manages the user's todo tasks through conversation.

CAPABILITIES:
- Create, list, update, complete, and delete tasks using your available tools.
- Answer questions about the user's tasks (counts, status, priorities).
- Provide brief, friendly confirmations after every action.

RULES:
1. Always use tools for task operations — never guess or fabricate task data.
2. When the user's intent is ambiguous, ask a clarifying question before acting.
3. When listing tasks, format them as a numbered list with status and priority.
4. After creating/updating/deleting a task, confirm what was done with the task title.
5. If a tool returns an error, explain the issue in user-friendly language.
6. If the user asks something unrelated to task management, politely redirect: "I'm your task management assistant. I can help you create, view, update, or delete tasks. What would you like to do?"
7. Keep responses concise — no more than 3 sentences unless listing tasks.
8. When deleting, confirm the task title before proceeding if the user only gave a partial match.

AVAILABLE TOOLS:
To use a tool, you MUST respond with ONLY a JSON block wrapped in <tool_call> tags like this:
<tool_call>{"name": "tool_name", "args": {"param": "value"}}</tool_call>

Tools:
1. add_task(title: str, description?: str, priority?: "low"|"medium"|"high", status?: "pending"|"in_progress"|"completed")
   Creates a new task for the user.

2. list_tasks(status?: "pending"|"in_progress"|"completed", priority?: "low"|"medium"|"high")
   Lists user's tasks with optional filters.

3. complete_task(task_id: str)
   Toggles a task between pending and completed. task_id can be the UUID or the task title.

4. delete_task(task_id: str)
   Permanently deletes a task. task_id can be the UUID or the task title.

5. update_task(task_id: str, title?: str, description?: str, status?: "pending"|"in_progress"|"completed", priority?: "low"|"medium"|"high")
   Updates one or more fields of a task. task_id can be the UUID or the task title.

IMPORTANT: When you want to call a tool, output ONLY the <tool_call> tag with nothing else.
After receiving a tool result, respond naturally to the user about what happened."""


def _find_task(task_id: str, user_id: str, session: Session):
    """Find a task by ID or by title (case-insensitive partial match)."""
    # Try exact ID match first
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if task:
        return task
    # Fallback: match by title (case-insensitive contains)
    tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()
    query = task_id.lower()
    for t in tasks:
        if query in t.title.lower():
            return t
    return None


def _execute_tool(name: str, args: dict, user_id: str, session: Session) -> dict:
    """Execute a tool by name and return the result."""
    if name == "add_task":
        task = Task(
            title=args["title"],
            description=args.get("description"),
            status=TaskStatus(args.get("status", "pending")),
            priority=TaskPriority(args.get("priority", "medium")),
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
            "created_at": task.created_at.isoformat(),
        }

    elif name == "list_tasks":
        stmt = select(Task).where(Task.user_id == user_id)
        if args.get("status"):
            stmt = stmt.where(Task.status == TaskStatus(args["status"]))
        if args.get("priority"):
            stmt = stmt.where(Task.priority == TaskPriority(args["priority"]))
        stmt = stmt.order_by(Task.created_at.desc())
        tasks = session.exec(stmt).all()
        return [
            {"id": t.id, "title": t.title, "status": t.status.value, "priority": t.priority.value}
            for t in tasks
        ]

    elif name == "complete_task":
        task = _find_task(args["task_id"], user_id, session)
        if not task:
            return {"error": "Task not found"}
        task.status = TaskStatus.pending if task.status == TaskStatus.completed else TaskStatus.completed
        task.updated_at = datetime.now(timezone.utc)
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"id": task.id, "title": task.title, "status": task.status.value}

    elif name == "delete_task":
        task = _find_task(args["task_id"], user_id, session)
        if not task:
            return {"error": "Task not found"}
        title = task.title
        session.delete(task)
        session.commit()
        return {"deleted": True, "title": title}

    elif name == "update_task":
        task = _find_task(args["task_id"], user_id, session)
        if not task:
            return {"error": "Task not found"}
        if args.get("title") is not None:
            task.title = args["title"]
        if args.get("description") is not None:
            task.description = args["description"]
        if args.get("status") is not None:
            task.status = TaskStatus(args["status"])
        if args.get("priority") is not None:
            task.priority = TaskPriority(args["priority"])
        task.updated_at = datetime.now(timezone.utc)
        session.add(task)
        session.commit()
        session.refresh(task)
        return {
            "id": task.id, "title": task.title,
            "status": task.status.value, "priority": task.priority.value,
        }

    return {"error": f"Unknown tool: {name}"}


def _parse_tool_call(text: str):
    """Parse a tool call from model response. Returns (name, args) or (None, None)."""
    match = re.search(r"<tool_call>\s*(\{.*?\})\s*</tool_call>", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(1))
            return data.get("name"), data.get("args", {})
        except json.JSONDecodeError:
            return None, None
    return None, None


async def run_agent(
    messages: list[dict], user_id: str, session: Session
) -> tuple[str, str | None]:
    """Run the agent with prompt-based tool calling.

    Injects instructions into the first user message since some free models
    (e.g. Gemma) don't support the system role.

    Returns (response_text, tool_calls_json).
    """
    # Build messages with instructions injected into the first user message
    full_messages = []
    instructions_injected = False
    for msg in messages:
        if msg["role"] == "user" and not instructions_injected:
            full_messages.append({
                "role": "user",
                "content": f"[INSTRUCTIONS]\n{SYSTEM_PROMPT}\n[/INSTRUCTIONS]\n\nUser request: {msg['content']}",
            })
            instructions_injected = True
        else:
            full_messages.append(msg)

    tool_calls_log = []

    for _ in range(3):  # max 3 tool-calling rounds
        resp = await openrouter_client.chat.completions.create(
            model=MODEL,
            messages=full_messages,
            max_tokens=1000,
        )
        assistant_text = resp.choices[0].message.content or ""

        tool_name, tool_args = _parse_tool_call(assistant_text)
        if tool_name:
            result = _execute_tool(tool_name, tool_args, user_id, session)
            tool_calls_log.append({"tool": tool_name, "input": tool_args})

            full_messages.append({"role": "assistant", "content": assistant_text})
            full_messages.append({
                "role": "user",
                "content": f"[Tool Result for {tool_name}]: {json.dumps(result)}",
            })
        else:
            # No tool call — this is the final response
            return assistant_text, json.dumps(tool_calls_log) if tool_calls_log else None

    # Exhausted rounds, return last response
    return assistant_text, json.dumps(tool_calls_log) if tool_calls_log else None
