# Orion — AI Coding Agent

A full-featured, Cursor-inspired AI coding agent built as a demo product for Day 13 of the AI Accelerator. Orion combines a **React + TypeScript frontend** with a **FastAPI + LangGraph backend** to deliver an interactive IDE experience powered by AI.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite + TypeScript + TailwindCSS)         │
│  ┌──────────┬───────────────────┬──────────┬──────────────┐ │
│  │ Activity │  File Explorer /  │  Monaco  │  Chat Panel  │ │
│  │  Bar     │  Agent / Rules /  │  Editor  │  (streaming) │ │
│  │          │  Time Travel      │  + Tabs  │              │ │
│  │          │                   ├──────────┤              │ │
│  │          │                   │ Terminal │              │ │
│  └──────────┴───────────────────┴──────────┴──────────────┘ │
│                         │ REST + SSE                        │
├─────────────────────────┼───────────────────────────────────┤
│  Backend (FastAPI + LangGraph)                              │
│  ┌──────────┬───────────┬───────────┬──────────┬─────────┐ │
│  │ Chat API │ Files API │ Agent API │ Terminal │ Rules   │ │
│  │  (SSE)   │ (CRUD)    │ (SSE)     │  API     │  API    │ │
│  └────┬─────┴───────────┴─────┬─────┴──────────┴─────────┘ │
│       │                       │                             │
│  ┌────▼────┐          ┌───────▼──────────────┐              │
│  │  Chat   │          │    Orchestrator       │              │
│  │  Graph  │          │  Plan → Code → Review │              │
│  │ (NB1)   │          │  → Human → Apply →    │              │
│  │         │          │    Test  (NB3)         │              │
│  └─────────┘          └──────────────────────┘              │
│       │                       │                             │
│  ┌────▼───────────────────────▼────┐                        │
│  │  FAISS RAG  │  Tools  │  State  │                        │
│  │  (codebase) │ (files, │ (check- │                        │
│  │             │  shell) │  point) │                        │
│  └─────────────┴─────────┴─────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- **Python 3.10+** with the `accelerator` conda environment (all Python packages are pre-installed)
- **Node.js 18+** and npm
- An **OpenRouter API key** — get one at [openrouter.ai](https://openrouter.ai)

---

## Quick Start

### 1. Install frontend dependencies

```bash
cd Day_13/orion/frontend
npm install
```

### 2. (Optional) Set API key in environment

You can either set it in a `.env` file or enter it directly in the UI.

```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

### 3. Start the backend

```bash
cd Day_13/orion/backend
conda activate accelerator
uvicorn main:app --port 8000 --reload
```

### 4. Start the frontend (in a separate terminal)

```bash
cd Day_13/orion/frontend
npm run dev
```

### 5. Open the app

Navigate to **http://localhost:5173** in your browser.

---

## Entering Your API Key

When you first open Orion, the chat panel displays an **API Key Required** prompt. You have two options:

1. **In the UI** — Paste your OpenRouter API key into the input field and click **Set Key**. You can also access this later via the gear icon in the chat panel header.
2. **Via `.env` file** — Set `OPENROUTER_API_KEY=sk-or-...` in `Day_13/orion/.env`. The backend reads this on startup as a fallback.

---

## Selecting a Model

Click the **gear icon** in the chat panel header to open settings. The **Model** dropdown lets you choose from 9 pre-configured OpenRouter models:

| Model | Best For |
|---|---|
| GPT-4o Mini | Fast, affordable general use |
| GPT-4o | Most capable GPT model |
| Claude Sonnet | Balanced performance |
| Claude 3 Haiku | Fast and compact |
| Gemini 2.0 Flash | Google's fast model |
| Llama 3.3 70B | Open-source large model |
| DeepSeek V3 | Strong coding tasks |
| Mistral Large | Mistral's flagship |
| Qwen 2.5 72B | Alibaba's large model |

The selected model is used for all Chat and Agent interactions.

---

## Features

### 1. Chat (NB1 — Agent Loop)

The right panel is a streaming chat interface. Type a message and press **Enter** to send. Orion responds token-by-token in real time via Server-Sent Events.

The chat agent has access to workspace tools — it can read files, write files, list directories, and execute shell commands when you ask it to. Tool calls appear inline in the conversation.

**How to use:**
- Type questions or requests in the chat input
- Shift+Enter for newlines
- Click the trash icon to clear the conversation

### 2. Code Editor with Monaco (NB1 — Tool Use)

Click any file in the Explorer sidebar to open it in the central Monaco editor. The editor provides:

- Full syntax highlighting for Python, JavaScript, TypeScript, JSON, CSS, HTML, and more
- Line numbers, minimap, and cursor blinking
- Multiple file tabs with close buttons and modified indicators

**How to use:**
- Click a file in the Explorer to open it
- Edit code directly in the editor
- **Ctrl+S / Cmd+S** to save the file back to disk

### 3. Inline Edit — Cmd+K (NB2 — Inline Edit)

Select code in the editor, then press **Ctrl+K / Cmd+K** to open the inline edit overlay. Describe the change you want (e.g., "add type hints", "refactor to use a class"), and Orion modifies just the selected code.

**How to use:**
1. Select code in the editor
2. Press **Ctrl+K**
3. Type an instruction (e.g., "add error handling")
4. Click **Apply** — the modified code replaces the selection
5. Press **Escape** to cancel

### 4. Rules — .cursorrules Equivalent (NB2 — Dynamic Rules)

Click the **scroll icon** in the activity bar to open the Rules editor. Rules are injected into every AI interaction to shape code style and conventions.

**How to use:**
1. Click the Rules icon in the activity bar (third icon)
2. Type your coding standards (e.g., "Always use type hints. Follow PEP 8. Use descriptive variable names.")
3. Click **Save Rules**
4. All subsequent Chat and Agent interactions will follow these rules

### 5. File Explorer (NB3 — @codebase / @file)

The left sidebar shows the workspace file tree. Files are color-coded by type:
- Yellow — Python (.py)
- Blue — TypeScript (.ts, .tsx)
- Pink — CSS
- Orange — HTML

The workspace starts with the sample project from Day 3: `app.py`, `chat.py`, `config.py`.

### 6. Integrated Terminal (NB3 — execute_shell)

The bottom panel is a terminal. Type shell commands and press **Enter** to execute them in the workspace directory.

**How to use:**
- Type a command (e.g., `ls -la`, `python config.py`, `cat app.py`)
- Press **Enter** to execute
- Output appears above the input
- Click the trash icon to clear history
- Toggle visibility via the terminal icon in the activity bar

### 7. Agent Mode (NB3 — Full Orchestrator)

Click the **robot icon** in the activity bar to open Agent Mode. This is the full production coding agent that autonomously plans, codes, reviews, and applies multi-file changes.

**How to use:**
1. Click the Agent icon (second icon in the activity bar)
2. Type a feature request (e.g., "Add a system prompt configuration to the chatbot")
3. Click **Run Agent**
4. Watch the agent progress through stages:
   - **Planning** — Analyzes the codebase via RAG and creates a structured plan
   - **Coding** — Generates code for each file in the plan
   - **Reviewing** — AI reviewer checks code quality (auto-approves after 2 rejections)
   - **Waiting for Approval** — Pauses for your review before writing to disk

### 8. Human-in-the-Loop Review (NB3 — interrupt + Command)

When the agent finishes coding and reviewing, a **Review Dialog** modal appears. It shows:

- The implementation plan
- The AI reviewer's feedback
- Each proposed file change with a code preview

**How to use:**
- Read through the proposed changes
- Click **Approve** to write the changes to disk and run tests
- Click **Reject** to send the agent back to regenerate code
- The file explorer refreshes automatically after changes are applied

### 9. Time Travel Debugger (NB3 — get_state_history)

Click the **clock icon** in the activity bar to open the Time Travel panel. This shows every checkpoint the agent recorded during execution.

**How to use:**
1. Run the agent on a feature request
2. Switch to the Time Travel view
3. Click the **refresh** button to load the checkpoint history
4. Each step shows: step number, status badge, and next nodes
5. Click a step to expand and see the full state at that checkpoint

### 10. Codebase RAG (NB3 — FAISS Search)

When the agent runs, it automatically indexes all Python files in the workspace using FAISS vector embeddings. The planner retrieves the most relevant code chunks before creating its plan. This is the equivalent of Cursor's `@codebase` and `@file` features.

This happens automatically — no user action needed.

### 11. Self-Correcting Code (NB2 — Bugbot)

The agent's code generation includes a review loop. If the AI reviewer rejects the generated code, the agent regenerates with the reviewer's feedback. After 2 rejections, the code is auto-approved and forwarded to the human for the final decision.

### 12. Session Persistence (NB3 — MemorySaver)

Each agent run creates a thread with a unique ID. The agent's state is checkpointed at every step using LangGraph's `MemorySaver`. This enables:

- Interrupt and resume (the human review pause)
- Time travel through past decisions
- Multiple independent agent sessions

### 13. Parallel Code Generation (NB3 — Send API)

When the agent's plan includes multiple files, they can be generated in parallel using LangGraph's `Send` API with a reducer to merge results. The Agent panel shows the status of each file task independently.

---

## Project Structure

```
Day_13/orion/
├── .env.example                    # API key template
├── README.md
├── backend/
│   ├── main.py                     # FastAPI app, CORS, router mounting
│   ├── config.py                   # Settings, model list, workspace path
│   ├── requirements.txt            # Python dependencies
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response models
│   ├── agent/
│   │   ├── state.py                # OrchestratorState, ParallelState
│   │   ├── tools.py                # read_file, write_file, list_directory, execute_shell
│   │   ├── rag.py                  # FAISS codebase indexing + retrieval
│   │   ├── planner.py              # Structured Plan with FileTask list
│   │   ├── coder.py                # CodeResult generator with review feedback
│   │   ├── reviewer.py             # ReviewResult with auto-approve logic
│   │   ├── chat_graph.py           # Simple agent loop (agent <-> tools)
│   │   └── graph.py                # Full orchestrator with interrupt + checkpointing
│   ├── routers/
│   │   ├── chat.py                 # POST /api/chat (SSE streaming)
│   │   ├── files.py                # GET/PUT /api/files
│   │   ├── agent.py                # POST /api/agent/run, /approve, GET /history
│   │   ├── terminal.py             # POST /api/terminal/execute
│   │   └── rules.py                # GET/PUT /api/rules
│   └── workspace/                  # Sandboxed demo project (Day 3 ChatGPT clone)
│       ├── app.py
│       ├── chat.py
│       └── config.py
└── frontend/
    ├── package.json
    ├── vite.config.ts              # Dev server + proxy to backend
    ├── tailwind.config.js          # Cursor-inspired dark theme colors
    └── src/
        ├── App.tsx
        ├── index.css               # Global styles + custom scrollbar
        ├── types/index.ts          # TypeScript interfaces
        ├── store/useStore.ts       # Zustand global state
        ├── api/client.ts           # REST + SSE streaming helpers
        └── components/
            ├── Layout.tsx          # IDE shell with resizable panels
            ├── ActivityBar.tsx     # Left icon navigation rail
            ├── FileExplorer.tsx    # Recursive file tree
            ├── EditorTabs.tsx      # Open file tab bar
            ├── CodeEditor.tsx      # Monaco editor wrapper
            ├── ChatPanel.tsx       # Streaming chat + settings
            ├── ChatMessage.tsx     # Message rendering with markdown + code
            ├── Terminal.tsx        # Command execution terminal
            ├── AgentPanel.tsx      # Agent mode controls + status
            ├── ReviewDialog.tsx    # Human approval modal
            ├── TimeTravel.tsx      # Checkpoint history viewer
            ├── RulesEditor.tsx     # .cursorrules editor
            └── InlineEdit.tsx      # Ctrl+K inline edit overlay
```

---

## Cursor Feature Mapping

Every feature in Orion maps directly to a concept from the Day 13 notebooks:

| Cursor Feature | Orion Implementation | Notebook |
|---|---|---|
| Chat | Streaming chat with tool-calling agent | NB1 |
| Agent Mode | Plan -> Code -> Review -> Apply orchestrator | NB3 |
| Tab Completion | System prompt shapes code style | NB1 |
| Inline Edit (Cmd+K) | Selected code + instruction -> modified code | NB2 |
| Bugbot | Execute -> detect error -> regenerate with context | NB2 |
| Rules (.cursorrules) | Dynamic rules injection via state | NB2 |
| @codebase / @file | FAISS RAG over workspace Python files | NB3 |
| Terminal | Shell command execution via subprocess | NB3 |
| Code Review | AI reviewer with auto-approve after 2 rejections | NB3 |
| Apply with Approval | LangGraph interrupt + Command for human gate | NB3 |
| Parallel Agents | Send API fan-out with reducer merge | NB3 |
| Session Persistence | MemorySaver checkpointing + thread IDs | NB3 |
| Time Travel | get_state_history over checkpointed states | NB3 |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/files` | File tree of the workspace |
| GET | `/api/files/{path}` | Read a file's content |
| PUT | `/api/files/{path}` | Write content to a file |
| POST | `/api/chat` | Chat with streaming (SSE) |
| POST | `/api/agent/run` | Run the agent on a feature request (SSE) |
| POST | `/api/agent/approve` | Approve or reject agent changes (SSE) |
| GET | `/api/agent/history/{id}` | Get checkpoint history for a thread |
| POST | `/api/terminal/execute` | Execute a shell command |
| GET | `/api/rules` | Read .cursorrules content |
| PUT | `/api/rules` | Update .cursorrules content |
| GET | `/api/models` | List available LLM models |

---

## Tech Stack

**Frontend:** React 18, TypeScript, Vite 6, TailwindCSS 3, Monaco Editor, Zustand, react-markdown, react-syntax-highlighter, react-resizable-panels, lucide-react

**Backend:** FastAPI, LangGraph, LangChain, FAISS, Pydantic v2, OpenRouter (OpenAI-compatible API)
