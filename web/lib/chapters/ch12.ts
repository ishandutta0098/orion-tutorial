import type { ChapterDef } from "../schema";

export const ch12: ChapterDef = {
  slug: "inline-edit",
  number: 12,
  notebook: "Notebook 02",
  title: "Inline Edit + Rules",
  subtitle: "Modify existing code based on instructions while enforcing coding rules.",
  cursorFeature: "Inline Edit",
  designPatterns: ["Prompt Chaining", "Reflection"],
  intro: "Inline editing is different from generation — you're modifying existing code, not starting from scratch. The agent reads the current file, applies targeted changes based on an instruction, and ensures the result still follows your coding rules. This is the Cursor inline edit experience.",
  takeaway: "Inline edit combines read-modify-write with rule enforcement. The agent sees the full file context, makes surgical changes, and validates against dynamic rules — preserving the codebase while improving it.",
  demos: [],
};
