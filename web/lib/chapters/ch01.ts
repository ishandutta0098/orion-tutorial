import type { ChapterDef } from "../schema";

export const ch01: ChapterDef = {
  slug: "setting-up-llm",
  number: 1,
  notebook: "Notebook 01",
  title: "Setting Up LLM + OpenRouter",
  subtitle:
    "Connect to any LLM through OpenRouter and make your first API call with LangChain.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Tool Use"],
  intro:
    "Every AI coding agent starts with an LLM connection. In this chapter you'll configure OpenRouter as your model gateway, initialize a ChatOpenAI instance with LangChain, and verify the pipeline end-to-end. This is the foundation — once the LLM responds, you can layer tools, memory, and orchestration on top.",
  takeaway:
    "A single LLM call through OpenRouter gives you access to dozens of models via a unified API. LangChain's ChatOpenAI abstraction keeps your agent code model-agnostic, so you can swap providers without rewriting logic.",
  demos: [
    {
      id: "llm-setup-compare",
      question: "How does model choice affect code generation quality?",
      controlLabel: "Model",
      defaultLeft: "basic",
      defaultRight: "advanced",
      options: [
        {
          key: "basic",
          label: "GPT-3.5 Turbo",
          description: "Fast, cheaper model — good for simple tasks.",
        },
        {
          key: "advanced",
          label: "GPT-4o",
          description: "More capable — better reasoning and code quality.",
        },
      ],
      variants: {
        basic: {
          label: "GPT-3.5 Turbo",
          description: "Basic model response",
          log: [
            { tag: "BOOT", text: "Initializing ChatOpenAI via OpenRouter..." },
            { tag: "INFO", text: "Model: gpt-3.5-turbo" },
            { tag: "INFO", text: "Temperature: 0.0" },
            { tag: "PROCESS", text: "Sending prompt: 'Write a Python fibonacci function'" },
            { tag: "STREAM", text: "Receiving tokens..." },
            { tag: "OK", text: "Response complete. 45 tokens." },
          ],
          output: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`,
        },
        advanced: {
          label: "GPT-4o",
          description: "Advanced model response",
          log: [
            { tag: "BOOT", text: "Initializing ChatOpenAI via OpenRouter..." },
            { tag: "INFO", text: "Model: gpt-4o" },
            { tag: "INFO", text: "Temperature: 0.0" },
            { tag: "PROCESS", text: "Sending prompt: 'Write a Python fibonacci function'" },
            { tag: "STREAM", text: "Receiving tokens..." },
            { tag: "OK", text: "Response complete. 82 tokens." },
          ],
          output: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    """Return the nth Fibonacci number (0-indexed)."""
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

if __name__ == "__main__":
    for i in range(11):
        print(f"F({i}) = {fibonacci(i)}")`,
        },
      },
    },
  ],
};
