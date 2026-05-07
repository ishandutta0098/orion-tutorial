# Orion Tutorial

An interactive tutorial series for building AI coding agents with LangChain and LangGraph — presented as a Cursor-like IDE experience in the browser.

**Live:** https://orion-tutorial.vercel.app/

---

## What's Inside

- **Notebooks/** — Jupyter notebooks with all Python code for each tutorial
- **web/** — Next.js 15 web app with an IDE-style UI for exploring chapters

The web app renders each tutorial chapter as a full-viewport code editor (dark IDE theme, file explorer, AI assistant panel) matching the design from the Stitch Orion project.

### Notebooks covered

| Notebook | Topic |
|----------|-------|
| 01 | Code Generator with Tools (ch01–ch07) |
| 02 | Self-Correcting Code Agent |

---

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+ (for running notebooks)

### Web App

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Notebooks

```bash
pip install langchain langchain-openai langgraph python-dotenv
```

Create a `.env` file in the repo root:

```
OPENROUTER_API_KEY=your_key_here
```

Then open any notebook in the `Notebooks/` directory:

```bash
jupyter lab Notebooks/01_code_generator_with_tools.ipynb
```

---

## Web App Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Stack

- **Next.js 15** — App Router, static generation
- **React 19** — UI
- **Tailwind CSS** — Styling with custom Orion design tokens
- **TypeScript** — Full type safety
- **LangChain / LangGraph** — Agent framework (notebooks)
- **OpenRouter** — LLM gateway
