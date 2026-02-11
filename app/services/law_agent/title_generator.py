from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.clients import get_llm

async def generate_chat_title(first_question: str) -> str:
    """
    Tóm tắt câu hỏi đầu tiên thành tiêu đề ngắn gọn (dưới 10 từ).
    """
    llm = get_llm()
    print(f"🏷️ [TITLE]: Đang tạo tiêu đề cho: '{first_question}'...")
    
    prompt = PromptTemplate(
        template="""Nhiệm vụ: Tóm tắt câu hỏi sau thành một tiêu đề ngắn gọn (3-7 từ) để làm lịch sử chat.
        Câu hỏi: "{question}"
        
        Yêu cầu:
        1. Tiêu đề phải là tiếng Việt, ngắn gọn, xúc tích.
        2. Không dùng dấu ngoặc kép.
        3. Ví dụ: "Thủ tục ly hôn đơn phương", "Mức phạt tội trộm cắp", "Quy định về đất đai".
        
        Tiêu đề:""",
        input_variables=["question"]
    )

    chain = prompt | llm | StrOutputParser()
    
    try:
        title = await chain.ainvoke({"question": first_question})
        title = title.strip().replace('"', '')
        print(f"   -> Tiêu đề mới: {title}")
        return title
    except Exception as e:
        print(f"⚠️ Lỗi tạo tiêu đề: {e}")
        return "Tư vấn pháp luật mới"