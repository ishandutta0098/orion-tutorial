import { notFound } from "next/navigation";
import { chapters, getChapter } from "@/lib/registry";
import { IDEHeader } from "@/components/IDE/IDEHeader";
import { ActivityBar } from "@/components/IDE/ActivityBar";
import { FileExplorer } from "@/components/IDE/FileExplorer";
import { CodePanel } from "@/components/IDE/CodePanel";
import { AIAssistantPanel } from "@/components/IDE/AIAssistantPanel";
import { StatusFooter } from "@/components/IDE/StatusFooter";
import { CommandPalette } from "@/components/IDE/CommandPalette";

export function generateStaticParams() {
  return chapters.map((ch) => ({ slug: ch.slug }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const filename = chapter.codeFilename ?? slug.replace(/-/g, "_") + ".py";
  const code = chapter.codeContent ?? `# ${chapter.title}\n# Code content loading...`;
  const backendCode = chapter.backendCode;
  const backendFilename = chapter.backendFilename;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-night text-ink">
      <IDEHeader />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <FileExplorer />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <CodePanel
              code={code}
              filename={filename}
              backendCode={backendCode}
              backendFilename={backendFilename}
            />
            <StatusFooter />
          </div>
          <AIAssistantPanel exchange={chapter.aiExchange} />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
