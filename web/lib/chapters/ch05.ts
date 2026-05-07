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
  demos: [],
};
