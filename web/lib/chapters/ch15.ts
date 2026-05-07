import type { ChapterDef } from "../schema";

export const ch15: ChapterDef = {
  slug: "multi-agent",
  number: 15,
  notebook: "Notebook 03",
  title: "Multi-Agent: Planner, Coder, Reviewer",
  subtitle: "Specialist agents collaborating through shared state.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Multi-Agent", "Routing"],
  intro: "Instead of one monolithic agent, split responsibilities across specialists: the Planner analyzes requirements and creates a plan, the Coder implements each file task, and the Reviewer evaluates quality. They communicate through shared state, with the graph routing between them based on the current stage.",
  takeaway: "Multi-agent architecture improves quality through specialization. Each agent has a focused system prompt and toolset, leading to better results than a single agent trying to do everything.",
  demos: [],
};
