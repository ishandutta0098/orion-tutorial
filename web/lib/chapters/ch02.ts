import type { ChapterDef } from "../schema";

export const ch02: ChapterDef = {
  slug: "defining-tools",
  number: 2,
  notebook: "Notebook 01",
  title: "Defining Tools",
  subtitle: "Give your agent capabilities with @tool decorator, docstrings, and type hints.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Tool Use"],
  intro: "Tools are how an LLM interacts with the outside world. Using LangChain's @tool decorator, you define Python functions with type hints and docstrings — the framework auto-generates a JSON schema so the model knows when and how to call each tool.",
  takeaway: "Well-typed, well-documented tool functions let the LLM self-select the right tool at the right time. The @tool decorator bridges natural language intent to executable code.",
  backendFilename: "defining_tools.py",
  backendCode: `from langchain_core.tools import tool


@tool
def read_file(filepath: str) -> str:
    """Read the contents of a file and return it as a string."""
    with open(filepath, "r") as f:
        return f.read()


@tool
def write_file(filepath: str, content: str) -> str:
    """Write content to a file. Creates the file if it doesn't exist."""
    os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
    with open(filepath, "w") as f:
        f.write(content)
    return f"File written: {filepath}"


@tool
def list_directory(directory: str) -> str:
    """List all files and directories in the given path."""
    entries = os.listdir(directory)
    return "\\n".join(entries)


tools = [read_file, write_file, list_directory]

for t in tools:
    print(f"{t.name}: {t.description}")
    print(f"  Schema: {t.args_schema.model_json_schema()}\\n")`,
  chatConfig: {
    mode: "tool-toggles",
    tools: [
      { id: "read_file", name: "read_file", enabled: false },
      { id: "write_file", name: "write_file", enabled: false },
      { id: "list_directory", name: "list_directory", enabled: true },
    ],
    defaultPrompt: "What files are in the current directory?",
    conversations: {
      enabled: [
        {
          role: "tool",
          content: "notebook_01/\n  setting_up_llm.py\n  defining_tools.py\n  agent_graph.py\n  code_generation.py\n  system_prompt.py\n  streaming.py\n  multi_turn.py\nnotebook_02/\n  error_detection.py\n  sandbox_execution.py\n  self_correction_loop.py\n  retry_strategies.py\n  validation.py\nnotebook_03/\n  production_config.py\n  logging_monitoring.py\n  rate_limiting.py\n  deployment.py",
          toolName: "list_directory",
          toolArgs: { directory: "." },
        },
        {
          role: "assistant",
          content: "The current directory contains 3 notebook folders:\n\n**notebook_01/** — Code Generator with Tools\n- setting_up_llm.py\n- defining_tools.py\n- agent_graph.py\n- code_generation.py\n- system_prompt.py\n- streaming.py\n- multi_turn.py\n\n**notebook_02/** — Self-Correcting Agent\n- error_detection.py\n- sandbox_execution.py\n- self_correction_loop.py\n- retry_strategies.py\n- validation.py\n\n**notebook_03/** — Production Agent\n- production_config.py\n- logging_monitoring.py\n- rate_limiting.py\n- deployment.py",
        },
      ],
      disabled: [
        {
          role: "assistant",
          content: "I don't have the tools available to list directory contents. Please enable the list_directory tool to perform this operation.",
        },
      ],
    },
  },
  demos: [],
};
