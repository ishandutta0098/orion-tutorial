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
  demos: [],
};
