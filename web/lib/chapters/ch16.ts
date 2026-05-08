import type { ChapterDef } from "../schema";

export const ch16: ChapterDef = {
  slug: "human-in-the-loop",
  number: 16,
  notebook: "Notebook 03",
  subtopicLabel: "3.4 Human-in-the-Loop",
  title: "Human-in-the-Loop",
  subtitle: "Pause for approval before applying changes with interrupt and Command.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Human-in-the-Loop"],
  intro: "Autonomous doesn't mean uncontrolled. The interrupt primitive pauses the graph, presenting generated changes for human review. The user can approve, reject, or edit — then resume execution with Command. MemorySaver checkpoints state so nothing is lost during the pause.",
  takeaway: "interrupt + Command + MemorySaver is the trifecta for safe autonomous agents. The agent proposes, the human disposes, and checkpointed state ensures you can always resume exactly where you left off.",
  demos: [],
  backendCode: `from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import MemorySaver


def human_review_node(state: OrchestratorState) -> OrchestratorState:
    changes = f"Plan: {state['plan']}\\n\\nProposed changes:\\n"
    for item in state["generated_code"]:
        changes += f"\\n--- {item['filepath']} ---\\n{item['explanation']}\\n"
        preview = item["code"][:500]
        changes += f"\`\`\`python\\n{preview}{'...' if len(item['code']) > 500 else ''}\\n\`\`\`\\n"

    # interrupt() stops the graph here — returns changes to the caller
    decision = interrupt(changes)

    # This line only runs AFTER the caller resumes with Command(resume=...)
    return {"human_decision": decision, "status": "human_reviewed"}


def apply_changes_node(state: OrchestratorState) -> OrchestratorState:
    for item in state["generated_code"]:
        path = Path(item["filepath"])
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(item["code"])
        print(f"  Applied: {item['filepath']}")
    return {"status": "applied"}


def run_tests_node(state: OrchestratorState) -> OrchestratorState:
    result = subprocess.run(
        ["python3", "-c", "import sample_project.config; import sample_project.chat; import sample_project.app"],
        capture_output=True, text=True, timeout=10,
    )
    output = "All imports OK" if result.returncode == 0 else f"FAIL: {result.stderr}"
    return {"test_output": output, "status": "tested"}


def route_after_human(state: OrchestratorState) -> str:
    if state.get("human_decision") == "approve":
        return "apply"
    return "code"  # reject → regenerate


memory = MemorySaver()
agent = graph.compile(checkpointer=memory)

# Invoke pauses at human_review_node:
result = agent.invoke({"feature_request": "..."}, config=config)

# Resume with human decision:
result = agent.invoke(Command(resume="approve"), config=config)`,
  backendFilename: "human_in_the_loop.py",
  chatConfig: {
    mode: "human-in-the-loop",
    defaultPrompt: "Add a system prompt feature to the chatbot",
    conversations: {
      approve: [
        {
          role: "tool",
          toolName: "plan",
          toolArgs: { feature: "Add a system prompt feature" },
          content: `Plan: Add system prompt feature with default config, modify chat logic, and add sidebar UI

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
          content: `Review [1/2]: APPROVED — Code is functional and well-structured.`,
        },
        {
          role: "system",
          content: `⏸️ AGENT PAUSED — Waiting for human review\n\nPlan: Add system prompt feature with default config, modify chat logic, and add sidebar UI\nReview attempts: 1\nFiles: 3\n  sample_project/config.py: Added DEFAULT_SYSTEM_PROMPT variable\n  sample_project/chat.py: Added optional system_prompt parameter\n  sample_project/app.py: Added system prompt editing sidebar`,
        },
        {
          role: "tool",
          toolName: "human_decision",
          toolArgs: { decision: "approve" },
          content: `Command(resume="approve") → Resuming agent...`,
        },
        {
          role: "tool",
          toolName: "apply",
          toolArgs: { files: "3" },
          content: `Applied: sample_project/config.py
Applied: sample_project/chat.py
Applied: sample_project/app.py`,
        },
        {
          role: "tool",
          toolName: "test",
          toolArgs: { command: "import check" },
          content: `Tests: PASS\nAll imports OK`,
        },
        {
          role: "assistant",
          content: `**Approved & Applied** ✓\n\nHuman decision: **approve**\n\nThe agent applied all 3 files and ran smoke tests:\n- ✓ sample_project/config.py\n- ✓ sample_project/chat.py\n- ✓ sample_project/app.py\n\nTest output: All imports OK\n\nFinal status: **tested**`,
        },
      ],
      reject: [
        {
          role: "tool",
          toolName: "plan",
          toolArgs: { feature: "Add a system prompt feature" },
          content: `Plan: Add system prompt feature with default config, modify chat logic, and add sidebar UI

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
          content: `Review [1/2]: APPROVED — Code is functional and well-structured.`,
        },
        {
          role: "system",
          content: `⏸️ AGENT PAUSED — Waiting for human review\n\nPlan: Add system prompt feature with default config, modify chat logic, and add sidebar UI\nReview attempts: 1\nFiles: 3\n  sample_project/config.py: Added DEFAULT_SYSTEM_PROMPT variable\n  sample_project/chat.py: Added optional system_prompt parameter\n  sample_project/app.py: Added system prompt editing sidebar`,
        },
        {
          role: "tool",
          toolName: "human_decision",
          toolArgs: { decision: "reject" },
          content: `Command(resume="reject") → Routing back to coder...`,
        },
        {
          role: "tool",
          toolName: "code",
          toolArgs: { files: "3 file tasks (regenerating)" },
          content: `Regenerated: sample_project/config.py (268 chars)
Regenerated: sample_project/chat.py (612 chars)
Regenerated: sample_project/app.py (1520 chars)`,
        },
        {
          role: "tool",
          toolName: "review",
          toolArgs: { attempt: "2/2" },
          content: `Review [2/2]: APPROVED — Improved implementation with better error handling and documentation.`,
        },
        {
          role: "assistant",
          content: `**Rejected → Regenerated** ↻\n\nHuman decision: **reject**\n\nThe agent looped back to the coder node and regenerated all 3 files with improvements:\n- config.py: 244 → 268 chars (added docstring)\n- chat.py: 546 → 612 chars (better error handling)\n- app.py: 1385 → 1520 chars (improved UI)\n\nReviewer approved on second attempt. Agent is paused again at human review gate.`,
        },
      ],
    },
    generatedFile: {
      filename: "config.py",
      content: `PAGE_TITLE = "My ChatBot"
PAGE_ICON = "🤖"
MODEL = "openai/gpt-4o-mini"
BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant. Please provide clear, accurate, and helpful responses to user questions."
`,
    },
  },
};
