from fastapi import APIRouter
from app.api.v1 import auth, chat, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])