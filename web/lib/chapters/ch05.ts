import type { ChapterDef } from "../schema";

export const ch05: ChapterDef = {
  slug: "system-prompt",
  number: 5,
  notebook: "Notebook 01",
  title: "System Prompt & Rules",
  subtitle: "Shape agent behavior with system prompts — the Cursor Rules equivalent.",
  cursorFeature: "Cursor Rules",
  designPatterns: ["Prompt Chaining"],
  intro: "A system prompt sets the agent's persona, constraints, and coding style. This is the LangGraph equivalent of Cursor Rules (.cursorrules) — persistent instructions that guide every response. You'll learn how prompt engineering directly controls output quality, safety, and consistency.",
  takeaway: "The system prompt is your most powerful lever. A well-crafted set of rules transforms a generic LLM into a specialized coding assistant that follows your project's conventions.",
  codeFilename: "data_processor.py",
  codeContent: `# generated/data_processor.py
# Generated with system prompt enforcing type hints + docstrings

from typing import Any, Callable


class DataProcessor:
    """Process and analyze collections of data records."""

    def __init__(self, data: list[dict[str, Any]]) -> None:
        self.data = data

    def filter_by(self, key: str, value: Any) -> "DataProcessor":
        """Filter records where key matches value.

        Args:
            key: The field name to filter on.
            value: The value to match.

        Returns:
            A new DataProcessor with filtered data.
        """
        filtered = [r for r in self.data if r.get(key) == value]
        return DataProcessor(filtered)

    def group_by(self, key: str) -> dict[str, list[dict[str, Any]]]:
        """Group records by a given key.

        Args:
            key: The field name to group on.

        Returns:
            Dictionary mapping key values to lists of records.
        """
        groups: dict[str, list[dict[str, Any]]] = {}
        for record in self.data:
            k = str(record.get(key, "unknown"))
            groups.setdefault(k, []).append(record)
        return groups

    def summarize(self, key: str, func: Callable = len) -> dict[str, Any]:
        """Summarize data by applying a function to groups.

        Args:
            key: The field to group by.
            func: Aggregation function (default: count).

        Returns:
            Dictionary of group -> aggregated value.
        """
        groups = self.group_by(key)
        return {k: func(v) for k, v in groups.items()}`,
  backendFilename: "system_prompt.py",
  backendCode: `from langchain_core.messages import SystemMessage, HumanMessage

SYSTEM_PROMPT = """You are an expert Python developer.
When generating code:
- Use type hints on all function parameters and returns
- Add concise Google-style docstrings
- Follow PEP 8 naming conventions
- Use modern Python 3.10+ features (match, |, etc.)
- Handle edge cases with clear error messages
"""

result = app.invoke({
    "messages": [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content="Create 'generated/data_processor.py' with a "
            "DataProcessor class with filter_by, group_by, "
            "and summarize methods."
        ),
    ]
})

# Print the final AI summary
for msg in result["messages"]:
    if msg.type == "ai" and not msg.tool_calls:
        print(msg.content)`,
  aiExchange: {
    userMessage: "Add system prompt rules for Python best practices.",
    aiLabel: "APPLYING RULES",
    aiDescription: "System prompt enforces type hints, docstrings, PEP 8, and modern Python features on all generated code...",
    aiCodeSnippet: `SYSTEM_PROMPT = """You are an expert Python developer.
- Use type hints on all functions
- Add concise docstrings
- Follow PEP 8 conventions
- Prefer modern Python (3.10+)"""`,
  },
  demos: [
    {
      id: "system-prompt-effect",
      question: "How does a system prompt change the quality of generated code?",
      controlLabel: "Mode",
      defaultLeft: "no_prompt",
      defaultRight: "with_prompt",
      options: [
        { key: "no_prompt", label: "No System Prompt", description: "Raw LLM output without coding rules." },
        { key: "with_prompt", label: "With System Prompt", description: "LLM guided by Python best-practice rules." },
      ],
      variants: {
        no_prompt: {
          label: "No System Prompt",
          description: "Generic output — no type hints, no docstrings",
          log: [
            { tag: "BOOT", text: "Agent invoked WITHOUT system prompt..." },
            { tag: "INFO", text: "Task: Create a DataProcessor class" },
            { tag: "PROCESS", text: "→ agent node: LLM generating code (no constraints)" },
            { tag: "TOOL", text: "LLM calls write_file(...)" },
            { tag: "OK", text: "File written: generated/data_processor.py" },
            { tag: "WARN", text: "No type hints detected in output" },
            { tag: "WARN", text: "No docstrings detected in output" },
            { tag: "SUCCESS", text: "Generation complete (unguided)." },
          ],
          output: "",
          codeFile: {
            filename: "generated/data_processor.py",
            language: "python",
            content: `class DataProcessor:
    def __init__(self, data):
        self.data = data

    def filter_by(self, key, value):
        return [item for item in self.data if item.get(key) == value]

    def group_by(self, key):
        grouped = {}
        for item in self.data:
            group_key = item.get(key)
            if group_key not in grouped:
                grouped[group_key] = []
            grouped[group_key].append(item)
        return grouped

    def summarize(self):
        count = len(self.data)
        keys_present = list({key for item in self.data for key in item.keys()})
        sample_row = self.data[0] if self.data else {}
        return count, keys_present, sample_row`,
          },
        },
        with_prompt: {
          label: "With System Prompt",
          description: "Guided output — type hints, docstrings, PEP 8",
          log: [
            { tag: "BOOT", text: "Agent invoked WITH system prompt..." },
            { tag: "INFO", text: "System: 'Use type hints, add docstrings, follow PEP 8, prefer Python 3.10+'" },
            { tag: "INFO", text: "Task: Create a DataProcessor class" },
            { tag: "PROCESS", text: "→ agent node: LLM generating code (constrained by rules)" },
            { tag: "TOOL", text: "LLM calls write_file(...)" },
            { tag: "OK", text: "File written: generated/data_processor.py" },
            { tag: "SUCCESS", text: "Generation complete (guided by system prompt)." },
          ],
          output: "",
          paramSnippet: `SYSTEM_PROMPT = """You are an expert Python developer.
When generating code:
- Use type hints on all functions
- Add concise docstrings
- Follow PEP 8 conventions
- Prefer modern Python (3.10+) features"""`,
          codeFile: {
            filename: "generated/data_processor.py",
            language: "python",
            content: `from typing import Any


class DataProcessor:
    """Process and analyze a list of dictionaries."""

    def __init__(self, data: list[dict[str, Any]]) -> None:
        """Initialize with a list of dictionaries."""
        self.data = data

    def filter_by(self, key: str, value: Any) -> list[dict[str, Any]]:
        """Return items where key matches value."""
        return [item for item in self.data if item.get(key) == value]

    def group_by(self, key: str) -> dict[Any, list[dict[str, Any]]]:
        """Group items by the specified key."""
        grouped: dict[Any, list[dict[str, Any]]] = {}
        for item in self.data:
            group_key = item.get(key)
            grouped.setdefault(group_key, []).append(item)
        return grouped

    def summarize(self) -> tuple[int, list[str], dict[str, Any]]:
        """Return (count, keys_present, sample_row)."""
        count = len(self.data)
        keys_present = sorted({key for item in self.data for key in item})
        sample_row = self.data[0] if self.data else {}
        return count, keys_present, sample_row`,
          },
        },
      },
    },
  ],
};
