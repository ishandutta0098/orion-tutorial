import type { ChapterDef } from "../schema";

export const ch14: ChapterDef = {
  slug: "orchestrator-state",
  number: 14,
  notebook: "Notebook 03",
  title: "Planner & Orchestrator State",
  subtitle: "Design the state schema that tracks feature requests through the full agent lifecycle.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Planning"],
  intro: "A production agent needs more than messages — it needs structured state. The orchestrator state tracks the feature request, generated plan, code changes, review results, and human decisions. A structured planner uses with_structured_output to produce a typed Plan with FileTask entries.",
  takeaway: "Well-designed state is what separates a toy agent from a production system. Every field in your state schema represents a decision point the agent must handle, making the workflow explicit and debuggable.",
  demos: [],
};
