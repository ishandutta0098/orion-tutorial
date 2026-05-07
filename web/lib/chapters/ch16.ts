import type { ChapterDef } from "../schema";

export const ch16: ChapterDef = {
  slug: "human-in-the-loop",
  number: 16,
  notebook: "Notebook 03",
  title: "Human-in-the-Loop",
  subtitle: "Pause for approval before applying changes with interrupt and Command.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Human-in-the-Loop"],
  intro: "Autonomous doesn't mean uncontrolled. The interrupt primitive pauses the graph, presenting generated changes for human review. The user can approve, reject, or edit — then resume execution with Command. MemorySaver checkpoints state so nothing is lost during the pause.",
  takeaway: "interrupt + Command + MemorySaver is the trifecta for safe autonomous agents. The agent proposes, the human disposes, and checkpointed state ensures you can always resume exactly where you left off.",
  demos: [],
};
