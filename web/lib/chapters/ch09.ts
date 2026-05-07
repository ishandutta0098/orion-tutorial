import type { ChapterDef } from "../schema";

export const ch09: ChapterDef = {
  slug: "self-correction",
  number: 9,
  notebook: "Notebook 02",
  title: "Code Execution & Self-Correction",
  subtitle: "Generate code, execute it, detect errors, and retry automatically.",
  cursorFeature: "Bugbot",
  designPatterns: ["Reflection", "Exception Handling"],
  intro: "The self-correcting loop is the heart of an autonomous coding agent: generate code → execute via subprocess → if it fails, feed the error back and retry. Bounded retries prevent infinite loops while giving the agent multiple chances to fix its mistakes.",
  takeaway: "A generate-execute-retry loop with bounded retries turns a one-shot code generator into a self-healing agent. The error message is the most valuable input — it tells the model exactly what to fix.",
  demos: [],
};
