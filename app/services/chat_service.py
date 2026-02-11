"""
Chat service layer.

Handles:
- session validation
- chat history
- agent invocation
- DB persistence
- title generation
"""

import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app import models, schemas
from app.services.law_agent.graph import app as agent_app
from app.services.law_agent.title_generator import generate_chat_title

logger = logging.getLogger(__name__)


async def process_chat(
    db: Session,
    current_user: models.User,
    input_data: schemas.QueryInput,
) -> schemas.ChatResponse:

    if not input_data.query or not input_data.query.strip():
        raise HTTPException(status_code=400, detail="Empty query.")

    # -------------------------
    # 1. Load or create session
    # -------------------------
    session = None
    chat_history_text = ""

    if input_data.session_id:
        session = db.query(models.ChatSession).filter(
            models.ChatSession.id == input_data.session_id,
            models.ChatSession.user_id == current_user.id
        ).first()

    if not session:
        session = models.ChatSession(user_id=current_user.id)
        db.add(session)
        db.flush()  # get session.id without full commit

    # -------------------------
    # 2. Build chat history
    # -------------------------
    history = db.query(models.Message).filter(
        models.Message.session_id == session.id
    ).order_by(models.Message.created_at.asc()).all()

    chat_history_text = "\n".join(
        [f"{msg.sender}: {msg.message}" for msg in history[-5:]]
    )

    # -------------------------
    # 3. Call agent
    # -------------------------
    try:
        inputs = {
            "query": input_data.query,
            "chat_history": chat_history_text,
        }

        output = await agent_app.ainvoke(inputs)

        final_answer = output.get(
            "generation",
            "Xin lỗi, tôi không thể xử lý yêu cầu này."
        )

        raw_sources = output.get("sources", [])
        # raw_sources already formatted by writer_agent
        formatted_sources = raw_sources if raw_sources else []

    except Exception as e:
        logger.error(f"Agent error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}"
        )

    # -------------------------
    # 4. Persist messages (single transaction)
    # -------------------------
    try:
        user_msg = models.Message(
            session_id=session.id,
            sender="user",
            message=input_data.query,
        )

        bot_msg = models.Message(
            session_id=session.id,
            sender="assistant",
            message=final_answer,
        )

        db.add_all([user_msg, bot_msg])
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error."
        )

    return schemas.ChatResponse(
        answer=final_answer,
        sources=formatted_sources,
    )
