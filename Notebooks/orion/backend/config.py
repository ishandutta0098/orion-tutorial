import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

WORKSPACE_PATH = str(Path(__file__).parent / "workspace")
DEFAULT_MODEL = "openai/gpt-4o-mini"
BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

AVAILABLE_MODELS = [
    {"id": "openai/gpt-4o-mini", "name": "GPT-4o Mini", "description": "Fast and affordable"},
    {"id": "openai/gpt-4o", "name": "GPT-4o", "description": "Most capable GPT-4 model"},
    {"id": "anthropic/claude-sonnet-4", "name": "Claude Sonnet", "description": "Balanced performance"},
    {"id": "anthropic/claude-3-haiku", "name": "Claude 3 Haiku", "description": "Fast and compact"},
    {"id": "google/gemini-2.0-flash-001", "name": "Gemini 2.0 Flash", "description": "Google's fast model"},
    {"id": "meta-llama/llama-3.3-70b-instruct", "name": "Llama 3.3 70B", "description": "Open source large model"},
    {"id": "deepseek/deepseek-chat-v3-0324", "name": "DeepSeek V3", "description": "Strong coding model"},
    {"id": "mistralai/mistral-large", "name": "Mistral Large", "description": "Mistral's flagship"},
    {"id": "qwen/qwen-2.5-72b-instruct", "name": "Qwen 2.5 72B", "description": "Alibaba's large model"},
]
