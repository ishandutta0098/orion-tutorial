import type { ChapterDef } from "../schema";

export const ch05: ChapterDef = {
  slug: "system-prompt",
  number: 5,
  notebook: "Notebook 01",
  subtopicLabel: "1.5 System Prompt",
  title: "System Prompt & Rules",
  subtitle: "Shape agent behavior with system prompts — the Cursor Rules equivalent.",
  cursorFeature: "Cursor Rules",
  designPatterns: ["Prompt Chaining"],
  intro: "A system prompt sets the agent's persona, constraints, and coding style. This is the LangGraph equivalent of Cursor Rules (.cursorrules) — persistent instructions that guide every response. You'll learn how prompt engineering directly controls output quality, safety, and consistency.",
  takeaway: "The system prompt is your most powerful lever. A well-crafted set of rules transforms a generic LLM into a specialized coding assistant that follows your project's conventions.",
  codeFilename: "data_processor.py",
  codeContent: "",
  backendFilename: "system_prompt.py",
  backendCode: `from langchain_core.messages import SystemMessage, HumanMessage

SYSTEM_PROMPT = """You are an expert Python developer assistant. When generating code:
- Use type hints on all functions
- Add concise docstrings
- Follow PEP 8 conventions
- Prefer modern Python (3.10+) features like match/case where appropriate

You have access to file tools. Always write generated code to files."""

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

for msg in result["messages"]:
    if msg.type == "ai" and not msg.tool_calls:
        print(msg.content)`,
  chatConfig: {
    mode: "system-prompt",
    systemPrompts: [
      {
        id: "basic",
        label: "Basic",
        prompt: "You are a helpful assistant. Write code when asked.",
      },
      {
        id: "expert",
        label: "Expert",
        prompt: `You are an expert Python developer assistant. When generating code:
- Use type hints on all functions
- Add concise docstrings
- Follow PEP 8 conventions
- Prefer modern Python (3.10+) features like match/case where appropriate

You have access to file tools. Always write generated code to files.`,
      },
    ],
    defaultPrompt: "Create a DataProcessor class with filter_by, group_by, and summarize methods.",
    conversations: {
      basic: [
        {
          role: "tool",
          content: "File written: generated/data_processor.py",
          toolName: "write_file",
          toolArgs: { filepath: "generated/data_processor.py" },
        },
        {
          role: "assistant",
          content: "Here's the DataProcessor class:\n\n```python\nclass DataProcessor:\n    def __init__(self, data):\n        self.data = data\n\n    def filter_by(self, key, value):\n        return [x for x in self.data if x.get(key) == value]\n\n    def group_by(self, key):\n        groups = {}\n        for item in self.data:\n            k = item.get(key)\n            groups.setdefault(k, []).append(item)\n        return groups\n\n    def summarize(self):\n        return len(self.data), list(self.data[0].keys()), self.data[0]\n```\n\nNote: No type hints, no docstrings, basic implementation.",
        },
      ],
      expert: [
        {
          role: "tool",
          content: "File written: generated/data_processor.py",
          toolName: "write_file",
          toolArgs: { filepath: "generated/data_processor.py" },
        },
        {
          role: "assistant",
          content: "Here's the DataProcessor class with full typing and documentation:\n\n```python\nfrom typing import List, Dict, Any, Tuple\n\nclass DataProcessor:\n    \"\"\"Process and analyze collections of data records.\"\"\"\n\n    def __init__(self, data: List[Dict[str, Any]]) -> None:\n        \"\"\"Initialize with a list of dictionaries.\"\"\"\n        self.data = data\n\n    def filter_by(self, key: str, value: Any) -> List[Dict[str, Any]]:\n        \"\"\"Return records where key matches value.\"\"\"\n        return [item for item in self.data if item.get(key) == value]\n\n    def group_by(self, key: str) -> Dict[Any, List[Dict[str, Any]]]:\n        \"\"\"Group records by the specified key.\"\"\"\n        grouped: Dict[Any, List[Dict[str, Any]]] = {}\n        for item in self.data:\n            group_key = item.get(key)\n            grouped.setdefault(group_key, []).append(item)\n        return grouped\n\n    def summarize(self) -> Tuple[int, List[str], Dict[str, Any]]:\n        \"\"\"Return count, keys present, and a sample row.\"\"\"\n        count = len(self.data)\n        keys = list({k for item in self.data for k in item.keys()})\n        sample = self.data[0] if self.data else {}\n        return count, keys, sample\n```\n\nNote the difference: full type hints, docstrings, PEP 8, modern Python conventions.",
        },
      ],
      default: [
        { role: "assistant", content: "Select a system prompt above and send to see the difference in output quality." },
      ],
    },
  },
  demos: [],
};
