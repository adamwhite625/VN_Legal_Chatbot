from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import llm

def contextualize_node(state):
    """
    Node 0: Viết lại câu hỏi dựa trên lịch sử (Contextual Rephrasing)
    """
    query = state["query"]
    chat_history = state.get("chat_history", "")

    # Nếu không có lịch sử chat, không cần viết lại, trả về nguyên gốc
    if not chat_history:
        return {"standalone_query": query}

    print(f"🔄 [REPHRASE]: Đang viết lại câu hỏi: '{query}'...")

    prompt = PromptTemplate(
        template="""Nhiệm vụ: Viết lại câu hỏi của người dùng thành một câu hỏi độc lập, đầy đủ ý nghĩa để công cụ tìm kiếm có thể hiểu được, dựa trên lịch sử trò chuyện.
        
        Lịch sử trò chuyện:
        {chat_history}
        
        Câu hỏi mới của người dùng: {query}
        
        Yêu cầu:
        1. Nếu câu hỏi mới phụ thuộc vào lịch sử (ví dụ: "Nó bị phạt bao nhiêu?", "Thủ tục thế nào?"), hãy thay thế các đại từ (nó, đó, ấy...) bằng danh từ cụ thể từ lịch sử.
        2. Nếu câu hỏi mới hoàn toàn không liên quan đến chủ đề trước đó, hãy giữ nguyên câu hỏi mới.
        3. CHỈ TRẢ VỀ CÂU HỎI ĐÃ VIẾT LẠI, không giải thích thêm.
        
        Câu hỏi viết lại:""",
        input_variables=["chat_history", "query"]
    )

    chain = prompt | llm | StrOutputParser()
    
    try:
        standalone_query = chain.invoke({
            "chat_history": chat_history,
            "query": query
        })
        print(f"   -> Kết quả: '{standalone_query}'")
        return {"standalone_query": standalone_query}
    except Exception as e:
        print(f"⚠️ Lỗi Rephrase: {e}")
        # Nếu lỗi thì dùng câu hỏi gốc
        return {"standalone_query": query}