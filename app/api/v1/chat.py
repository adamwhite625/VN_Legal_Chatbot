from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps
# Import Graph AI từ Service Layer (Bạn cần di chuyển folder agents trước)
from app.services.law_agent.graph import app as agent_app

from app.core.limiter import limiter

from app.services.law_agent.title_generator import generate_chat_title

from app.services.chat_service import process_chat

router = APIRouter()

@router.post("/send", response_model=schemas.ChatResponse)
@limiter.limit("5/minute")
async def chat_with_lawyer(
    request: Request,
    input_data: schemas.QueryInput,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    return await process_chat(
        db=db,
        current_user=current_user,
        input_data=input_data,
    )

@router.get("/sessions")
def read_sessions(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Lấy danh sách session của user hiện tại
    return db.query(models.ChatSession).filter(
        models.ChatSession.user_id == current_user.id
    ).order_by(models.ChatSession.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/history/{session_id}")
def get_history(
    session_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Kiểm tra quyền
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return db.query(models.Message).filter(
        models.Message.session_id == session_id
    ).order_by(models.Message.created_at.asc()).all()

@router.post("/session/start")
def start_session(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    new_session = models.ChatSession(user_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session