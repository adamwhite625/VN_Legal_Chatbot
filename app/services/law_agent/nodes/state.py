from typing import Optional, TypedDict, List, Dict, Any, Literal

from pydantic import BaseModel, Field

from app.services.law_agent.state import RetrievedDocument

class LawAgentState(BaseModel):

    # Input
    query: str
    standalone_query: Optional[str] = None
    chat_history: Optional[str] = None

    # Router
    intent: Optional[str] = None
    search_limit: Optional[int] = None

    # Retrieval
    retrieved_docs: List[RetrievedDocument] = Field(default_factory=list)

    # Checker
    check_status: Optional[
        Literal["SUFFICIENT", "MISSING_INFO", "NO_LAW"]
    ] = None

    # Output
    generation: Optional[str] = None
    sources: List[str] = Field(default_factory=list)

    # Observability
    error_message: Optional[str] = None
    node_trace: List[str] = Field(default_factory=list)

    # Clarification memory
    previous_question: Optional[str] = None
    was_clarification: bool = False
