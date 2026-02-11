from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.clients import get_llm
from app.services.law_agent.state import LawAgentState


def clarifier_node(state: LawAgentState) -> LawAgentState:
    """
    Generate clarification question when information is insufficient.
    """

    llm = get_llm()
    state.node_trace.append("clarifier")

    prompt = PromptTemplate(
        template="""
Bạn là trợ lý pháp lý thông minh.

Người dùng hỏi:
"{query}"

Câu hỏi này còn thiếu thông tin để xác định căn cứ pháp lý.

Hãy đặt 1–3 câu hỏi ngắn gọn, rõ ràng để làm rõ:
- Loại tranh chấp
- Chủ thể liên quan
- Mục tiêu pháp lý

KHÔNG trả lời luật.
Chỉ đặt câu hỏi làm rõ.

Câu hỏi làm rõ:
""",
        input_variables=["query"],
    )

    chain = prompt | llm | StrOutputParser()

    try:
        clarification = chain.invoke({"query": state.query})

        state.generation = clarification
        state.sources = []

        return state

    except Exception as e:
        state.error_message = f"Clarifier error: {str(e)}"
        state.generation = (
            "Anh/chị có thể cung cấp thêm thông tin chi tiết về vấn đề muốn kiện không?"
        )
        state.sources = []
        return state
