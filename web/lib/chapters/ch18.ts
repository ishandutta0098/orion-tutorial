import type { ChapterDef } from "../schema";

export const ch18: ChapterDef = {
  slug: "time-travel",
  number: 18,
  notebook: "Notebook 03",
  title: "Time-Travel Debugging",
  subtitle: "Inspect and replay any checkpoint in the agent's execution history.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Memory Management"],
  intro: "MemorySaver doesn't just enable human-in-the-loop — it creates a full audit trail. You can inspect the state at any checkpoint, replay from a previous point, or branch the execution to try different approaches. This is time-travel debugging for AI agents.",
  takeaway: "Checkpointed state history is the ultimate debugging tool for agents. When something goes wrong, you can rewind to any decision point, inspect the full state, and understand exactly why the agent made each choice.",
  demos: [],
};
