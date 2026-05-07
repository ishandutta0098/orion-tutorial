import type { ChapterDef } from "../schema";

export const ch10: ChapterDef = {
  slug: "reflection",
  number: 10,
  notebook: "Notebook 02",
  title: "Reflection Pattern",
  subtitle: "Add a reviewer node that evaluates code quality after execution succeeds.",
  cursorFeature: "Bugbot",
  designPatterns: ["Reflection"],
  intro: "Passing tests isn't enough — code can be correct but poorly written. The reflection pattern adds a reviewer node after successful execution. It evaluates quality (naming, structure, edge cases) and can send the code back for revision, creating a second improvement loop.",
  takeaway: "Reflection separates 'does it work?' from 'is it good?'. A dedicated reviewer node catches quality issues that unit tests miss, pushing the agent toward production-grade output.",
  demos: [],
};
