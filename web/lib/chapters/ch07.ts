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
  codeFilename: "logger.py",
  codeContent: `# generated/logger.py (Turn 2 — with LogLevel)
# Updated by the agent using context from Turn 1

from enum import Enum
from datetime import datetime


class LogLevel(Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


class SimpleLogger:
    """Logger that writes timestamped messages to a file."""

    def __init__(self, log_file: str = "app.log") -> None:
        self.log_file = log_file
        self.entries: list[dict] = []

    def log(self, message: str, level: LogLevel = LogLevel.INFO) -> None:
        """Write a timestamped log entry."""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level.value,
            "message": message,
        }
        self.entries.append(entry)
        with open(self.log_file, "a") as f:
            f.write(f"[{entry['timestamp']}] {level.value}: {message}\\n")

    def filter_by_level(self, level: LogLevel) -> list[dict]:
        """Return only log entries matching the given level."""
        return [e for e in self.entries if e["level"] == level.value]


if __name__ == "__main__":
    logger = SimpleLogger()
    logger.log("Application started")
    logger.log("Disk space low", LogLevel.WARNING)
    logger.log("Connection failed", LogLevel.ERROR)
    print(logger.filter_by_level(LogLevel.ERROR))`,
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
  aiExchange: {
    userMessage: "Now read logger.py and add log levels and a filter method.",
    aiLabel: "MULTI-TURN CONTEXT",
    aiDescription: "Agent retains full message history from Turn 1. Reading existing file, then writing updated version with LogLevel enum...",
    aiCodeSnippet: `# Turn 2: Agent has full context
messages.append(HumanMessage(content="..."))
result = app.invoke({"messages": messages})`,
  },
  demos: [
    {
      id: "multi-turn-context",
      question: "How does message history enable contextual follow-ups?",
      controlLabel: "Turn",
      defaultLeft: "turn_1",
      defaultRight: "turn_2",
      options: [
        { key: "turn_1", label: "Turn 1: Create", description: "Agent creates a logger class from scratch." },
        { key: "turn_2", label: "Turn 2: Modify", description: "Agent modifies the file using context from turn 1." },
      ],
      variants: {
        turn_1: {
          label: "Turn 1: Create Logger",
          description: "Initial creation — agent writes a basic SimpleLogger",
          log: [
            { tag: "BOOT", text: "Turn 1: Starting fresh conversation..." },
            { tag: "INFO", text: "Messages: [SystemMessage, HumanMessage]" },
            { tag: "PROCESS", text: "→ agent node: LLM generates logger code" },
            { tag: "TOOL", text: "write_file('generated/logger.py', content=...)" },
            { tag: "OK", text: "File written: generated/logger.py" },
            { tag: "SUCCESS", text: "Turn 1 complete. Message history: 5 messages." },
          ],
          output: "",
          codeFile: {
            filename: "generated/logger.py",
            language: "python",
            content: `import datetime


class SimpleLogger:
    """A simple logger that writes timestamped messages."""

    def __init__(self, log_file: str) -> None:
        self.log_file = log_file

    def log(self, message: str) -> None:
        timestamp = datetime.datetime.now().isoformat()
        log_entry = f'[{timestamp}] {message}\\n'
        with open(self.log_file, 'a') as file:
            file.write(log_entry)`,
          },
          trace: [
            { type: "human", content: "Create 'generated/logger.py' with a SimpleLogger class that writes timestamped messages to a log file." },
            { type: "ai", content: "", toolName: "write_file", toolArgs: ["filepath='generated/logger.py'"] },
            { type: "tool", content: "File written: generated/logger.py", toolName: "write_file" },
            { type: "ai", content: "I've created generated/logger.py with a SimpleLogger class that writes timestamped messages." },
          ],
        },
        turn_2: {
          label: "Turn 2: Add Features",
          description: "Follow-up — agent reads the file, then adds log levels",
          log: [
            { tag: "BOOT", text: "Turn 2: Continuing conversation (5 messages in history)..." },
            { tag: "INFO", text: "Messages: [SystemMessage, HumanMessage, AIMessage, ToolMessage, AIMessage, HumanMessage]" },
            { tag: "PROCESS", text: "→ agent node: LLM has full context from Turn 1" },
            { tag: "TOOL", text: "read_file('generated/logger.py')" },
            { tag: "OK", text: "File read successfully (agent sees its own prior output)" },
            { tag: "TOOL", text: "write_file('generated/logger.py', content=...updated)" },
            { tag: "OK", text: "File written: generated/logger.py" },
            { tag: "SUCCESS", text: "Turn 2 complete. Message history: 10 messages." },
          ],
          output: "",
          codeFile: {
            filename: "generated/logger.py",
            language: "python",
            content: `import datetime
from enum import Enum


class LogLevel(Enum):
    INFO = 'INFO'
    WARNING = 'WARNING'
    ERROR = 'ERROR'


class SimpleLogger:
    """A simple logger with level-based filtering."""

    def __init__(self, log_file: str) -> None:
        self.log_file = log_file

    def log(self, message: str, level: LogLevel = LogLevel.INFO) -> None:
        timestamp = datetime.datetime.now().isoformat()
        log_entry = f'[{timestamp}] [{level.value}] {message}\\n'
        with open(self.log_file, 'a') as file:
            file.write(log_entry)

    def filter_logs(self, level: LogLevel) -> list[str]:
        """Retrieve all log entries matching the specified level."""
        filtered_logs = []
        with open(self.log_file, 'r') as file:
            for line in file:
                if f'[{level.value}]' in line:
                    filtered_logs.append(line.strip())
        return filtered_logs`,
          },
          trace: [
            { type: "human", content: "Now read logger.py and add log levels (INFO, WARNING, ERROR) and a filter_logs method." },
            { type: "ai", content: "", toolName: "read_file", toolArgs: ["filepath='generated/logger.py'"] },
            { type: "tool", content: "import datetime\n\nclass SimpleLogger:\n    ...", toolName: "read_file" },
            { type: "ai", content: "", toolName: "write_file", toolArgs: ["filepath='generated/logger.py'"] },
            { type: "tool", content: "File written: generated/logger.py", toolName: "write_file" },
            { type: "ai", content: "I've updated the logger with LogLevel enum (INFO, WARNING, ERROR) and a filter_logs method that retrieves entries by level." },
          ],
        },
      },
    },
  ],
};
