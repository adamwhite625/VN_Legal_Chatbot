"""
Contextualization node for Agentic Legal RAG.

Handles:
- Standalone query rewriting
- Clarification merging
"""

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.clients import get_llm
from app.services.law_agent.state import LawAgentState


def contextualize_node(state: LawAgentState) -> LawAgentState:

    state.node_trace.append("contextualize")

    query = state.query.strip()
    chat_history = state.chat_history or ""

    # If there is chat history, rewrite as standalone
    if chat_history:

        llm = get_llm()

        prompt = PromptTemplate(
            template="""
Dựa trên lịch sử hội thoại dưới đây,
hãy viết lại câu hỏi cuối cùng của người dùng
thành một câu hỏi pháp lý đầy đủ, rõ nghĩa.

Lịch sử:
{chat_history}

Câu hỏi mới:
{query}

Câu hỏi đầy đủ:
""",
            input_variables=["chat_history", "query"],
        )

        chain = prompt | llm | StrOutputParser()

        try:
            standalone = chain.invoke({
                "chat_history": chat_history,
                "query": query
            })

            state.standalone_query = standalone
            return state

        except Exception:
            state.standalone_query = query
            return state

    # No history → treat as new question
    state.standalone_query = query
    return state
