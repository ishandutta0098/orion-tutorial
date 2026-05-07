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
