import type { ChapterDef } from "../schema";

export const ch06: ChapterDef = {
  slug: "streaming",
  number: 6,
  notebook: "Notebook 01",
  title: "Streaming with astream_events",
  subtitle: "Stream tokens in real-time for a responsive agent experience.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Agent Loop"],
  intro: "Waiting for a complete response is a poor UX. With astream_events, you get real-time token-by-token output, tool call notifications, and step-level visibility as the agent works. This is how Cursor shows you the agent's thinking process in real-time.",
  takeaway: "astream_events gives you a firehose of typed events — token deltas, tool calls, state transitions. Filter by event kind to build responsive UIs that show exactly what the agent is doing at each moment.",
  demos: [],
};
