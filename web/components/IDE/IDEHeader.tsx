"use client";

import { Search, Terminal, Settings } from "lucide-react";

export function IDEHeader() {
  return (
    <header className="bg-surface-container-low flex justify-between items-center w-full px-4 h-12 border-b border-outline-variant z-50 shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-headline text-[18px] font-black tracking-tighter text-white">
          FLOWSTATE
        </span>
        <div className="hidden md:flex items-center gap-1 ml-6">
          <span className="font-headline text-[11px] font-bold tracking-[0.05em] uppercase text-white border-b border-white py-1 px-1">
            EDITOR
          </span>
          <span className="font-headline text-[11px] font-bold tracking-[0.05em] uppercase text-ink-variant hover:bg-surface-high transition-colors py-1 px-1 rounded cursor-pointer">
            DEBUGGER
          </span>
          <span className="font-headline text-[11px] font-bold tracking-[0.05em] uppercase text-ink-variant hover:bg-surface-high transition-colors py-1 px-1 rounded cursor-pointer">
            LOGS
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-surface-high flex items-center px-2 py-1 rounded border border-outline-variant w-64">
          <Search className="w-4 h-4 text-ink-variant mr-2" />
          <input
            className="bg-transparent border-none focus:outline-none text-[12px] w-full text-ink placeholder-ink-variant/40 font-body"
            placeholder="Search files..."
            type="text"
            readOnly
          />
        </div>
        <div className="flex items-center gap-1">
          <button className="text-ink-variant hover:text-ink p-1 transition-colors">
            <Terminal className="w-[18px] h-[18px]" />
          </button>
          <button className="text-ink-variant hover:text-ink p-1 transition-colors">
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <div className="h-7 w-7 rounded bg-surface-high border border-outline-variant overflow-hidden ml-1" />
        </div>
      </div>
    </header>
  );
}
