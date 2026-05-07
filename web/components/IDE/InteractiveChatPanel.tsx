"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Wrench, Cpu, ToggleLeft, ToggleRight } from "lucide-react";
import type { ChatConfig, ChatMessage } from "@/lib/schema";

type Props = {
  chatConfig: ChatConfig;
  onFileGenerated?: (filename: string, content: string) => void;
};

export function InteractiveChatPanel({ chatConfig, onFileGenerated }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(chatConfig.defaultPrompt ?? "");
  const [disabled, setDisabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(
    chatConfig.systemPrompts?.[0]?.id ?? null
  );
  const [toolStates, setToolStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    chatConfig.tools?.forEach((t) => { initial[t.id] = t.enabled; });
    return initial;
  });
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  const getConversationKey = useCallback((): string => {
    switch (chatConfig.mode) {
      case "model-picker":
        return selectedModel ?? "default";
      case "tool-toggles": {
        const anyEnabled = Object.values(toolStates).some(Boolean);
        return anyEnabled ? "enabled" : "disabled";
      }
      case "system-prompt":
        return selectedPrompt ?? "default";
      case "multi-turn":
        return `turn_${turnCount + 1}`;
      default:
        return "default";
    }
  }, [chatConfig.mode, selectedModel, toolStates, selectedPrompt, turnCount]);

  const handleSend = useCallback(() => {
    if (!input.trim() || disabled) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const key = getConversationKey();
    const response = chatConfig.conversations[key] ?? chatConfig.conversations["default"] ?? [];

    if (chatConfig.mode === "streaming") {
      setDisabled(true);
      const fullText = response
        .filter((m) => m.role === "assistant")
        .map((m) => m.content)
        .join("\n");

      let idx = 0;
      setStreamingText("");
      const interval = setInterval(() => {
        idx++;
        setStreamingText(fullText.slice(0, idx));
        if (idx >= fullText.length) {
          clearInterval(interval);
          setStreamingText(null);
          setMessages((prev) => [...prev, ...response]);
        }
      }, 25);
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, ...response]);
        if (chatConfig.mode === "code-gen" && chatConfig.generatedFile) {
          onFileGenerated?.(chatConfig.generatedFile.filename, chatConfig.generatedFile.content);
        }
        if (chatConfig.mode !== "multi-turn") {
          setDisabled(true);
        } else {
          setTurnCount((c) => c + 1);
          if (turnCount >= 1) {
            setDisabled(true);
          }
        }
      }, 400);
    }

    if (chatConfig.mode !== "multi-turn" && chatConfig.mode !== "streaming") {
      setDisabled(true);
    }
  }, [input, disabled, getConversationKey, chatConfig, onFileGenerated, turnCount]);

  return (
    <aside className="w-96 bg-surface-container-low border-l border-outline-variant flex flex-col shrink-0">
      <div className="p-3 flex items-center gap-2 border-b border-outline-variant/20">
        <Bot className="w-5 h-5 text-ink" />
        <span className="font-headline text-[18px] font-semibold tracking-tight text-ink">
          AI ASSISTANT
        </span>
      </div>

      {chatConfig.mode === "model-picker" && chatConfig.models && (
        <ModelPickerSection
          models={chatConfig.models}
          selected={selectedModel}
          onSelect={setSelectedModel}
        />
      )}

      {chatConfig.mode === "tool-toggles" && chatConfig.tools && (
        <ToolToggleSection
          tools={chatConfig.tools}
          states={toolStates}
          onToggle={(id) => setToolStates((s) => ({ ...s, [id]: !s[id] }))}
        />
      )}

      {chatConfig.mode === "system-prompt" && chatConfig.systemPrompts && (
        <SystemPromptSection
          prompts={chatConfig.systemPrompts}
          selected={selectedPrompt}
          onSelect={setSelectedPrompt}
        />
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {streamingText !== null && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                <Bot className="w-3 h-3 text-night" />
              </div>
              <span className="font-headline text-[10px] font-bold tracking-wider uppercase text-ink">
                STREAMING
              </span>
            </div>
            <div className="bg-surface-low p-3 rounded border border-outline-variant">
              <p className="font-code text-[12px] text-ink-variant whitespace-pre-wrap">
                {streamingText}
                <span className="animate-pulse inline-block w-1.5 h-3 bg-primary ml-0.5" />
              </p>
            </div>
          </div>
        )}
        {messages.length === 0 && streamingText === null && (
          <div className="flex items-center justify-center h-full text-ink-variant text-[12px] opacity-50">
            Send a message to interact with the agent
          </div>
        )}
      </div>

      <div className="p-3 border-t border-outline-variant bg-surface-container-low">
        <div className="bg-surface-low rounded border border-outline-variant focus-within:border-ink transition-all overflow-hidden">
          <textarea
            className="w-full bg-transparent border-none focus:outline-none text-[12px] p-2 resize-none h-16 text-ink placeholder-ink-variant/30 font-body"
            placeholder={disabled ? "Session complete" : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex items-center justify-end p-2 bg-surface-low">
            <button
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              className="bg-ink text-night h-7 px-3 rounded text-[10px] font-bold uppercase hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              SEND
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ModelPickerSection({
  models,
  selected,
  onSelect,
}: {
  models: { id: string; label: string; description: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="p-3 border-b border-outline-variant/20 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="w-4 h-4 text-primary" />
        <span className="font-headline text-[10px] font-bold tracking-wider uppercase text-ink-variant">
          SELECT MODEL
        </span>
      </div>
      <div className="space-y-1.5">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`w-full text-left p-2 rounded border transition-all ${
              selected === m.id
                ? "border-primary bg-primary/10 text-ink"
                : "border-outline-variant/30 bg-surface-low text-ink-variant hover:border-ink-variant"
            }`}
          >
            <div className="font-headline text-[11px] font-bold">{m.label}</div>
            <div className="font-body text-[10px] opacity-70">{m.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolToggleSection({
  tools,
  states,
  onToggle,
}: {
  tools: { id: string; name: string }[];
  states: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="p-3 border-b border-outline-variant/20 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-4 h-4 text-primary" />
        <span className="font-headline text-[10px] font-bold tracking-wider uppercase text-ink-variant">
          AVAILABLE TOOLS
        </span>
      </div>
      <div className="space-y-1.5">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => onToggle(t.id)}
            className="w-full flex items-center justify-between p-2 rounded border border-outline-variant/30 bg-surface-low hover:border-ink-variant transition-all"
          >
            <span className="font-code text-[11px] text-ink">{t.name}</span>
            {states[t.id] ? (
              <ToggleRight className="w-5 h-5 text-primary" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-ink-variant/50" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function SystemPromptSection({
  prompts,
  selected,
  onSelect,
}: {
  prompts: { id: string; label: string; prompt: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="p-3 border-b border-outline-variant/20 space-y-2">
      <span className="font-headline text-[10px] font-bold tracking-wider uppercase text-ink-variant">
        SYSTEM PROMPT
      </span>
      <div className="flex gap-1">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
              selected === p.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-outline-variant/30 text-ink-variant hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="p-2 bg-surface-low rounded border border-outline-variant/30 max-h-24 overflow-y-auto">
          <p className="font-code text-[10px] text-ink-variant whitespace-pre-wrap">
            {prompts.find((p) => p.id === selected)?.prompt}
          </p>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex flex-col gap-1 items-end">
        <div className="bg-surface-high p-2 px-3 rounded border border-outline-variant/30 max-w-[90%]">
          <p className="font-body text-[12px] text-ink whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === "tool") {
    return (
      <div className="flex flex-col gap-1">
        <div className="bg-surface-hover/50 p-2 rounded border border-outline-variant/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Wrench className="w-3 h-3 text-primary" />
            <span className="font-headline text-[9px] font-bold tracking-wider uppercase text-primary">
              {message.toolName}
            </span>
          </div>
          {message.toolArgs && (
            <div className="font-code text-[10px] text-ink-variant mb-1">
              {Object.entries(message.toolArgs).map(([k, v]) => (
                <div key={k}><span className="text-code-keyword">{k}</span>: {v}</div>
              ))}
            </div>
          )}
          <div className="font-code text-[10px] text-ink whitespace-pre-wrap border-t border-outline-variant/30 pt-1 mt-1">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
          <Bot className="w-3 h-3 text-night" />
        </div>
        <span className="font-headline text-[10px] font-bold tracking-wider uppercase text-ink">
          ASSISTANT
        </span>
      </div>
      <div className="bg-surface-low p-3 rounded border border-outline-variant">
        <p className="font-body text-[12px] text-ink-variant whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
