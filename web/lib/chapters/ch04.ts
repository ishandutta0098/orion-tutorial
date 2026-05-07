import type { ChapterDef } from "../schema";

export const ch04: ChapterDef = {
  slug: "code-generation",
  number: 4,
  notebook: "Notebook 01",
  title: "Code Generation Task",
  subtitle: "Have the agent generate code and write it to files using tool calls.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Tool Use"],
  intro: "Now that the agent has tools and a graph, it's time for the first real task: generating Python code from a natural language description and writing it to disk. The agent decides which file operations to use, generates the code, and persists the result — all through the tool-calling loop.",
  takeaway: "Code generation is just tool use with a purpose. The agent generates content via the LLM and persists it via write_file — the same pattern scales to any generative task.",
  codeFilename: "code_generation.py",
  codeContent: `from langchain_core.messages import HumanMessage

# Task: Generate a Python file via the agent
result = app.invoke({
    "messages": [
        HumanMessage(
            content="""Create a Python file 'generated/calculator.py' with:
- A Calculator class
- Methods: add, subtract, multiply, divide
- Each method should record operations in a history list
- A get_history() method to retrieve past operations"""
        )
    ]
})

# Print what happened
for msg in result["messages"]:
    print(f"{msg.type}: {msg.content[:100] if msg.content else ''}")
    if hasattr(msg, "tool_calls") and msg.tool_calls:
        for tc in msg.tool_calls:
            print(f"  -> {tc['name']}({list(tc['args'].keys())})")

# Verify the generated file
print("\\n--- Generated File ---")
print(open("generated/calculator.py").read())`,
  aiExchange: {
    userMessage: "Create a Calculator class with math methods and history tracking.",
    aiLabel: "GENERATING CODE",
    aiDescription: "Writing generated/calculator.py with Calculator class including add, subtract, multiply, divide methods...",
    aiCodeSnippet: `class Calculator:
    def __init__(self):
        self.history = []

    def add(self, a, b):
        result = a + b
        self.history.append(f"Added {a} + {b}")
        return result`,
  },
  demos: [
    {
      id: "code-gen-task",
      question: "How does the agent generate and persist code to a file?",
      controlLabel: "Task",
      defaultLeft: "calculator",
      defaultRight: "data_processor",
      options: [
        { key: "calculator", label: "Calculator Class", description: "Generate a Calculator with math methods + history." },
        { key: "data_processor", label: "DataProcessor Class", description: "Generate a DataProcessor with filter/group/summarize." },
      ],
      variants: {
        calculator: {
          label: "Calculator Class",
          description: "Agent generates calculator.py via write_file",
          log: [
            { tag: "BOOT", text: "Agent invoked with code generation task..." },
            { tag: "INFO", text: "Task: Create Calculator class with add, subtract, multiply, divide + history" },
            { tag: "PROCESS", text: "→ agent node: LLM reasoning about class structure" },
            { tag: "TOOL", text: "LLM calls write_file(filepath='generated/calculator.py', content=...)" },
            { tag: "OK", text: "File written: generated/calculator.py" },
            { tag: "INFO", text: "→ agent node: LLM summarizes result" },
            { tag: "SUCCESS", text: "Code generation complete." },
          ],
          output: "",
          codeFile: {
            filename: "generated/calculator.py",
            language: "python",
            content: `class Calculator:
    def __init__(self):
        self.history = []

    def add(self, a, b):
        result = a + b
        self.history.append(f'Added {a} + {b} = {result}')
        return result

    def subtract(self, a, b):
        result = a - b
        self.history.append(f'Subtracted {a} - {b} = {result}')
        return result

    def multiply(self, a, b):
        result = a * b
        self.history.append(f'Multiplied {a} * {b} = {result}')
        return result

    def divide(self, a, b):
        if b == 0:
            raise ValueError('Cannot divide by zero')
        result = a / b
        self.history.append(f'Divided {a} / {b} = {result}')
        return result

    def get_history(self):
        return self.history`,
          },
          trace: [
            { type: "human", content: "Create a Python file 'generated/calculator.py' with a Calculator class that has add, subtract, multiply, divide methods and a history list." },
            { type: "ai", content: "", toolName: "write_file", toolArgs: ["filepath='generated/calculator.py'", "content=..."] },
            { type: "tool", content: "File written: generated/calculator.py", toolName: "write_file" },
            { type: "ai", content: "The Python file generated/calculator.py has been created with the Calculator class including add, subtract, multiply, divide methods and a history tracking list." },
          ],
        },
        data_processor: {
          label: "DataProcessor Class",
          description: "Agent generates data_processor.py with type hints",
          log: [
            { tag: "BOOT", text: "Agent invoked with code generation task..." },
            { tag: "INFO", text: "Task: Create DataProcessor class with filter_by, group_by, summarize" },
            { tag: "PROCESS", text: "→ agent node: LLM reasoning about class structure" },
            { tag: "TOOL", text: "LLM calls write_file(filepath='generated/data_processor.py', content=...)" },
            { tag: "OK", text: "File written: generated/data_processor.py" },
            { tag: "INFO", text: "→ agent node: LLM summarizes result" },
            { tag: "SUCCESS", text: "Code generation complete." },
          ],
          output: "",
          codeFile: {
            filename: "generated/data_processor.py",
            language: "python",
            content: `from typing import List, Dict, Any, Tuple


class DataProcessor:
    """A class to process a list of dictionaries."""

    def __init__(self, data: List[Dict[str, Any]]) -> None:
        self.data = data

    def filter_by(self, key: str, value: Any) -> List[Dict[str, Any]]:
        """Returns a filtered list based on a key-value pair."""
        return [item for item in self.data if item.get(key) == value]

    def group_by(self, key: str) -> Dict[Any, List[Dict[str, Any]]]:
        """Groups the list of dictionaries by the specified key."""
        grouped: Dict[Any, List[Dict[str, Any]]] = {}
        for item in self.data:
            group_key = item.get(key)
            if group_key not in grouped:
                grouped[group_key] = []
            grouped[group_key].append(item)
        return grouped

    def summarize(self) -> Tuple[int, List[str], Dict[str, Any]]:
        """Returns count, keys present, and a sample row."""
        count = len(self.data)
        keys_present = list({key for item in self.data for key in item.keys()})
        sample_row = self.data[0] if self.data else {}
        return count, keys_present, sample_row`,
          },
          trace: [
            { type: "human", content: "Create 'generated/data_processor.py' with a DataProcessor class that has filter_by, group_by, and summarize methods." },
            { type: "ai", content: "", toolName: "write_file", toolArgs: ["filepath='generated/data_processor.py'", "content=..."] },
            { type: "tool", content: "File written: generated/data_processor.py", toolName: "write_file" },
            { type: "ai", content: "The file generated/data_processor.py has been created with the DataProcessor class including filter_by, group_by, and summarize methods with full type hints." },
          ],
        },
      },
    },
  ],
};
