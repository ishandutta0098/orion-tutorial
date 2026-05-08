import type { ChapterDef } from "../schema";

export const ch14: ChapterDef = {
  slug: "orchestrator-state",
  number: 14,
  notebook: "Notebook 03",
  subtopicLabel: "3.2 Orchestrator State",
  title: "Planner & Orchestrator State",
  subtitle: "Design the state schema that tracks feature requests through the full agent lifecycle.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Planning"],
  intro: "A production agent needs more than messages — it needs structured state. The orchestrator state tracks the feature request, generated plan, code changes, review results, and human decisions. A structured planner uses with_structured_output to produce a typed Plan with FileTask entries.",
  takeaway: "Well-designed state is what separates a toy agent from a production system. Every field in your state schema represents a decision point the agent must handle, making the workflow explicit and debuggable.",
  demos: [],
  codeContent: `class OrchestratorState(TypedDict):
    feature_request: str
    codebase_context: str
    plan: str
    file_tasks: list[dict]
    generated_code: list[dict]
    review_result: str
    review_attempts: int
    human_decision: str
    test_output: str
    status: str`,
  codeFilename: "orchestrator_state.py",
  backendCode: `from pydantic import BaseModel, Field


class FileTask(BaseModel):
    filepath: str = Field(description="Path to file to create or modify")
    description: str = Field(description="What to do with this file")
    action: str = Field(description="'create' or 'modify'")


class Plan(BaseModel):
    summary: str = Field(description="One-line summary of the plan")
    file_tasks: list[FileTask] = Field(description="List of file-level tasks")


planner_llm = llm.with_structured_output(Plan)

plan = planner_llm.invoke(
    "You are a coding planner. Create a plan.\\n\\n"
    "Feature: Add a system prompt setting to the chatbot\\n"
    "Codebase: config.py has PAGE_TITLE, PAGE_ICON, MODEL, BASE_URL. "
    "chat.py has get_client(api_key) and stream_response(client, messages). "
    "app.py is the Streamlit UI with chat history and streaming."
)


def plan_node(state: OrchestratorState) -> OrchestratorState:
    context_docs = retriever.invoke(state["feature_request"])
    context = "\\n\\n".join(
        f"--- {d.metadata['filename']} ---\\n{d.page_content}" for d in context_docs
    )
    plan = planner_llm.invoke(
        f"You are a coding planner. Create a plan for this feature.\\n\\n"
        f"Feature: {state['feature_request']}\\n\\n"
        f"Codebase context:\\n{context}\\n\\n"
        f"Files in project: app.py (Streamlit UI), chat.py (LLM logic), config.py (settings)"
    )
    return {
        "codebase_context": context,
        "plan": plan.summary,
        "file_tasks": [ft.model_dump() for ft in plan.file_tasks],
        "status": "planned",
    }`,
  backendFilename: "planner.py",
  chatConfig: {
    mode: "planner",
    defaultPrompt: "Add a system prompt setting to the chatbot",
    conversations: {
      default: [
        {
          role: "tool",
          toolName: "search_codebase",
          toolArgs: { query: "system prompt chatbot config" },
          content: `--- config.py ---
PAGE_TITLE = "My ChatBot"
PAGE_ICON = "🤖"
MODEL = "openai/gpt-4o-mini"
BASE_URL = "https://openrouter.ai/api/v1"

--- chat.py ---
def stream_response(client, messages):
    response = client.chat.completions.create(model=MODEL, messages=messages, stream=True)

--- app.py ---
st.session_state.messages.append({"role": "user", "content": prompt})`,
        },
        {
          role: "tool",
          toolName: "planner",
          toolArgs: { feature: "Add a system prompt setting to the chatbot" },
          content: `{
  "summary": "Add SYSTEM_PROMPT to config.py, update chat.py to inject system prompt into messages, and modify app.py to use the system prompt in chat initialization",
  "file_tasks": [
    {
      "filepath": "config.py",
      "action": "modify",
      "description": "Add a SYSTEM_PROMPT constant with a default value for the chatbot's system instructions"
    },
    {
      "filepath": "chat.py",
      "action": "modify",
      "description": "Modify stream_response to accept an optional system_prompt parameter and inject it as the first message"
    },
    {
      "filepath": "app.py",
      "action": "modify",
      "description": "Import SYSTEM_PROMPT from config and pass it to stream_response when calling the function"
    }
  ]
}`,
        },
        {
          role: "assistant",
          content: `**Plan**: Add SYSTEM_PROMPT to config.py, update chat.py to inject system prompt into messages, and modify app.py to use the system prompt in chat initialization\n\n**File Tasks:**\n\n| # | Action | File | Description |\n|---|--------|------|-------------|\n| 1 | modify | config.py | Add SYSTEM_PROMPT constant with default value |\n| 2 | modify | chat.py | Add system_prompt parameter to stream_response |\n| 3 | modify | app.py | Import and pass SYSTEM_PROMPT to stream_response |\n\nThe planner searched the codebase first to understand the current structure, then produced a typed Plan with 3 FileTask entries.`,
        },
      ],
    },
  },
};
