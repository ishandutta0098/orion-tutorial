import type { ChapterDef } from "./schema";

export const playground: ChapterDef = {
  slug: "playground",
  number: 19,
  notebook: "Notebook 03",
  subtopicLabel: "Production Playground",
  title: "Orion Playground",
  subtitle: "Experience the production coding agent in one complete editor.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Tool Use", "Self-Correction", "Reflection", "Human-in-the-Loop", "Multi-Agent"],
  intro:
    "This is the end-product view of Orion: a production coding agent with planning, code generation, execution, review, human approval, generated files, terminal logs, and graph tracing in one workspace.",
  takeaway:
    "The complete agent combines specialist nodes, tool execution, review loops, and checkpointed human approval so users can inspect and guide the system before changes are applied.",
  demos: [],
  codeContent: `from typing import Literal, TypedDict
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt


class AgentState(TypedDict):
    feature_request: str
    plan: str
    generated_code: list[dict]
    execution_result: str
    review_result: str
    status: str


def planner(state: AgentState) -> AgentState:
    """Create an implementation plan from the request and codebase context."""
    context = search_codebase(state["feature_request"])
    plan = planner_llm.invoke(
        f"Plan this feature using the codebase context.\\n\\n"
        f"Request: {state['feature_request']}\\n\\nContext:\\n{context}"
    )
    return {"plan": plan.content, "status": "planned"}


def coder(state: AgentState) -> AgentState:
    """Generate complete file changes from the plan."""
    result = coder_llm.invoke(
        f"Write the complete implementation for this plan.\\n\\n{state['plan']}"
    )
    return {"generated_code": result.files, "status": "coded"}


def executor(state: AgentState) -> AgentState:
    """Run generated code in a sandbox before review."""
    result = run_in_sandbox(state["generated_code"])
    return {
        "execution_result": result.output,
        "status": "executed" if result.passed else "execution_failed",
    }


def reviewer(state: AgentState) -> AgentState:
    """Review functionality, maintainability, and project fit."""
    review = reviewer_llm.invoke(
        f"Review these generated changes.\\n\\n"
        f"Plan:\\n{state['plan']}\\n\\n"
        f"Execution:\\n{state['execution_result']}\\n\\n"
        f"Files:\\n{state['generated_code']}"
    )
    return {
        "review_result": review.feedback,
        "status": "approved" if review.approved else "needs_revision",
    }


def human_gate(state: AgentState) -> Command[Literal["apply", "revise"]]:
    decision = interrupt({
        "plan": state["plan"],
        "generated_code": state["generated_code"],
        "review_result": state["review_result"],
    })
    return Command(goto="apply" if decision == "approve" else "revise")`,
  codeFilename: "production_agent.py",
  backendCode: `graph = StateGraph(AgentState)

graph.add_node("planner", planner)
graph.add_node("coder", coder)
graph.add_node("executor", executor)
graph.add_node("reviewer", reviewer)
graph.add_node("human_gate", human_gate)
graph.add_node("apply", apply_changes)

graph.add_edge(START, "planner")
graph.add_edge("planner", "coder")
graph.add_edge("coder", "executor")

graph.add_conditional_edges(
    "executor",
    lambda state: "reviewer" if state["status"] == "executed" else "coder",
    {"reviewer": "reviewer", "coder": "coder"},
)

graph.add_conditional_edges(
    "reviewer",
    lambda state: "human_gate" if state["status"] == "approved" else "coder",
    {"human_gate": "human_gate", "coder": "coder"},
)

graph.add_edge("human_gate", "apply")
graph.add_edge("apply", END)

agent = graph.compile(checkpointer=memory)`,
  backendFilename: "agent_graph.py",
  chatConfig: {
    mode: "multi-agent-pipeline",
    defaultPrompt: "Build a small FastAPI endpoint with request validation, logging, and tests.",
    graphVisualization: true,
    graphNodes: [
      { id: "planner", label: "Planner" },
      { id: "coder", label: "Coder" },
      { id: "executor", label: "Executor" },
      { id: "reviewer", label: "Reviewer" },
      { id: "human_gate", label: "Human Gate" },
      { id: "apply", label: "Apply" },
    ],
    graphEdges: [
      { from: "planner", to: "coder", label: "file tasks" },
      { from: "coder", to: "executor", label: "generated code" },
      { from: "executor", to: "reviewer", label: "tests passed" },
      { from: "executor", to: "coder", label: "fix failure", style: "dashed" },
      { from: "reviewer", to: "human_gate", label: "approved" },
      { from: "reviewer", to: "coder", label: "revise", style: "dashed" },
      { from: "human_gate", to: "apply", label: "approved" },
    ],
    conversations: {
      default: [
        {
          role: "tool",
          toolName: "planner",
          toolArgs: { feature: "FastAPI endpoint" },
          content: `Plan:
- Add a FastAPI app with a typed request model
- Validate name and priority fields before creating a task
- Log accepted tasks for operator visibility
- Return a stable JSON response that downstream clients can rely on`,
        },
        {
          role: "tool",
          toolName: "coder",
          toolArgs: { files: "api_server.py" },
          content: `Generated api_server.py with:
- TaskRequest Pydantic model
- /tasks POST endpoint
- structured logging
- deterministic task response`,
        },
        {
          role: "tool",
          toolName: "executor",
          toolArgs: { status: "SUCCESS" },
          content: `uvicorn import check passed
POST /tasks with valid payload returned 200
POST /tasks with missing name returned 422`,
        },
        {
          role: "tool",
          toolName: "reviewer",
          toolArgs: { approved: "true" },
          content: `Review approved. The endpoint is small, typed, testable, and uses framework-native validation instead of custom parsing.`,
        },
        {
          role: "tool",
          toolName: "human_gate",
          toolArgs: { status: "pending" },
          content: "Paused for human approval before applying the generated file to the workspace.",
        },
        {
          role: "assistant",
          content: `**Production agent run complete**

The planner, coder, executor, and reviewer all completed successfully. I generated \`api_server.py\`, validated it in the sandbox, and paused at the human gate so the final change can be reviewed before applying.`,
          renderAs: "markdown",
        },
      ],
    },
    generatedFile: {
      filename: "api_server.py",
      content: `import logging
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orion.api")

app = FastAPI(title="Orion Task API")


class TaskRequest(BaseModel):
    name: str = Field(min_length=1)
    priority: Literal["low", "medium", "high"] = "medium"


@app.post("/tasks")
def create_task(task: TaskRequest) -> dict[str, str]:
    logger.info("creating task: %s priority=%s", task.name, task.priority)
    return {
        "status": "queued",
        "name": task.name,
        "priority": task.priority,
    }
`,
    },
    terminalLogs: {
      default: [
        { tag: "PROCESS", text: "[agent] received feature request" },
        { tag: "TOOL", text: "search_codebase('FastAPI endpoint validation logging tests')" },
        { tag: "OK", text: "planner produced 1 implementation task" },
        { tag: "TOOL", text: "write generated/api_server.py" },
        { tag: "PROCESS", text: "sandbox: python -m compileall generated/api_server.py" },
        { tag: "OK", text: "sandbox checks passed" },
        { tag: "PROCESS", text: "reviewer evaluating generated file" },
        { tag: "SUCCESS", text: "approved; waiting at human gate" },
      ],
    },
    graphRunSteps: {
      default: [
        {
          node: "planner",
          title: "Plan feature",
          detail: "Found relevant app patterns and created one file task.",
          status: "success",
        },
        {
          node: "coder",
          title: "Generate code",
          detail: "Created api_server.py with typed validation and logging.",
          status: "success",
        },
        {
          node: "executor",
          title: "Run sandbox",
          detail: "Compile and endpoint validation checks passed.",
          status: "success",
        },
        {
          node: "reviewer",
          title: "Review changes",
          detail: "Approved maintainability, framework fit, and response shape.",
          status: "success",
        },
        {
          node: "human_gate",
          title: "Await approval",
          detail: "Paused before applying generated changes to the workspace.",
          status: "warning",
        },
      ],
    },
  },
};
