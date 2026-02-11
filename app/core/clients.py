"""
Centralized initialization for external clients.

Production-ready:
- Config validation
- Collection validation
- Fail-fast strategy
"""

from typing import Optional

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI

from app.core.config import settings


_qdrant_client: Optional[QdrantClient] = None
_embeddings: Optional[HuggingFaceEmbeddings] = None
_llm: Optional[ChatOpenAI] = None


def init_clients() -> None:
    """
    Initialize external services.

    Must be called inside FastAPI lifespan startup.
    """

    global _qdrant_client, _embeddings, _llm

    # ---------------------------
    # Validate critical settings
    # ---------------------------

    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is missing in environment variables.")

    if not settings.COLLECTION_NAME:
        raise RuntimeError("COLLECTION_NAME is not configured.")

    # ---------------------------
    # Initialize Qdrant
    # ---------------------------

    if _qdrant_client is None:
        _qdrant_client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
        )

        # Validate collection existence
        try:
            collections = _qdrant_client.get_collections().collections
            collection_names = [c.name for c in collections]

            if settings.COLLECTION_NAME not in collection_names:
                raise RuntimeError(
                    f"Qdrant collection '{settings.COLLECTION_NAME}' does not exist."
                )

        except UnexpectedResponse as e:
            raise RuntimeError(f"Failed to connect to Qdrant: {str(e)}")

    # ---------------------------
    # Initialize Embeddings
    # ---------------------------

    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL
        )

    # ---------------------------
    # Initialize LLM
    # ---------------------------

    if _llm is None:
        _llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=settings.OPENAI_TEMPERATURE,
        )

def close_clients() -> None:
    """
    Gracefully close external resources if needed.
    Currently Qdrant and OpenAI clients do not require manual close.
    """
    pass

def get_qdrant_client() -> QdrantClient:
    if _qdrant_client is None:
        raise RuntimeError("Qdrant client not initialized.")
    return _qdrant_client


def get_embeddings() -> HuggingFaceEmbeddings:
    if _embeddings is None:
        raise RuntimeError("Embeddings not initialized.")
    return _embeddings


def get_llm() -> ChatOpenAI:
    if _llm is None:
        raise RuntimeError("LLM not initialized.")
    return _llm
