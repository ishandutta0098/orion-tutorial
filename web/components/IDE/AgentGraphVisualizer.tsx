"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type GraphNode = "__start__" | "agent" | "tools" | "__end__";

const ANIMATION_SEQUENCE: GraphNode[] = ["__start__", "agent", "tools", "agent", "__end__"];

const NODES: { id: GraphNode; label: string; position: string }[] = [
  { id: "__start__", label: "__start__", position: "left-1/2 top-3 -translate-x-1/2" },
  { id: "agent", label: "agent", position: "left-1/2 top-[86px] -translate-x-1/2" },
  { id: "tools", label: "tools", position: "right-8 bottom-6" },
  { id: "__end__", label: "__end__", position: "left-8 bottom-6" },
];

export function AgentGraphVisualizer({ runKey }: { runKey: number }) {
  const [visible, setVisible] = useState(true);
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (runKey === 0) return;

    const timers = ANIMATION_SEQUENCE.map((node, index) =>
      window.setTimeout(() => setActiveNode(node), index * 700)
    );
    timers.push(window.setTimeout(() => setActiveNode(null), ANIMATION_SEQUENCE.length * 700));

    return () => timers.forEach(window.clearTimeout);
  }, [runKey]);

  return (
    <section className="border-b border-outline-variant bg-surface-container-low">
      <button
        onClick={() => setVisible((current) => !current)}
        className="flex w-full items-center justify-between px-3 py-2 text-left font-headline text-[10px] font-bold uppercase tracking-wider text-ink-variant hover:text-ink"
      >
        Agent Graph Visualizer
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {visible && (
        <div className="relative mx-3 mb-3 h-48 overflow-hidden rounded border border-outline-variant bg-night">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 190" aria-hidden="true">
            <path d="M210 38 L210 78" stroke="currentColor" className="text-outline-variant" fill="none" />
            <path d="M210 118 L85 145" stroke="currentColor" className="text-outline-variant" fill="none" strokeDasharray="3 3" />
            <path d="M225 118 L330 145" stroke="currentColor" className="text-outline-variant" fill="none" strokeDasharray="3 3" />
            <path d="M332 138 C368 94 290 87 247 91" stroke="currentColor" className="text-outline-variant" fill="none" />
          </svg>
          {NODES.map((node) => {
            const isActive = activeNode === node.id;

            return (
              <div
                key={node.id}
                className={`absolute ${node.position} rounded border px-4 py-2 font-code text-[12px] transition-all duration-300 ${
                  isActive
                    ? "border-primary bg-primary/20 text-white shadow-[0_0_24px_rgba(85,99,255,0.35)]"
                    : "border-primary/60 bg-surface-low text-ink"
                }`}
              >
                {node.label}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
