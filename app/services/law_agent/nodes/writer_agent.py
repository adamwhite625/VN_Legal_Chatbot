from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.clients import get_llm
from app.services.law_agent.state import LawAgentState
from app.services.formatters import format_sources_from_docs


def answer_node(state: LawAgentState) -> LawAgentState:
    """
    Generate final legal answer strictly from retrieved documents.
    """

    llm = get_llm()
    state.node_trace.append("writer")

    if not state.retrieved_docs:
        state.generation = (
            "Xin lỗi, tôi không tìm thấy căn cứ pháp lý phù hợp để trả lời câu hỏi này."
        )
        state.sources = []
        return state

    # ---------------------------
    # Build context safely
    # ---------------------------

    context_blocks = []

    for doc in state.retrieved_docs:
        law_id = (doc.law_id or "").replace("Điều", "").strip()
        law_name = (doc.law_name or "").replace("(", "").replace(")", "").strip()

        context_blocks.append(
            f"Điều {law_id}\n"
            f"Văn bản: {law_name}\n"
            f"Nội dung:\n{doc.content}"
        )

    context_text = "\n\n---\n\n".join(context_blocks)

    # ---------------------------
    # Prompt
    # ---------------------------

    template = """
Bạn là Luật sư AI chuyên nghiệp.

NGUYÊN TẮC:
- Chỉ sử dụng thông tin trong phần "VĂN BẢN PHÁP LÝ".
- Không được tạo điều luật mới.
- Không suy đoán ngoài dữ liệu.

VĂN BẢN PHÁP LÝ:
{context}

CÂU HỎI:
{query}

YÊU CẦU:
- Trả lời có cấu trúc rõ ràng.
- Viện dẫn theo format: "Theo Điều X (Tên Luật)..."
- Không thêm mục nguồn ở cuối.
- Không nhắc đến việc bạn là AI.

CÂU TRẢ LỜI:
"""

    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "query"],
    )

    chain = prompt | llm | StrOutputParser()

    try:
        answer = chain.invoke(
            {
                "context": context_text,
                "query": state.standalone_query or state.query,
            }
        )

        state.generation = answer.strip()

        # Clean formatted sources
        state.sources = format_sources_from_docs(
            [
                {
                    "law_name": doc.law_name,
                    "law_id": doc.law_id,
                }
                for doc in state.retrieved_docs
            ]
        )

        return state

    except Exception as e:
        state.error_message = f"Writer error: {str(e)}"
        state.generation = "Xin lỗi, tôi gặp sự cố khi soạn thảo câu trả lời."
        state.sources = []
        return state
