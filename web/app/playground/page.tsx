import type { Metadata } from "next";
import { ChapterLayout } from "@/components/IDE/ChapterLayout";
import { playground } from "@/lib/playground";

export const metadata: Metadata = {
  title: "Orion Playground // Production Coding Agent",
  description:
    "Experience Orion's production coding agent with graph tracing, chat, generated files, terminal logs, and code review in one editor.",
};

export default function PlaygroundPage() {
  return <ChapterLayout chapter={playground} defaultView="files" />;
}
