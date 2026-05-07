"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import { chapters } from "@/lib/registry";
import { useState } from "react";
import type { NotebookId } from "@/lib/schema";

function slugToFilename(slug: string): string {
  return slug.replace(/-/g, "_") + ".py";
}

const NOTEBOOK_LABELS: Record<NotebookId, string> = {
  "Notebook 01": "notebook_01",
  "Notebook 02": "notebook_02",
  "Notebook 03": "notebook_03",
};

const NOTEBOOK_TITLES: Record<NotebookId, string> = {
  "Notebook 01": "Code Generator with Tools",
  "Notebook 02": "Self-Correcting Agent",
  "Notebook 03": "Production Agent",
};

export function FileExplorer() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<NotebookId, boolean>>({
    "Notebook 01": true,
    "Notebook 02": true,
    "Notebook 03": true,
  });

  const groups: { id: NotebookId; items: typeof chapters }[] = [
    { id: "Notebook 01", items: chapters.filter((c) => c.notebook === "Notebook 01") },
    { id: "Notebook 02", items: chapters.filter((c) => c.notebook === "Notebook 02") },
    { id: "Notebook 03", items: chapters.filter((c) => c.notebook === "Notebook 03") },
  ];

  return (
    <aside className="w-64 bg-surface-low border-r border-outline-variant flex flex-col shrink-0">
      <div className="p-3 flex justify-between items-center border-b border-outline-variant/20">
        <span className="font-headline text-[11px] font-bold tracking-[0.05em] uppercase text-ink-variant">
          TUTORIAL CONTENTS
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-variant" />
      </div>
      <div className="overflow-y-auto flex-1 py-1">
        {groups.map((group) => {
          const isOpen = expanded[group.id];
          const Chevron = isOpen ? ChevronDown : ChevronRight;
          return (
            <div key={group.id}>
              <button
                onClick={() => setExpanded((s) => ({ ...s, [group.id]: !s[group.id] }))}
                className="w-full px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-surface-high/30 text-left"
              >
                <Chevron className="w-3.5 h-3.5 text-ink-variant shrink-0" />
                <Folder className="w-4 h-4 text-ink-variant shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-body text-[12px] text-ink font-semibold truncate">
                    {NOTEBOOK_LABELS[group.id]}
                  </span>
                  <span className="font-body text-[10px] text-ink-variant truncate">
                    {NOTEBOOK_TITLES[group.id]}
                  </span>
                </div>
              </button>
              {isOpen &&
                group.items.map((ch) => {
                  const href = `/curriculum/${ch.slug}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={ch.slug}
                      href={href}
                      className={`pl-10 pr-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                        isActive
                          ? "bg-surface-high/50 text-white"
                          : "text-ink-variant hover:bg-surface-high/30"
                      }`}
                    >
                      <File className="w-3.5 h-3.5 shrink-0" />
                      <span className={`font-body text-[11px] truncate ${isActive ? "font-semibold" : ""}`}>
                        {slugToFilename(ch.slug)}
                      </span>
                    </Link>
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
