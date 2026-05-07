import type { LogLine as LogLineType, LogTag } from "@/lib/schema";

const TAG_COLOR: Record<LogTag, string> = {
  BOOT: "#A0A0A0",
  INFO: "#BBC3FF",
  OK: "#B8EF43",
  STREAM: "#A0A0A0",
  WARN: "#FFD166",
  ERROR: "#FF5F57",
  SUCCESS: "#B8EF43",
  PROCESS: "#DDB7FF",
  TOOL: "#FFB599",
  RETRY: "#FF8C00",
};

export function LogLine({ line, index }: { line: LogLineType; index: number }) {
  const ts = line.ts ?? `0:${(index * 0.4).toFixed(2).padStart(5, "0")}`;
  const color = line.tag ? TAG_COLOR[line.tag] : "#E5E2E1";
  return (
    <div className="font-code text-xs leading-relaxed flex gap-3 animate-log-in">
      <span className="text-gray3 shrink-0">[{ts}]</span>
      {line.tag ? (
        <span className="shrink-0 font-bold" style={{ color }}>
          [{line.tag}]
        </span>
      ) : null}
      <span className="text-gray2 break-words">{line.text}</span>
    </div>
  );
}
