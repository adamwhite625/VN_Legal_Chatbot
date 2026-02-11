"""
LangGraph workflow for Legal Agentic RAG.

Production-ready version with:
- strict routing
- safe state handling
- deterministic branching
"""

from langgraph.graph import StateGraph, END
from typing import Literal

from .state import LawAgentState

# Import nodes
from .nodes.contextualize_agent import contextualize_node
from .nodes.router_agent import router_node
from .nodes.retrieval_agent import retriever_node
from .nodes.checker_agent import sufficiency_checker_node
from .nodes.writer_agent import answer_node
from .nodes.fallback_agent import fallback_node
from .nodes.clarifier_agent import clarifier_node

# ==========================================================
# Graph Definition
# ==========================================================

workflow = StateGraph(LawAgentState)


# ----------------------
# Register Nodes
# ----------------------

workflow.add_node("contextualize", contextualize_node)
workflow.add_node("router", router_node)
workflow.add_node("retriever", retriever_node)
workflow.add_node("checker", sufficiency_checker_node)
workflow.add_node("answer", answer_node)
workflow.add_node("fallback", fallback_node)
workflow.add_node("clarifier", clarifier_node)



# ----------------------
# Entry Point
# ----------------------

workflow.set_entry_point("contextualize")


# ----------------------
# Linear Flow
# ----------------------

workflow.add_edge("contextualize", "router")
workflow.add_edge("router", "retriever")
workflow.add_edge("retriever", "checker")


# ----------------------
# Conditional Branching
# ----------------------

def route_after_check(state: LawAgentState) -> Literal["answer", "clarifier", "fallback"]:
    """
    Decide next node based on sufficiency check.

    Routing logic:
    - SUFFICIENT → answer node
    - MISSING_INFO → clarifier node
    - NO_LAW or others → fallback node
    """

    if state.check_status is None:
        return "fallback"

    if state.check_status == "SUFFICIENT":
        return "answer"

    if state.check_status == "MISSING_INFO":
        return "clarifier"

    return "fallback"


workflow.add_conditional_edges(
    "checker",
    route_after_check,
    {
        "answer": "answer",
        "clarifier": "clarifier",
        "fallback": "fallback",
    },
)


# ----------------------
# Terminal Edges
# ----------------------

workflow.add_edge("answer", END)
workflow.add_edge("clarifier", END)
workflow.add_edge("fallback", END)


# ==========================================================
# Compile
# ==========================================================

app = workflow.compile()
