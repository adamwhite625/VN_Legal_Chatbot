from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps
# Import Graph AI từ Service Layer (Bạn cần di chuyển folder agents trước)
from app.services.law_agent.graph import app as agent_app 
from app.services.formatters import format_sources 

from app.core.limiter import limiter

router = APIRouter()

@router.post("/send", response_model=schemas.ChatResponse)
@limiter.limit("5/minute")  # 1. Bảo mật: Giới hạn 5 tin nhắn/phút
async def chat_with_lawyer(
    request: Request,  # 2. Bắt buộc có Request để Limiter lấy IP
    input_data: schemas.QueryInput,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Kiểm tra đầu vào
    if not input_data.query or not input_data.query.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập câu hỏi.")

    # ====================================================
    # BƯỚC 1: XỬ LÝ SESSION & LỊCH SỬ CHAT
    # ====================================================
    chat_history_text = ""
    
    # Nếu user gửi kèm session_id, hãy kiểm tra xem nó có hợp lệ không
    if input_data.session_id:
        session = db.query(models.ChatSession).filter(
            models.ChatSession.id == input_data.session_id,
            models.ChatSession.user_id == current_user.id
        ).first()
        
        # Nếu session không tồn tại (hoặc không phải của user này) -> Tạo mới luôn
        if not session:
            new_session = models.ChatSession(user_id=current_user.id)
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            input_data.session_id = new_session.id
        else:
            # Nếu session hợp lệ -> Lấy 5 tin nhắn gần nhất làm context
            history = db.query(models.Message).filter(
                models.Message.session_id == input_data.session_id
            ).order_by(models.Message.created_at.asc()).all()
            
            # Ghép lịch sử thành chuỗi văn bản cho AI đọc
            chat_history_text = "\n".join([f"{msg.sender}: {msg.message}" for msg in history[-5:]])
    else:
        # Trường hợp user chưa có session_id (Chat mới) -> Tạo session mới
        new_session = models.ChatSession(user_id=current_user.id)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        input_data.session_id = new_session.id

    # ====================================================
    # BƯỚC 2: GỌI AI SERVICE (LANGGRAPH)
    # ====================================================
    final_answer = "Hệ thống đang bảo trì."
    final_sources = []

    try:
        # Chuẩn bị input cho Graph
        inputs = {
            "query": input_data.query,
            "chat_history": chat_history_text
        }
        
        # Chạy Graph
        output = agent_app.invoke(inputs)
        
        # Lấy kết quả từ State
        final_answer = output.get("generation", "Xin lỗi, tôi không thể xử lý yêu cầu này.")
        raw_sources = output.get("sources", [])
        
        # Format nguồn tham khảo (nếu có)
        if raw_sources:
            # Chuyển đổi list string thành format mà hàm format_sources chấp nhận
            formatted_list, _ = format_sources(
                [{"source": src, "content": ""} for src in raw_sources]
            )
            final_sources = formatted_list
            
    except Exception as e:
        print(f"❌ Agent Error: {e}")
        final_answer = "Hiện tại hệ thống đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."

    # ====================================================
    # BƯỚC 3: LƯU TIN NHẮN VÀO DB
    # ====================================================
    try:
        # Lưu câu hỏi của User
        user_msg = models.Message(
            session_id=input_data.session_id, 
            sender="user", 
            message=input_data.query
        )
        # Lưu câu trả lời của Bot
        bot_msg = models.Message(
            session_id=input_data.session_id, 
            sender="assistant", 
            message=final_answer
        )
        
        db.add_all([user_msg, bot_msg])
        db.commit()
    except Exception as e:
        print(f"⚠️ DB Save Error: {e}")
        # Không raise lỗi ở đây để user vẫn nhận được câu trả lời dù lỗi lưu DB

    return schemas.ChatResponse(answer=final_answer, sources=final_sources)

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