import type { ChapterDef } from "../schema";

export const ch07: ChapterDef = {
  slug: "multi-turn",
  number: 7,
  notebook: "Notebook 01",
  title: "Multi-Turn Conversations",
  subtitle: "Maintain message history across turns for contextual follow-ups.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Agent Loop"],
  intro: "A single-turn agent forgets everything after each response. By maintaining message history in MessagesState, the agent can handle follow-up questions, refine previous outputs, and build on context from earlier in the conversation — just like a chat session in Cursor.",
  takeaway: "Multi-turn capability transforms a stateless function into a conversational partner. The key is appending each exchange to MessagesState so the agent has full context for every decision.",
  backendFilename: "multi_turn.py",
  backendCode: `# Turn 1: Create a file
messages = [
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(
        content="Create 'generated/logger.py' with a SimpleLogger "
        "class that writes timestamped messages to a log file."
    ),
]

result = app.invoke({"messages": messages})
messages = result["messages"]

print("=== Turn 1 complete ===")
print(open("generated/logger.py").read()[:300])

# Turn 2: Modify it — the agent has full context from turn 1
messages.append(
    HumanMessage(
        content="""
Now read the logger.py file and add these features:
- Log levels: INFO, WARNING, ERROR
- A method to filter logs by level
Write the updated file.
"""
    )
)

result = app.invoke({"messages": messages})

print("=== Turn 2 complete ===")
print(open("generated/logger.py").read())`,
  chatConfig: {
    mode: "multi-turn",
    defaultPrompt: "Create 'generated/logger.py' with a SimpleLogger class that writes timestamped messages to a log file.",
    conversations: {
      turn_1: [
        {
          role: "tool",
          content: "File written: generated/logger.py",
          toolName: "write_file",
          toolArgs: { filepath: "generated/logger.py" },
        },
        {
          role: "assistant",
          content: "I've created `generated/logger.py` with a SimpleLogger class. It includes:\n\n- `__init__(log_file)` — takes a log file path\n- `log(message)` — writes a timestamped message to the file\n- Timestamps are in ISO format\n\nYou can now ask me to modify or extend this file.",
        },
      ],
      turn_2: [
        {
          role: "tool",
          content: "import datetime\nfrom enum import Enum\n\nclass LogLevel(Enum):\n    INFO = 'INFO'\n    WARNING = 'WARNING'\n    ERROR = 'ERROR'\n...",
          toolName: "read_file",
          toolArgs: { filepath: "generated/logger.py" },
        },
        {
          role: "tool",
          content: "File written: generated/logger.py",
          toolName: "write_file",
          toolArgs: { filepath: "generated/logger.py" },
        },
        {
          role: "assistant",
          content: "Done! I've updated `logger.py` with:\n\n- **LogLevel enum** — INFO, WARNING, ERROR\n- **Updated `log()` method** — now accepts a `level` parameter\n- **New `filter_logs(level)` method** — returns only entries matching that level\n\nThe agent read the existing file first (full context from Turn 1), then wrote the updated version.",
        },
      ],
    },
  },
  demos: [],
};
