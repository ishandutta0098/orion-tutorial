import type { ChapterDef } from "../schema";

export const ch17: ChapterDef = {
  slug: "parallel-generation",
  number: 17,
  notebook: "Notebook 03",
  subtopicLabel: "3.5 Parallel Generation",
  title: "Parallel Code Generation",
  subtitle: "Fan out to per-file coders with the Send API for concurrent generation.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Parallelization"],
  intro: "When a plan has multiple independent file tasks, generating them sequentially wastes time. The Send API fans out to parallel coder subgraphs — one per file — then merges results back with custom reducers. This is how production agents achieve speed on multi-file changes.",
  takeaway: "The Send API turns sequential bottlenecks into parallel pipelines. Combined with reducers for merging results, you can scale code generation linearly with the number of files in a plan.",
  demos: [],
  backendCode: `from typing import Annotated
from langgraph.types import Send


def add_to_list(existing: list, new: list) -> list:
    """Reducer that merges parallel results into a single list."""
    return existing + new


class ParallelState(TypedDict):
    feature_request: str
    codebase_context: str
    file_tasks: list[dict]
    generated_code: Annotated[list[dict], add_to_list]


def fan_out_to_coders(state: ParallelState) -> list[Send]:
    """Dynamically create one Send per file task."""
    sends = [
        Send("parallel_code", {"task": task, "codebase_context": state["codebase_context"]})
        for task in state["file_tasks"]
    ]
    print(f"  Fanning out to {len(sends)} parallel coders")
    return sends


def parallel_code_node(state: dict) -> dict:
    """Each parallel coder generates one file."""
    task = state["task"]
    result = coder_llm.invoke(
        f"Generate the complete file.\\nTask: {task['description']}\\nFile: {task['filepath']}"
    )
    print(f"  [parallel] Done: {Path(task['filepath']).name}")
    return {"generated_code": [{"filepath": task["filepath"], "code": result.code, "explanation": result.explanation}]}


def collect_node(state: ParallelState) -> ParallelState:
    """Merge point — all parallel results are already collected via the reducer."""
    print(f"  Collected {len(state['generated_code'])} files from parallel coders")
    return state


parallel_graph = StateGraph(ParallelState)
parallel_graph.add_node("plan", parallel_plan)
parallel_graph.add_node("parallel_code", parallel_code_node)
parallel_graph.add_node("collect", collect_node)
parallel_graph.add_edge(START, "plan")
parallel_graph.add_conditional_edges("plan", fan_out_to_coders)
parallel_graph.add_edge("parallel_code", "collect")
parallel_graph.add_edge("collect", END)`,
  backendFilename: "parallel_gen.py",
  chatConfig: {
    mode: "parallel-gen",
    defaultPrompt: "Add export button + model selector to the chatbot",
    conversations: {
      default: [
        {
          role: "tool",
          toolName: "plan",
          toolArgs: { feature: "Add export button + model selector" },
          content: `Plan: Add conversation export button and model selector dropdown to sidebar, update config.py with available models list, modify chat.py to accept model parameter, and update app.py UI

File Tasks:
  [modify] config.py
  [modify] chat.py
  [modify] app.py`,
        },
        {
          role: "tool",
          toolName: "fan_out",
          toolArgs: { parallel_coders: "3" },
          content: `Fanning out to 3 parallel coders...`,
        },
        {
          role: "tool",
          toolName: "parallel_code",
          toolArgs: { file: "chat.py" },
          content: `[parallel] Done: chat.py — Added model parameter to stream_response`,
        },
        {
          role: "tool",
          toolName: "parallel_code",
          toolArgs: { file: "app.py" },
          content: `[parallel] Done: app.py — Added model selector dropdown and export button UI`,
        },
        {
          role: "tool",
          toolName: "parallel_code",
          toolArgs: { file: "config.py" },
          content: `[parallel] Done: config.py — Added AVAILABLE_MODELS list`,
        },
        {
          role: "tool",
          toolName: "collect",
          toolArgs: { files: "3" },
          content: `Collected 3 files from parallel coders\n\n--- config.py ---\nAdded AVAILABLE_MODELS list with 3 model options\nCode: 216 chars\n\n--- chat.py ---\nAdded model parameter to stream_response function\nCode: 594 chars\n\n--- app.py ---\nAdded model selector dropdown and export conversation button\nCode: 1901 chars`,
        },
        {
          role: "assistant",
          content: `**Parallel Generation Complete** ⚡\n\n3 files generated concurrently using the Send API:\n\n| File | Change | Size |\n|------|--------|------|\n| config.py | Added AVAILABLE_MODELS list | 216 chars |\n| chat.py | Added model parameter to stream_response | 594 chars |\n| app.py | Added model selector + export button UI | 1901 chars |\n\nAll 3 coders ran in parallel and results were merged via the \`add_to_list\` reducer. Sequential generation would have taken 3x longer.`,
        },
      ],
    },
    generatedFile: {
      filename: "config.py",
      content: `PAGE_TITLE = "My ChatBot"
PAGE_ICON = "🤖"
MODEL = "openai/gpt-4o-mini"
BASE_URL = "https://openrouter.ai/api/v1"
AVAILABLE_MODELS = [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "anthropic/claude-3.5-sonnet"
]
`,
    },
  },
};
