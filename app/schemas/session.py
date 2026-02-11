from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SessionResponse(BaseModel):
    id: int
    created_at: datetime
    first_message: Optional[str] = None

    class Config:
        from_attributes = True
