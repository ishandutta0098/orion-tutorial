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
  codeFilename: "hello_world.py",
  codeContent: `# Output from LLM call
# Model: openai/gpt-4o-mini via OpenRouter

"""
>>> response = llm.invoke("Say hello in one sentence.")
>>> print(response.content)

Hello! How can I assist you today?
"""

# Verifying the connection works:
# API Key loaded
# Response received in 0.8s
# Tokens used: 12`,
  backendFilename: "setting_up_llm.py",
  backendCode: `import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
print("API Key loaded" if api_key else "API Key NOT found")

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="openai/gpt-4o-mini",
    openai_api_key=api_key,
    openai_api_base="https://openrouter.ai/api/v1",
)

response = llm.invoke("Say hello in one sentence.")
print(response.content)`,
  aiExchange: {
    userMessage: "Set up the LLM connection with OpenRouter.",
    aiLabel: "CONFIGURING LLM",
    aiDescription: "Initializing ChatOpenAI with OpenRouter base URL and gpt-4o-mini model...",
    aiCodeSnippet: `llm = ChatOpenAI(
    model="openai/gpt-4o-mini",
    openai_api_key=api_key,
    openai_api_base="https://openrouter.ai/api/v1",
)`,
  },
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
