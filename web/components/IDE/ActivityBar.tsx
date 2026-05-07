"use client";

import { BookOpen, FolderOpen, Search, Bot, HelpCircle } from "lucide-react";

export function ActivityBar() {
  return (
    <nav className="bg-surface border-r border-outline-variant flex flex-col items-center py-3 gap-4 w-16 h-full shrink-0">
      <div className="mb-1">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <div className="text-white bg-white/10 border-l-2 border-white py-3 flex justify-center cursor-pointer">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="text-ink-variant hover:text-ink hover:bg-surface-high py-3 flex justify-center cursor-pointer transition-colors">
          <FolderOpen className="w-5 h-5" />
        </div>
        <div className="text-ink-variant hover:text-ink hover:bg-surface-high py-3 flex justify-center cursor-pointer transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <div className="text-ink-variant hover:text-ink hover:bg-surface-high py-3 flex justify-center cursor-pointer transition-colors">
          <Bot className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-1 w-full pb-1">
        <div className="text-ink-variant hover:text-ink hover:bg-surface-high py-3 flex justify-center cursor-pointer transition-colors">
          <HelpCircle className="w-5 h-5" />
        </div>
      </div>
    </nav>
  );
}
