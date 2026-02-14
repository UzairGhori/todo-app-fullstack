from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.agent.agent import run_agent
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_session
from app.models.conversation import (
    ChatRequest,
    ChatResponse,
    Conversation,
    Message,
    MessageRead,
    MessageRole,
)

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Load or create conversation
    if body.conversation_id:
        conversation = session.exec(
            select(Conversation).where(
                Conversation.id == body.conversation_id,
                Conversation.user_id == user_id,
            )
        ).first()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.user,
        content=body.message,
    )
    session.add(user_message)
    session.commit()

    # Load last 20 messages for context
    history_messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .offset(0)
    ).all()

    if len(history_messages) > 20:
        history_messages = history_messages[-20:]

    # Format messages for agent
    agent_messages = [
        {"role": msg.role.value, "content": msg.content}
        for msg in history_messages
    ]

    # Run agent
    try:
        response_text, tool_calls_data = await run_agent(
            agent_messages, user_id, session
        )
        if not response_text:
            response_text = "I'm not sure how to respond to that. Can I help you manage your tasks?"
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process your request. Please try again.",
        )

    # Save assistant message
    assistant_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=response_text,
        tool_calls=tool_calls_data,
    )
    session.add(assistant_message)

    # Update conversation timestamp
    conversation.updated_at = datetime.now(timezone.utc)
    session.add(conversation)
    session.commit()
    session.refresh(assistant_message)

    return ChatResponse(
        conversation_id=conversation.id,
        message=MessageRead(
            id=assistant_message.id,
            role=assistant_message.role,
            content=assistant_message.content,
            tool_calls=assistant_message.tool_calls,
            created_at=assistant_message.created_at,
        ),
    )
