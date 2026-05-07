"use client";

import { useState, useCallback } from "react";
import { IDEHeader } from "./IDEHeader";
import { ActivityBar } from "./ActivityBar";
import { FileExplorer } from "./FileExplorer";
import { CodePanel } from "./CodePanel";
import { InteractiveChatPanel } from "./InteractiveChatPanel";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { StatusFooter } from "./StatusFooter";
import { CommandPalette } from "./CommandPalette";
import type { ChapterDef } from "@/lib/schema";

export function ChapterLayout({ chapter }: { chapter: ChapterDef }) {
  const initialCode = chapter.chatConfig?.initialCode ?? null;
  const [dynamicFile, setDynamicFile] = useState<{ filename: string; content: string } | null>(initialCode);

  const handleFileGenerated = useCallback((filename: string, content: string) => {
    setDynamicFile({ filename, content });
  }, []);

  const filename = chapter.codeFilename ?? chapter.slug.replace(/-/g, "_") + ".py";
  const code = chapter.codeContent ?? "";

  const hasInteractiveChat = !!chapter.chatConfig;
  const shouldShowEmptyPanel = hasInteractiveChat && !code && !dynamicFile;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-night text-ink">
      <IDEHeader />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <FileExplorer />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <CodePanel
              code={shouldShowEmptyPanel ? undefined : code}
              filename={shouldShowEmptyPanel ? undefined : filename}
              backendCode={chapter.backendCode}
              backendFilename={chapter.backendFilename}
              dynamicFile={dynamicFile}
            />
            <StatusFooter />
          </div>
          {hasInteractiveChat ? (
            <InteractiveChatPanel
              chatConfig={chapter.chatConfig!}
              onFileGenerated={handleFileGenerated}
            />
          ) : (
            <AIAssistantPanel exchange={chapter.aiExchange} />
          )}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
