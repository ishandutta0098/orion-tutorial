import type { ChapterDef } from "../schema";

export const ch17: ChapterDef = {
  slug: "parallel-generation",
  number: 17,
  notebook: "Notebook 03",
  title: "Parallel Code Generation",
  subtitle: "Fan out to per-file coders with the Send API for concurrent generation.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Parallelization"],
  intro: "When a plan has multiple independent file tasks, generating them sequentially wastes time. The Send API fans out to parallel coder subgraphs — one per file — then merges results back with custom reducers. This is how production agents achieve speed on multi-file changes.",
  takeaway: "The Send API turns sequential bottlenecks into parallel pipelines. Combined with reducers for merging results, you can scale code generation linearly with the number of files in a plan.",
  demos: [],
};
