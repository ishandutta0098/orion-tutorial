import json
import uuid

from fastapi import APIRouter, Header, HTTPException
from langgraph.types import Command
from starlette.responses import StreamingResponse

from config import DEFAULT_MODEL, OPENROUTER_API_KEY, WORKSPACE_PATH
from models.schemas import AgentApproveRequest, AgentRunRequest

router = APIRouter(prefix="/agent", tags=["agent"])

orchestrators: dict[str, tuple] = {}

STATUS_MAP = {
    "plan": "planning",
    "code": "coding",
    "review": "reviewing",
    "human_review": "waiting_approval",
    "apply": "applying",
    "test": "testing",
}


@router.post("/run")
async def run_agent(
    request: AgentRunRequest,
    x_api_key: str | None = Header(None),
):
    api_key = request.api_key or x_api_key or OPENROUTER_API_KEY
    model = request.model or DEFAULT_MODEL
    thread_id = request.thread_id or str(uuid.uuid4())

    from agent.graph import create_orchestrator

    graph, memory = create_orchestrator(
        api_key=api_key,
        model=model,
        workspace_path=WORKSPACE_PATH,
        rules=request.rules or "",
    )
    orchestrators[thread_id] = (graph, memory)

    async def event_generator():
        config = {"configurable": {"thread_id": thread_id}}
        try:
            async for chunk in graph.astream(
                {"feature_request": request.feature_request},
                config=config,
                stream_mode="updates",
            ):
                for node_name, state_update in chunk.items():
                    if node_name == "__interrupt__":
                        for interrupt_val in state_update:
                            yield f"data: {json.dumps({'type': 'approval_needed', **interrupt_val.value})}\n\n"
                        continue

                    if node_name in STATUS_MAP:
                        yield f"data: {json.dumps({'type': 'status', 'status': STATUS_MAP[node_name]})}\n\n"

                    if node_name == "plan" and isinstance(state_update, dict):
                        plan = state_update.get("plan", "")
                        tasks = state_update.get("file_tasks", [])
                        if plan:
                            yield f"data: {json.dumps({'type': 'plan', 'plan': plan, 'tasks': tasks})}\n\n"

                    if node_name == "code" and isinstance(state_update, dict):
                        for item in state_update.get("generated_code", []):
                            yield f"data: {json.dumps({'type': 'code', 'filepath': item.get('filepath', ''), 'description': item.get('explanation', ''), 'status': 'done'})}\n\n"

                    if node_name == "review" and isinstance(state_update, dict):
                        yield f"data: {json.dumps({'type': 'review', 'result': state_update.get('review_result', ''), 'status': state_update.get('status', '')})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"X-Thread-ID": thread_id},
    )


@router.post("/approve")
async def approve_agent(request: AgentApproveRequest):
    if request.thread_id not in orchestrators:
        raise HTTPException(status_code=404, detail="Thread not found")

    graph, _ = orchestrators[request.thread_id]

    async def event_generator():
        config = {"configurable": {"thread_id": request.thread_id}}
        async for chunk in graph.astream(
            Command(resume=request.decision),
            config=config,
            stream_mode="updates",
        ):
            for node_name, state_update in chunk.items():
                if node_name in STATUS_MAP:
                    yield f"data: {json.dumps({'type': 'status', 'status': STATUS_MAP[node_name]})}\n\n"
                if isinstance(state_update, dict) and "status" in state_update:
                    yield f"data: {json.dumps({'type': 'status', 'status': state_update['status']})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/history/{thread_id}")
async def get_history(thread_id: str):
    if thread_id not in orchestrators:
        return {"steps": []}

    graph, _ = orchestrators[thread_id]
    config = {"configurable": {"thread_id": thread_id}}
    steps = []
    for i, state in enumerate(graph.get_state_history(config)):
        steps.append({
            "step": i,
            "status": state.values.get("status", ""),
            "next": list(state.next) if state.next else [],
            "state": {
                k: str(v)[:200] if isinstance(v, (list, dict)) else v
                for k, v in state.values.items()
                if k in ("status", "plan", "review_result", "test_output", "human_decision")
            },
        })
    return {"steps": steps}
