import type { ChapterDef } from "../schema";

export const ch11: ChapterDef = {
  slug: "dynamic-rules",
  number: 11,
  notebook: "Notebook 02",
  title: "Dynamic Rules Injection",
  subtitle: "Inject coding rules at runtime — the .cursorrules equivalent for agents.",
  cursorFeature: "Cursor Rules",
  designPatterns: ["Prompt Chaining"],
  intro: "Hard-coded system prompts are static. Dynamic rules injection loads coding standards from state at runtime, so the same agent can enforce different conventions per project. This mirrors how .cursorrules files customize Cursor's behavior per repository.",
  takeaway: "Dynamic rules let you swap coding standards without changing agent code. Store rules in state, inject them into the system prompt at runtime, and the agent adapts to any project's conventions.",
  demos: [],
};
