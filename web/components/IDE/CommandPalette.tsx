"use client";

import { PlayCircle, Terminal } from "lucide-react";

export function CommandPalette() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-surface-high border border-outline-variant shadow-2xl rounded px-4 h-9 gap-4">
      <div className="flex items-center gap-2 border-r border-outline-variant/30 pr-4">
        <span className="font-headline text-[10px] font-bold tracking-wider uppercase text-primary">
          AGENT: RUNNING
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-ink-variant hover:text-ink transition-colors flex items-center gap-1.5">
          <PlayCircle className="w-4 h-4" />
          <span className="font-headline text-[10px] font-bold tracking-wider uppercase">EXECUTE</span>
        </button>
        <button className="text-ink-variant hover:text-ink transition-colors flex items-center gap-1.5">
          <Terminal className="w-4 h-4" />
          <span className="font-headline text-[10px] font-bold tracking-wider uppercase">LOGS</span>
        </button>
      </div>
      <div className="pl-4 border-l border-outline-variant/30 flex items-center gap-1 text-ink-variant">
        <span className="text-[9px] font-bold opacity-50">CTRL + K</span>
      </div>
    </div>
  );
}
