from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command, Send
from langchain_openai import ChatOpenAI
from .state import OrchestratorState, ParallelState, SingleFileState, add_to_list
from .tools import create_tools
from .rag import build_index, search_codebase_fn
from .planner import create_planner, plan_node, Plan
from .coder import create_coder, code_node, code_single_file
from .reviewer import create_reviewer, review_node
import os
from typing import Annotated


def create_orchestrator(api_key: str, model: str, workspace_path: str, rules: str = ""):
    planner = create_planner(api_key, model)
    coder = create_coder(api_key, model)
    reviewer = create_reviewer(api_key, model)

    retriever = None
    try:
        retriever = build_index(workspace_path, api_key)
    except Exception:
        pass

    def plan_step(state: OrchestratorState):
        context = ""
        if retriever:
            context = search_codebase_fn(retriever, state["feature_request"])

        result = plan_node(
            {**state, "codebase_context": context},
            planner,
            codebase_context=context
        )
        result["codebase_context"] = context
        return result

    def code_step(state: OrchestratorState):
        return code_node(state, coder, rules=rules)

    def review_step(state: OrchestratorState):
        return review_node(state, reviewer)

    def human_review_step(state: OrchestratorState):
        changes = []
        for item in state.get("generated_code", []):
            changes.append({
                "filepath": item["filepath"],
                "description": item.get("explanation", ""),
                "code_preview": item.get("code", "")[:500]
            })

        review_info = {
            "plan": state.get("plan", ""),
            "review_result": state.get("review_result", ""),
            "changes": changes
        }

        decision = interrupt(review_info)
        return {"human_decision": decision, "status": "human_reviewed"}

    def apply_changes_step(state: OrchestratorState):
        for item in state.get("generated_code", []):
            filepath = item["filepath"]
            code = item["code"]
            full_path = os.path.join(workspace_path, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w") as f:
                f.write(code)
        return {"status": "applied"}

    def test_step(state: OrchestratorState):
        import subprocess
        test_files = [item["filepath"] for item in state.get("generated_code", [])]
        results = []
        for filepath in test_files:
            full_path = os.path.join(workspace_path, filepath)
            if full_path.endswith(".py") and os.path.exists(full_path):
                result = subprocess.run(
                    ["python3", "-c", f"import ast; ast.parse(open('{full_path}').read()); print('Syntax OK: {filepath}')"],
                    capture_output=True, text=True, timeout=10
                )
                results.append(result.stdout + result.stderr)

        return {
            "test_output": "\n".join(results) if results else "No tests run",
            "status": "tested"
        }

    def route_after_review(state: OrchestratorState) -> str:
        if state.get("status") == "approved":
            return "human_review"
        return "code"

    def route_after_human(state: OrchestratorState) -> str:
        if state.get("human_decision") == "approve":
            return "apply"
        return "code"

    graph = StateGraph(OrchestratorState)
    graph.add_node("plan", plan_step)
    graph.add_node("code", code_step)
    graph.add_node("review", review_step)
    graph.add_node("human_review", human_review_step)
    graph.add_node("apply", apply_changes_step)
    graph.add_node("test", test_step)

    graph.add_edge(START, "plan")
    graph.add_edge("plan", "code")
    graph.add_edge("code", "review")
    graph.add_conditional_edges("review", route_after_review, {"human_review": "human_review", "code": "code"})
    graph.add_conditional_edges("human_review", route_after_human, {"apply": "apply", "code": "code"})
    graph.add_edge("apply", "test")
    graph.add_edge("test", END)

    memory = MemorySaver()
    compiled = graph.compile(checkpointer=memory)

    return compiled, memory
