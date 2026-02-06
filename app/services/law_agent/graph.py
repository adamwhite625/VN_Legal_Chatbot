from langgraph.graph import StateGraph, END
from .state import LawAgentState

# Import các Node
from .nodes.contextualize_agent import contextualize_node
from .nodes.router_agent import router_node
from .nodes.retrieval_agent import retriever_node
from .nodes.checker_agent import sufficiency_checker_node
from .nodes.writer_agent import answer_node
from .nodes.fallback_agent import fallback_node

workflow = StateGraph(LawAgentState)

# Add Nodes
workflow.add_node("contextualize", contextualize_node) 
workflow.add_node("router", router_node)
workflow.add_node("retriever", retriever_node)
workflow.add_node("checker", sufficiency_checker_node)
workflow.add_node("answer", answer_node)
workflow.add_node("fallback", fallback_node)

# --- SỬA LẠI LUỒNG ĐI (EDGES) ---

# 1. Điểm bắt đầu -> Vào Contextualize trước (để sửa câu hỏi)
workflow.set_entry_point("contextualize")

# 2. Contextualize -> Router (Router sẽ dùng câu hỏi đã sửa để phân loại)
workflow.add_edge("contextualize", "router")

# 3. Router -> Retriever
workflow.add_edge("router", "retriever")

# 4. Retriever -> Checker
workflow.add_edge("retriever", "checker")

# Logic rẽ nhánh (Giữ nguyên)
def route_after_check(state):
    status = state.get("check_status", "NO_LAW")
    if status == "SUFFICIENT":
        return "answer"
    else:
        return "fallback"

workflow.add_conditional_edges(
    "checker",
    route_after_check,
    {
        "answer": "answer",
        "fallback": "fallback"
    }
)

workflow.add_edge("answer", END)
workflow.add_edge("fallback", END)

app = workflow.compile()