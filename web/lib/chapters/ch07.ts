import type { ChapterDef } from "../schema";

export const ch07: ChapterDef = {
  slug: "multi-turn",
  number: 7,
  notebook: "Notebook 01",
  title: "Multi-Turn Conversations",
  subtitle: "Maintain message history across turns for contextual follow-ups.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Agent Loop"],
  intro: "A single-turn agent forgets everything after each response. By maintaining message history in MessagesState, the agent can handle follow-up questions, refine previous outputs, and build on context from earlier in the conversation — just like a chat session in Cursor.",
  takeaway: "Multi-turn capability transforms a stateless function into a conversational partner. The key is appending each exchange to MessagesState so the agent has full context for every decision.",
  demos: [],
};
