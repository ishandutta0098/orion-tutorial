from typing import TypedDict, Annotated
from langgraph.graph import MessagesState


class OrchestratorState(TypedDict):
    feature_request: str
    codebase_context: str
    plan: str
    file_tasks: list[dict]
    generated_code: list[dict]
    review_result: str
    review_attempts: int
    human_decision: str
    test_output: str
    status: str


def add_to_list(existing: list, new: list) -> list:
    return existing + new


class ParallelState(TypedDict):
    file_tasks: list[dict]
    codebase_context: str
    generated_code: Annotated[list[dict], add_to_list]


class SingleFileState(TypedDict):
    task: dict
    codebase_context: str
    generated_code: list[dict]
