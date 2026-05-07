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
  demos: [
    {
      id: "tool-schema-gen",
      question: "How does @tool auto-generate schemas from Python functions?",
      controlLabel: "Tool",
      defaultLeft: "read_file",
      defaultRight: "write_file",
      options: [
        { key: "read_file", label: "read_file", description: "Read contents of a file from disk." },
        { key: "write_file", label: "write_file", description: "Write content to a file on disk." },
        { key: "list_directory", label: "list_directory", description: "List all entries in a directory." },
      ],
      variants: {
        read_file: {
          label: "read_file",
          description: "Single-argument file reader",
          log: [
            { tag: "BOOT", text: "Inspecting @tool decorator..." },
            { tag: "INFO", text: "Function: read_file(filepath: str) -> str" },
            { tag: "PROCESS", text: "Parsing docstring: 'Read the contents of a file and return it as a string.'" },
            { tag: "PROCESS", text: "Extracting type hints: filepath → string" },
            { tag: "OK", text: "Schema generated successfully." },
          ],
          output: `@tool
def read_file(filepath: str) -> str:
    """Read the contents of a file and return it as a string."""
    with open(filepath, "r") as f:
        return f.read()

# Auto-generated schema:
{
  "name": "read_file",
  "description": "Read the contents of a file and return it as a string.",
  "parameters": {
    "filepath": { "type": "string" }
  },
  "required": ["filepath"]
}`,
        },
        write_file: {
          label: "write_file",
          description: "Multi-argument file writer",
          log: [
            { tag: "BOOT", text: "Inspecting @tool decorator..." },
            { tag: "INFO", text: "Function: write_file(filepath: str, content: str) -> str" },
            { tag: "PROCESS", text: "Parsing docstring: 'Write content to a file. Creates the file if it doesn\\'t exist.'" },
            { tag: "PROCESS", text: "Extracting type hints: filepath → string, content → string" },
            { tag: "OK", text: "Schema generated successfully." },
          ],
          output: `@tool
def write_file(filepath: str, content: str) -> str:
    """Write content to a file. Creates the file if it doesn't exist."""
    os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
    with open(filepath, "w") as f:
        f.write(content)
    return f"File written: {filepath}"

# Auto-generated schema:
{
  "name": "write_file",
  "description": "Write content to a file. Creates the file if it doesn't exist.",
  "parameters": {
    "filepath": { "type": "string" },
    "content": { "type": "string" }
  },
  "required": ["filepath", "content"]
}`,
        },
        list_directory: {
          label: "list_directory",
          description: "Directory listing tool",
          log: [
            { tag: "BOOT", text: "Inspecting @tool decorator..." },
            { tag: "INFO", text: "Function: list_directory(directory: str) -> str" },
            { tag: "PROCESS", text: "Parsing docstring: 'List all files and directories in the given path.'" },
            { tag: "PROCESS", text: "Extracting type hints: directory → string" },
            { tag: "OK", text: "Schema generated successfully." },
          ],
          output: `@tool
def list_directory(directory: str) -> str:
    """List all files and directories in the given path."""
    entries = os.listdir(directory)
    return "\\n".join(entries)

# Auto-generated schema:
{
  "name": "list_directory",
  "description": "List all files and directories in the given path.",
  "parameters": {
    "directory": { "type": "string" }
  },
  "required": ["directory"]
}`,
        },
      },
    },
  ],
};
