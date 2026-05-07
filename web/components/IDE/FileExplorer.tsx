"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, File, Folder } from "lucide-react";
import { chapters } from "@/lib/registry";

function slugToFilename(slug: string): string {
  return slug.replace(/-/g, "_") + ".py";
}

export function FileExplorer() {
  const pathname = usePathname();

  const notebook01 = chapters.filter((c) => c.notebook === "Notebook 01");
  const notebook02 = chapters.filter((c) => c.notebook === "Notebook 02");
  const notebook03 = chapters.filter((c) => c.notebook === "Notebook 03");

  return (
    <aside className="w-64 bg-surface-low border-r border-outline-variant flex flex-col shrink-0">
      <div className="p-3 flex justify-between items-center border-b border-outline-variant/20">
        <span className="font-headline text-[11px] font-bold tracking-[0.05em] uppercase text-ink-variant">
          TUTORIAL CONTENTS
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-variant" />
      </div>
      <div className="overflow-y-auto flex-1 py-1">
        <div className="px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-surface-high/30">
          <ChevronDown className="w-4 h-4 text-ink-variant" />
          <Folder className="w-4 h-4 text-ink-variant" />
          <span className="font-body text-[12px] text-ink">tutorial_series</span>
        </div>

        {[
          { label: "notebook_01", items: notebook01 },
          { label: "notebook_02", items: notebook02 },
          { label: "notebook_03", items: notebook03 },
        ].map((group) => (
          <div key={group.label}>
            {group.items.map((ch) => {
              const href = `/curriculum/${ch.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={ch.slug}
                  href={href}
                  className={`pl-8 pr-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-surface-high/50 text-white"
                      : "text-ink-variant hover:bg-surface-high/30"
                  }`}
                >
                  <File className="w-4 h-4 shrink-0" />
                  <span className={`font-body text-[12px] truncate ${isActive ? "font-semibold" : ""}`}>
                    {slugToFilename(ch.slug)}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
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
