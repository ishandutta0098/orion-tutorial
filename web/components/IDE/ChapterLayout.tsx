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
import { TerminalLogPanel } from "./TerminalLogPanel";
import type { ChapterDef, LogLine } from "@/lib/schema";

export function ChapterLayout({ chapter }: { chapter: ChapterDef }) {
  const initialCode = chapter.chatConfig?.initialCode ?? null;
  const [dynamicFile, setDynamicFile] = useState<{ filename: string; content: string } | null>(initialCode);
  const [terminalLogs, setTerminalLogs] = useState<LogLine[]>([]);
  const [resetKey, setResetKey] = useState(0);

  const handleFileGenerated = useCallback((filename: string, content: string) => {
    setDynamicFile({ filename, content });
  }, []);

  const handleReset = useCallback(() => {
    setDynamicFile(initialCode);
    setTerminalLogs([]);
    setResetKey((key) => key + 1);
  }, [initialCode]);

  const filename = chapter.codeFilename ?? chapter.slug.replace(/-/g, "_") + ".py";
  const code = chapter.codeContent ?? "";
  const isInlineEdit = chapter.chatConfig?.mode === "inline-edit";
  const isSelfCorrection = chapter.chatConfig?.mode === "self-correction";

  const hasInteractiveChat = !!chapter.chatConfig && !isInlineEdit;
  const shouldShowEmptyPanel = hasInteractiveChat && !code && !dynamicFile;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-night text-ink">
      <IDEHeader onReset={handleReset} />
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
              inlineEditConfig={
                isInlineEdit
                  ? {
                      prompt: chapter.chatConfig?.inlineEditPrompt,
                      generatedFile: chapter.chatConfig?.generatedFile,
                      onApply: handleFileGenerated,
                    }
                  : undefined
              }
              resetKey={resetKey}
            />
            {isSelfCorrection && <TerminalLogPanel logs={terminalLogs} />}
            <StatusFooter />
          </div>
          {hasInteractiveChat ? (
            <InteractiveChatPanel
              chatConfig={chapter.chatConfig!}
              onFileGenerated={handleFileGenerated}
              onTerminalLogs={setTerminalLogs}
              resetKey={resetKey}
            />
          ) : !isInlineEdit ? (
            <AIAssistantPanel exchange={chapter.aiExchange} />
          ) : null}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
