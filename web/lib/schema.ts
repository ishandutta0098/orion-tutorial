export type LogTag =
  | "BOOT"
  | "INFO"
  | "OK"
  | "STREAM"
  | "WARN"
  | "ERROR"
  | "SUCCESS"
  | "PROCESS"
  | "TOOL"
  | "RETRY";

export type LogLine = {
  tag?: LogTag;
  text: string;
  ts?: string;
};

export type CodeFile = {
  filename: string;
  language: string;
  content: string;
};

export type TraceStep = {
  type: "human" | "ai" | "tool";
  content: string;
  toolName?: string;
  toolArgs?: string[];
};

export type FixturePair = {
  label: string;
  description: string;
  log: LogLine[];
  output: string;
  paramSnippet?: string;
  codeFile?: CodeFile;
  trace?: TraceStep[];
};

export type DemoOption = {
  key: string;
  label: string;
  description: string;
};

export type DemoInputFile = {
  filename: string;
  preview: string;
};

export type DemoDef = {
  id: string;
  question: string;
  controlLabel: string;
  options: DemoOption[];
  defaultLeft: string;
  defaultRight: string;
  variants: Record<string, FixturePair>;
  inputFile?: DemoInputFile;
};

export type NotebookId = "Notebook 01" | "Notebook 02" | "Notebook 03";

export type AIExchange = {
  userMessage: string;
  aiLabel: string;
  aiDescription: string;
  aiCodeSnippet?: string;
};

export type ChapterDef = {
  slug: string;
  number: number;
  notebook: NotebookId;
  title: string;
  subtitle: string;
  intro: string;
  takeaway: string;
  demos: DemoDef[];
  cursorFeature?: string;
  designPatterns?: string[];
  codeContent?: string;
  codeFilename?: string;
  backendCode?: string;
  backendFilename?: string;
  aiExchange?: AIExchange;
};
