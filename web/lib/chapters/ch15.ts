import type { ChapterDef } from "../schema";

export const ch15: ChapterDef = {
  slug: "multi-agent",
  number: 15,
  notebook: "Notebook 03",
  subtopicLabel: "3.3 Multi-Agent",
  title: "Multi-Agent: Planner, Coder, Reviewer",
  subtitle: "Specialist agents collaborating through shared state.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Multi-Agent", "Routing"],
  intro: "Instead of one monolithic agent, split responsibilities across specialists: the Planner analyzes requirements and creates a plan, the Coder implements each file task, and the Reviewer evaluates quality. They communicate through shared state, with the graph routing between them based on the current stage.",
  takeaway: "Multi-agent architecture improves quality through specialization. Each agent has a focused system prompt and toolset, leading to better results than a single agent trying to do everything.",
  demos: [],
  backendCode: `def plan_node(state: OrchestratorState) -> OrchestratorState:
    context_docs = retriever.invoke(state["feature_request"])
    context = "\\n\\n".join(
        f"--- {d.metadata['filename']} ---\\n{d.page_content}" for d in context_docs
    )
    plan = planner_llm.invoke(
        f"You are a coding planner. Create a plan for this feature.\\n\\n"
        f"Feature: {state['feature_request']}\\n\\n"
        f"Codebase context:\\n{context}"
    )
    return {
        "codebase_context": context,
        "plan": plan.summary,
        "file_tasks": [ft.model_dump() for ft in plan.file_tasks],
        "status": "planned",
    }


def code_node(state: OrchestratorState) -> OrchestratorState:
    results = []
    for task in state["file_tasks"]:
        existing = ""
        if task["action"] == "modify":
            try:
                existing = Path(task["filepath"]).read_text()
            except FileNotFoundError:
                pass
        result = coder_llm.invoke(
            f"Generate the complete file content.\\n\\n"
            f"Task: {task['description']}\\n"
            f"File: {task['filepath']}\\n"
            f"Existing code:\\n{existing}"
        )
        results.append({
            "filepath": task["filepath"],
            "code": result.code,
            "explanation": result.explanation,
        })
    return {"generated_code": results, "status": "coded"}


def review_node(state: OrchestratorState) -> OrchestratorState:
    code_summary = "\\n\\n".join(
        f"--- {item['filepath']} ---\\n{item['code']}" for item in state["generated_code"]
    )
    feedback = reviewer_llm.invoke(
        f"Review this code for quality and correctness.\\n\\n{code_summary}"
    )
    if feedback.approved:
        return {"review_result": feedback.feedback, "status": "approved"}
    return {"review_result": feedback.feedback, "status": "needs_revision"}


graph = StateGraph(OrchestratorState)
graph.add_node("plan", plan_node)
graph.add_node("code", code_node)
graph.add_node("review", review_node)
graph.add_edge(START, "plan")
graph.add_edge("plan", "code")
graph.add_edge("code", "review")
graph.add_conditional_edges("review", route_after_review)`,
  backendFilename: "multi_agent_pipeline.py",
  chatConfig: {
    mode: "multi-agent-pipeline",
    defaultPrompt: "Add a system prompt feature to the chatbot",
    conversations: {
      default: [
        {
          role: "tool",
          toolName: "plan",
          toolArgs: { feature: "Add a system prompt feature" },
          content: `Plan: Add system prompt feature with default config, modify chat logic to accept system prompt parameter, and add sidebar UI for editing system prompt

File Tasks:
  [modify] sample_project/config.py
  [modify] sample_project/chat.py
  [modify] sample_project/app.py`,
        },
        {
          role: "tool",
          toolName: "code",
          toolArgs: { files: "3 file tasks" },
          content: `Generated: sample_project/config.py (244 chars)
Generated: sample_project/chat.py (546 chars)
Generated: sample_project/app.py (1385 chars)`,
        },
        {
          role: "tool",
          toolName: "review",
          toolArgs: { attempt: "1/2" },
          content: `Review [1/2]: APPROVED — Code is functional and well-structured. The implementation correctly handles OpenRouter API configuration, system prompt injection, and streaming responses.`,
        },
        {
          role: "assistant",
          content: `**Pipeline Complete** ✓\n\nThe 3-agent pipeline executed successfully:\n\n1. **Planner** → Searched codebase, produced plan with 3 file tasks\n2. **Coder** → Generated complete code for all 3 files\n3. **Reviewer** → APPROVED on first attempt\n\nThe agent is now paused at the human review gate, waiting for your decision to apply or reject the changes.`,
        },
      ],
    },
    generatedFile: {
      filename: "app.py",
      content: `import streamlit as st
from chat import get_client, stream_response
from config import PAGE_ICON, PAGE_TITLE, DEFAULT_SYSTEM_PROMPT

st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON)
st.title(f"{PAGE_ICON} {PAGE_TITLE}")

api_key = st.sidebar.text_input("OpenRouter API Key", type="password")
if not api_key:
    st.warning("Enter your OpenRouter API key to start.")
    st.stop()

if "system_prompt" not in st.session_state:
    st.session_state.system_prompt = DEFAULT_SYSTEM_PROMPT

st.session_state.system_prompt = st.sidebar.text_area(
    "System Prompt",
    value=st.session_state.system_prompt,
    height=150,
    help="Edit the system prompt to customize the assistant's behavior"
)

client = get_client(api_key)

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Ask me anything..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        response_text = st.write_stream(
            stream_response(client, st.session_state.messages, st.session_state.system_prompt)
        )

    st.session_state.messages.append({"role": "assistant", "content": response_text})
`,
    },
  },
};
