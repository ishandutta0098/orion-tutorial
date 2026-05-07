# Day 12 v2 — Contents & Design Patterns

## Notebook 1: Code Generator with Tools

- Setting up LLM with OpenRouter
- Defining tools with `@tool` decorator (auto-schema from docstrings + type hints)
- File operation tools: `read_file`, `write_file`, `list_directory`
- `bind_tools` — letting the LLM decide when to use tools
- Building the Agent Graph with `MessagesState` and `ToolNode`
- Conditional routing: tool calls vs. final response
- Code generation task (generate + write to file)
- System prompt for shaping agent behavior (Cursor Rules equivalent)
- Streaming with `astream_events` (real-time token output)
- Multi-turn conversations (maintaining message history across turns)
- Step-by-step visibility (observing each agent step)

**Design Patterns:** Agent Loop, Tool Use

---

## Notebook 2: Self-Correcting Code Agent

- Structured output with `with_structured_output` (Pydantic-validated responses)
- Code execution via subprocess (capturing stdout/stderr)
- Self-correcting graph: Generate → Execute → retry on error (bounded retries)
- Watching the retry loop with `stream`
- Reflection pattern: Reviewer node that evaluates code quality post-execution
- Full pipeline: Generate → Execute → Review (two conditional loops)
- Custom rules injection at runtime (dynamic state, equivalent to `.cursorrules`)
- Inline edit — modifying existing code based on instructions
- Combining rules + inline edit (enforcing rules while editing legacy code)

**Design Patterns:** Prompt Chaining, Reflection, Exception Handling

---

## Notebook 3: Production Coding Agent

- Codebase RAG with FAISS (semantic search over code — `@codebase` / `@file` equivalent)
- Toolkit: `search_codebase`, `read_file`, `write_file`, `execute_shell`
- Structured planner with `with_structured_output` (Plan + FileTask schemas)
- Orchestrator state design (tracking feature request, plan, code, review, human decision)
- Specialist agents: Planner, Coder, Reviewer
- AI code review with auto-approve after 2 rejections (prevents infinite loops)
- Human-in-the-loop with `interrupt` + `Command` (pause for approval before applying)
- State checkpointing with `MemorySaver` (survives interruptions)
- Applying changes to disk + running tests
- Parallel code generation with `Send` API (fan-out to per-file coders)
- Reducers for merging parallel results
- Time-travel debugging through checkpointed state history
- End-to-end demo: multiple feature requests through the same agent

**Design Patterns:** Knowledge Retrieval, Tool Use, Planning, Multi-Agent, Reflection, Exception Handling, Human-in-the-Loop, Parallelization, Memory Management, Routing
