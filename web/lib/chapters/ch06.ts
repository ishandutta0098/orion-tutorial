import type { ChapterDef } from "../schema";

export const ch06: ChapterDef = {
  slug: "streaming",
  number: 6,
  notebook: "Notebook 01",
  title: "Streaming with astream_events",
  subtitle: "Stream tokens in real-time for a responsive agent experience.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Agent Loop"],
  intro: "Waiting for a complete response is a poor UX. With astream_events, you get real-time token-by-token output, tool call notifications, and step-level visibility as the agent works. This is how Cursor shows you the agent's thinking process in real-time.",
  takeaway: "astream_events gives you a firehose of typed events — token deltas, tool calls, state transitions. Filter by event kind to build responsive UIs that show exactly what the agent is doing at each moment.",
  codeFilename: "stream_output.log",
  codeContent: `# Real-time streaming output from agent execution
# Task: "List files in 'generated' directory and read calculator.py"

[on_chat_model_stream] I'll list the directory and then read the file.
--- Calling tool: list_directory ---
  args: {"directory": "generated"}
--- Tool done ---
  result: calculator.py
          data_processor.py
          logger.py

--- Calling tool: read_file ---
  args: {"filepath": "generated/calculator.py"}
--- Tool done ---
  result: class Calculator:
              def __init__(self): ...

[on_chat_model_stream] Here's what I found:
[on_chat_model_stream] The \`generated/\` directory contains 3 files.
[on_chat_model_stream] The \`calculator.py\` file implements a
[on_chat_model_stream] Calculator class with add, subtract,
[on_chat_model_stream] multiply, divide methods and history tracking.

# Stream complete
# Events fired: 14
# Tools called: 2 (list_directory, read_file)
# Tokens streamed: 89`,
  backendFilename: "streaming.py",
  backendCode: `async def stream_agent(user_message: str):
    inputs = {
        "messages": [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_message),
        ]
    }

    async for event in app.astream_events(inputs, version="v2"):

        if event["event"] == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                print(chunk.content, end="", flush=True)

        elif event["event"] == "on_tool_start":
            print(f"\\n--- Calling tool: {event['name']} ---")

        elif event["event"] == "on_tool_end":
            print(f"--- Tool done ---\\n")


await stream_agent(
    "List files in 'generated' directory and read calculator.py"
)`,
  aiExchange: {
    userMessage: "Stream the agent output in real-time.",
    aiLabel: "STREAMING TOKENS",
    aiDescription: "Using astream_events for real-time token output. Events: on_chat_model_stream, on_tool_start, on_tool_end...",
    aiCodeSnippet: `async for event in app.astream_events(inputs, version="v2"):
    if event["event"] == "on_chat_model_stream":
        chunk = event["data"]["chunk"]
        if chunk.content:
            print(chunk.content, end="", flush=True)`,
  },
  demos: [
    {
      id: "streaming-events",
      question: "What events fire during a streaming agent run?",
      controlLabel: "Task",
      defaultLeft: "list_and_read",
      defaultRight: "generate_code",
      options: [
        { key: "list_and_read", label: "List & Read Files", description: "Agent lists a directory then reads a file." },
        { key: "generate_code", label: "Generate Code", description: "Agent generates and writes a Python file." },
      ],
      variants: {
        list_and_read: {
          label: "List & Read Files",
          description: "Multi-tool streaming: list_directory + read_file",
          log: [
            { tag: "STREAM", text: "[on_chat_model_stream] token: ''" },
            { tag: "TOOL", text: "[on_tool_start] Calling tool: list_directory" },
            { tag: "TOOL", text: "[on_tool_end] Tool done: list_directory" },
            { tag: "TOOL", text: "[on_tool_start] Calling tool: read_file" },
            { tag: "TOOL", text: "[on_tool_end] Tool done: read_file" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: 'Here'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' are'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' the'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' files'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: '...'" },
            { tag: "OK", text: "Stream complete." },
          ],
          output: `### Files in 'generated' directory
- data_processor.py
- calculator.py

### Contents of calculator.py
class Calculator:
    def __init__(self):
        self.history = []
    ...`,
        },
        generate_code: {
          label: "Generate Code",
          description: "Single-tool streaming: write_file with code generation",
          log: [
            { tag: "STREAM", text: "[on_chat_model_stream] token: ''" },
            { tag: "TOOL", text: "[on_tool_start] Calling tool: write_file" },
            { tag: "TOOL", text: "[on_tool_end] Tool done: write_file" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: 'I'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' have'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' created'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' the'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' logger'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: ' class'" },
            { tag: "STREAM", text: "[on_chat_model_stream] token: '.'" },
            { tag: "OK", text: "Stream complete." },
          ],
          output: `I have created the logger class in generated/logger.py with timestamped messages and file-based output.`,
          codeFile: {
            filename: "generated/logger.py",
            language: "python",
            content: `import datetime


class SimpleLogger:
    """A simple logger that writes timestamped messages to a log file."""

    def __init__(self, log_file: str) -> None:
        self.log_file = log_file

    def log(self, message: str) -> None:
        """Write a timestamped message to the log file."""
        timestamp = datetime.datetime.now().isoformat()
        log_entry = f'[{timestamp}] {message}\\n'
        with open(self.log_file, 'a') as file:
            file.write(log_entry)`,
          },
        },
      },
    },
  ],
};
