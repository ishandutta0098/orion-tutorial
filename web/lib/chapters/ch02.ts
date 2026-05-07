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
  demos: [],
};
