from pydantic import BaseModel
from typing import Optional, List


class QueryInput(BaseModel):
    query: str
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
