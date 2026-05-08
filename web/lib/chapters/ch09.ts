import type { ChapterDef } from "../schema";

export const ch09: ChapterDef = {
  slug: "self-correction",
  number: 9,
  notebook: "Notebook 02",
  subtopicLabel: "2.2 Self Correction",
  title: "Self Correction",
  subtitle: "Generate code, execute it, detect errors, and retry automatically.",
  cursorFeature: "Bugbot",
  designPatterns: ["Reflection", "Exception Handling"],
  intro: "The self-correcting loop is the heart of an autonomous coding agent: generate code → execute via subprocess → if it fails, feed the error back and retry. Bounded retries prevent infinite loops while giving the agent multiple chances to fix its mistakes.",
  takeaway: "A generate-execute-retry loop with bounded retries turns a one-shot code generator into a self-healing agent. The error message is the most valuable input — it tells the model exactly what to fix.",
  demos: [],
  backendCode: `from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict

class AgentState(TypedDict):
    task: str
    code: str
    explanation: str
    execution_result: str
    error: str
    attempts: int
    max_attempts: int
    status: str

def generate(state: AgentState) -> AgentState:
    """Generate code based on task (and previous error if retrying)."""
    prompt = f"Write Python code for: {state['task']}"
    if state.get("error"):
        prompt += f"\\n\\nPrevious attempt failed with error:\\n{state['error']}\\nFix the code."
    result = structured_llm.invoke(prompt)
    return {
        "code": result.code,
        "explanation": result.explanation,
        "attempts": state.get("attempts", 0) + 1,
        "status": "executing",
        "error": "",
    }

def execute(state: AgentState) -> AgentState:
    """Execute generated code and capture results."""
    result = execute_python(state["code"])
    if result["returncode"] == 0:
        return {"execution_result": result["stdout"], "error": "", "status": "success"}
    else:
        return {"execution_result": "", "error": result["stderr"], "status": "failed"}

def should_retry(state: AgentState) -> str:
    if state["status"] == "success":
        return "success"
    if state["attempts"] < state.get("max_attempts", 3):
        return "retry"
    return "give_up"

graph = StateGraph(AgentState)
graph.add_node("generate", generate)
graph.add_node("execute", execute)
graph.add_edge(START, "generate")
graph.add_edge("generate", "execute")
graph.add_conditional_edges("execute", should_retry, {
    "success": END, "retry": "generate", "give_up": END
})
bugbot = graph.compile()`,
  backendFilename: "self_correction_graph.py",
  chatConfig: {
    mode: "self-correction",
    graphVisualization: true,
    graphNodes: [
      { id: "__start__", label: "__start__" },
      { id: "generate", label: "generate" },
      { id: "execute", label: "execute" },
      { id: "__end__", label: "__end__" },
    ],
    graphEdges: [
      { from: "__start__", to: "generate" },
      { from: "generate", to: "execute" },
      { from: "execute", to: "generate", label: "retry", style: "dashed" },
      { from: "execute", to: "__end__", label: "give_up", style: "dashed" },
      { from: "execute", to: "__end__", label: "success" },
    ],
    animationSequence: ["__start__", "generate", "execute", "__end__"],
    graphRunSteps: {
      easy: [
        {
          node: "generate",
          title: "Attempt 1",
          detail: `Generated fibonacci.py
def fibonacci(n): ...`,
        },
        {
          node: "execute",
          title: "Success",
          detail: "stdout: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]",
          status: "success",
        },
        {
          node: "__end__",
          title: "Done",
          detail: "Task completed successfully in 1 attempt.",
          status: "success",
        },
      ],
      hard: [
        {
          node: "generate",
          title: "Attempt 1",
          detail: `from diffusers import StableDiffusionPipeline
import torch`,
        },
        {
          node: "execute",
          title: "Failed",
          detail: "ModuleNotFoundError: No module named 'diffusers'",
          status: "error",
        },
        {
          node: "generate",
          title: "Attempt 2",
          detail: "Regenerated with torch_dtype=torch.float16",
        },
        {
          node: "execute",
          title: "Failed",
          detail: "ModuleNotFoundError: No module named 'diffusers'",
          status: "error",
        },
        {
          node: "generate",
          title: "Attempt 3",
          detail: "Added install guidance, but the sandbox still cannot import diffusers",
        },
        {
          node: "execute",
          title: "Give up",
          detail: "Max attempts reached after repeated missing-package failures.",
          status: "warning",
        },
        {
          node: "__end__",
          title: "Stopped",
          detail: "The bounded retry loop ended without another chat-tool transcript.",
          status: "warning",
        },
      ],
    },
    tasks: [
      {
        id: "easy",
        label: "Easy Task",
        description: "Print first 10 Fibonacci numbers (succeeds first try)",
      },
      {
        id: "hard",
        label: "Hard Task",
        description: "Generate image with Stable Diffusion and watch retries fail on missing diffusers",
      },
    ],
    defaultPrompt: "Run the selected task through the self-correcting agent",
    terminalLogs: {
      easy: [
        { tag: "PROCESS", text: "[generate] Attempt 1" },
        { tag: "TOOL", text: "Generated fibonacci.py" },
        { tag: "PROCESS", text: "[execute] python -c fibonacci.py" },
        { tag: "OK", text: "[execute] SUCCESS: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]" },
        { tag: "SUCCESS", text: "Task completed successfully in 1 attempt" },
      ],
      hard: [
        { tag: "PROCESS", text: "[generate] Attempt 1" },
        { tag: "TOOL", text: "Generated StableDiffusionPipeline code" },
        { tag: "ERROR", text: "[execute] FAILED: ModuleNotFoundError: No module named 'diffusers'" },
        { tag: "RETRY", text: "[generate] Attempt 2 (feeding error back to the model)" },
        { tag: "TOOL", text: "Regenerated with torch_dtype=torch.float16" },
        { tag: "ERROR", text: "[execute] FAILED: ModuleNotFoundError: No module named 'diffusers'" },
        { tag: "RETRY", text: "[generate] Attempt 3 (last retry)" },
        { tag: "TOOL", text: "Added install guidance, but the sandbox still cannot import diffusers" },
        { tag: "ERROR", text: "[execute] FAILED: ModuleNotFoundError: No module named 'diffusers'" },
        { tag: "WARN", text: "Max attempts reached; retry loop stopped" },
      ],
    },
    conversations: {
      easy: [
        {
          role: "tool",
          toolName: "generate",
          toolArgs: { attempt: "1" },
          content: `def fibonacci(n):
    fib_sequence = []
    a, b = 0, 1
    for _ in range(n):
        fib_sequence.append(a)
        a, b = b, a + b
    return fib_sequence

print(fibonacci(10))`,
        },
        {
          role: "tool",
          toolName: "execute",
          toolArgs: { status: "SUCCESS" },
          content: `stdout: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
returncode: 0`,
        },
        {
          role: "assistant",
          content: `✓ Task completed successfully in 1 attempt

**Explanation:** Generates the first n Fibonacci numbers using an iterative approach with two variables tracking the sequence.

**Output:** [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
        },
      ],
      hard: [
        {
          role: "tool",
          toolName: "generate",
          toolArgs: { attempt: "1" },
          content: `from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4"
)
image = pipe("a cat").images[0]
image.save("cat.png")`,
        },
        {
          role: "tool",
          toolName: "execute",
          toolArgs: { status: "FAILED" },
          content: `Traceback (most recent call last):
  File "<string>", line 1, in <module>
ModuleNotFoundError: No module named 'diffusers'`,
        },
        {
          role: "tool",
          toolName: "generate",
          toolArgs: { attempt: "2" },
          content: `import torch
from diffusers import StableDiffusionPipeline

pipe = StableDiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4",
    torch_dtype=torch.float16
)
image = pipe("a cat").images[0]
image.save("cat.png")`,
        },
        {
          role: "tool",
          toolName: "execute",
          toolArgs: { status: "FAILED" },
          content: `Traceback (most recent call last):
  File "<string>", line 2, in <module>
ModuleNotFoundError: No module named 'diffusers'`,
        },
        {
          role: "tool",
          toolName: "generate",
          toolArgs: { attempt: "3" },
          content: `# Ensure diffusers is installed
# pip install diffusers transformers torch
from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4"
)
image = pipe("a cat").images[0]
image.save("cat.png")`,
        },
        {
          role: "tool",
          toolName: "execute",
          toolArgs: { status: "FAILED" },
          content: `Traceback (most recent call last):
  File "<string>", line 3, in <module>
ModuleNotFoundError: No module named 'diffusers'`,
        },
        {
          role: "assistant",
          content: `✗ Task failed after 3 attempts (max retries reached)

The agent cannot install missing packages in the sandbox environment. Each retry attempted to fix the import but the \`diffusers\` module is simply not available.

This demonstrates the bounded retry pattern — the agent gives up gracefully after max_attempts rather than looping forever.`,
        },
      ],
    },
    generatedFile: {
      filename: "fibonacci.py",
      content: `def fibonacci(n):
    fib_sequence = []
    a, b = 0, 1
    for _ in range(n):
        fib_sequence.append(a)
        a, b = b, a + b
    return fib_sequence

print(fibonacci(10))`,
    },
  },
};
