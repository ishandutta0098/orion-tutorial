"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import type { WorkspaceFile } from "@/lib/schema";

type FileExplorerProps = {
  files: WorkspaceFile[];
  selectedFilePath: string | null;
  onSelectFile: (path: string) => void;
};

function groupFiles(files: WorkspaceFile[]): Record<string, WorkspaceFile[]> {
  return files.reduce<Record<string, WorkspaceFile[]>>((groups, file) => {
    const [folder] = file.path.split("/");
    groups[folder] = [...(groups[folder] ?? []), file];
    return groups;
  }, {});
}

function fileLabel(path: string): string {
  return path.split("/").at(-1) ?? path;
}

export function FileExplorer({ files, selectedFilePath, onSelectFile }: FileExplorerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    sample_project: true,
    generated: true,
    orion: true,
  });

  const groups = groupFiles(files);
  const folderNames = ["sample_project", "generated", "orion"];

  return (
    <aside className="w-64 bg-surface-low border-r border-outline-variant flex flex-col shrink-0">
      <div className="p-3 flex justify-between items-center border-b border-outline-variant/20">
        <span className="font-headline text-[11px] font-bold tracking-[0.05em] uppercase text-ink-variant">
          Explorer
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-variant" />
      </div>
      <div className="overflow-y-auto flex-1 py-1">
        {folderNames.map((folder) => {
          const folderFiles = groups[folder] ?? [];
          const isOpen = expanded[folder] ?? true;
          const Chevron = isOpen ? ChevronDown : ChevronRight;
          return (
            <div key={folder}>
              <button
                onClick={() => setExpanded((s) => ({ ...s, [folder]: !isOpen }))}
                className="w-full px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-surface-high/30 text-left"
              >
                <Chevron className="w-3.5 h-3.5 text-ink-variant shrink-0" />
                <Folder className="w-4 h-4 text-ink-variant shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-body text-[12px] text-ink font-semibold truncate">
                    {folder}
                  </span>
                  <span className="font-body text-[10px] text-ink-variant truncate">
                    {folderFiles.length} file{folderFiles.length === 1 ? "" : "s"}
                  </span>
                </div>
              </button>
              {isOpen &&
                folderFiles
                  .sort((a, b) => a.path.localeCompare(b.path))
                  .map((file) => {
                  const isActive = selectedFilePath === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => onSelectFile(file.path)}
                      className={`w-full pl-10 pr-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                        isActive
                          ? "bg-surface-high/50 text-white"
                          : "text-ink-variant hover:bg-surface-high/30"
                      }`}
                    >
                      <File className="w-3.5 h-3.5 shrink-0" />
                      <span className={`font-body text-[11px] truncate ${isActive ? "font-semibold" : ""}`}>
                        {fileLabel(file.path)}
                      </span>
                    </button>
                  );
                })}
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-outline-variant bg-surface-container-low">
        <div className="font-headline text-[11px] font-bold tracking-[0.05em] uppercase text-ink-variant mb-2">
          DEV CONTEXT
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="px-1.5 py-0.5 rounded bg-surface-high text-ink-variant text-[9px] font-bold border border-outline-variant">
            FILE_IO
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-high text-ink-variant text-[9px] font-bold border border-outline-variant">
            LANGGRAPH
          </span>
        </div>
      </div>
    </aside>
  );
}
