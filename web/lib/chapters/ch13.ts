import type { ChapterDef } from "../schema";

export const ch13: ChapterDef = {
  slug: "codebase-rag",
  number: 13,
  notebook: "Notebook 03",
  title: "Codebase RAG with FAISS",
  subtitle: "Semantic search over your codebase — the @codebase and @file equivalent.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Knowledge Retrieval"],
  intro: "A production agent needs to understand existing code before writing new code. FAISS-powered codebase RAG lets the agent search semantically — finding relevant functions, classes, and patterns by meaning, not just text matching. This is how Cursor's @codebase and @file references work under the hood.",
  takeaway: "Codebase RAG transforms a context-blind agent into one that understands your project. Semantic search finds related code that keyword search misses, enabling accurate modifications to large codebases.",
  demos: [],
};
