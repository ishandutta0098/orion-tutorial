import type { ChapterDef } from "../schema";

export const ch01: ChapterDef = {
  slug: "setting-up-llm",
  number: 1,
  notebook: "Notebook 01",
  subtopicLabel: "1.1 LLM Setup",
  title: "Setting Up LLM + OpenRouter",
  subtitle:
    "Connect to any LLM through OpenRouter and make your first API call with LangChain.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Tool Use"],
  intro:
    "Every AI coding agent starts with an LLM connection. In this chapter you'll configure OpenRouter as your model gateway, initialize a ChatOpenAI instance with LangChain, and verify the pipeline end-to-end. This is the foundation — once the LLM responds, you can layer tools, memory, and orchestration on top.",
  takeaway:
    "A single LLM call through OpenRouter gives you access to dozens of models via a unified API. LangChain's ChatOpenAI abstraction keeps your agent code model-agnostic, so you can swap providers without rewriting logic.",
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
  chatConfig: {
    mode: "model-picker",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini", description: "Fast and affordable — great for simple tasks" },
      { id: "gpt-4o", label: "GPT-4o", description: "Most capable — better reasoning and code quality" },
      { id: "claude-sonnet", label: "Claude Sonnet", description: "Balanced speed and intelligence" },
    ],
    defaultPrompt: "Say hello in one sentence.",
    conversations: {
      "gpt-4o-mini": [
        { role: "assistant", content: "Hello! How can I assist you today?" },
      ],
      "gpt-4o": [
        { role: "assistant", content: "Hello there! I'm ready to help you with any coding tasks — from writing functions to debugging complex systems. What would you like to work on?" },
      ],
      "claude-sonnet": [
        { role: "assistant", content: "Hi! I'm here to help you write clean, well-structured code. What can I build for you?" },
      ],
      default: [
        { role: "assistant", content: "Hello! How can I assist you today?" },
      ],
    },
  },
  demos: [],
};
