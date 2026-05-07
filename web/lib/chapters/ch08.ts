import type { ChapterDef } from "../schema";

export const ch08: ChapterDef = {
  slug: "structured-output",
  number: 8,
  notebook: "Notebook 02",
  title: "Structured Output",
  subtitle: "Force the LLM to return Pydantic-validated JSON with with_structured_output.",
  cursorFeature: "Bugbot",
  designPatterns: ["Prompt Chaining"],
  intro: "Free-text LLM responses are unpredictable. with_structured_output binds a Pydantic model to the LLM call, ensuring every response is valid, typed JSON. This is essential for agents that need to parse results programmatically — bug reports, code plans, review verdicts.",
  takeaway: "Structured output eliminates parsing fragility. When your agent returns a Pydantic model instead of raw text, downstream nodes can rely on typed fields rather than regex or string matching.",
  demos: [],
};
