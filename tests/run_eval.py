import sys
import os
import json
import pandas as pd
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

# Thêm đường dẫn root để import được app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import Graph của bạn
from app.services.law_agent.graph import app as agent_app
from app.core.config import settings

# 1. Cấu hình Model chấm điểm (Dùng GPT-4o-mini hoặc GPT-3.5 cho rẻ)
# Ragas cần Model riêng để làm giám khảo
evaluator_llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
evaluator_embeddings = OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY)

def run_evaluation():
    print("🚀 Bắt đầu quá trình Evaluation...")
    
    # 2. Load dữ liệu test
    with open("tests/evaluation_dataset.json", "r", encoding="utf-8") as f:
        test_data = json.load(f)

    questions = []
    ground_truths = []
    answers = []
    contexts = []

    # 3. Chạy từng câu hỏi qua Chatbot
    for item in test_data:
        q = item["question"]
        print(f" -> Đang test: {q}")
        
        # Gọi Chatbot
        inputs = {"query": q, "chat_history": ""} # Tạm thời chưa test history
        output = agent_app.invoke(inputs)
        
        # Thu thập kết quả
        questions.append(q)
        ground_truths.append(item["ground_truth"])
        answers.append(output.get("generation", "Error"))
        
        # Lấy nội dung context (retrieved docs)
        docs = output.get("retrieved_docs", [])
        doc_contents = [d["content"] for d in docs]
        contexts.append(doc_contents)

    # 4. Chuẩn bị Dataset cho Ragas
    data_dict = {
        "question": questions,
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths
    }
    
    from datasets import Dataset
    dataset = Dataset.from_dict(data_dict)

    # 5. Chấm điểm
    print("⚖️  Đang chấm điểm (Ragas)...")
    results = evaluate(
        dataset=dataset,
        metrics=[
            faithfulness,       # Hallucination (0-1)
            answer_relevancy,   # Trả lời đúng ý không (0-1)
            context_precision,  # Tìm đúng tài liệu không (0-1)
            context_recall,     # Tài liệu tìm được có đủ ý so với Ground Truth không (0-1)
        ],
        llm=evaluator_llm,
        embeddings=evaluator_embeddings
    )

    # 6. Xuất báo cáo
    print("\n📊 KẾT QUẢ ĐÁNH GIÁ:")
    print(results)
    
    df = results.to_pandas()
    df.to_excel("evaluation_report.xlsx", index=False)
    print("✅ Đã lưu báo cáo chi tiết vào 'evaluation_report.xlsx'")

if __name__ == "__main__":
    run_evaluation()