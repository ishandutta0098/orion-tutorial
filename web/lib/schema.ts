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

export type FixturePair = {
  label: string;
  description: string;
  log: LogLine[];
  output: string;
  paramSnippet?: string;
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
};
