# Day 12 — Building an AI Coding Agent

> From zero to a production-grade coding agent in 3 notebooks. Every concept maps to a real Cursor feature so you understand **why** each piece exists, not just how to code it.

---

## The Big Picture

We build an AI coding agent incrementally across three notebooks. Each notebook gives the agent a new capability:

```
NB1: Hands        NB2: Self-Awareness       NB3: The Brain
┌──────────┐      ┌──────────────────┐      ┌─────────────────────────┐
│ Tools     │      │ Execute own code │      │ Plan across files       │
│ File I/O  │ ──►  │ Detect errors    │ ──►  │ Multi-agent review      │
│ Streaming │      │ Fix them         │      │ Human approval gate     │
│ Chat      │      │ Quality review   │      │ Parallel generation     │
└──────────┘      └──────────────────┘      │ Codebase RAG            │
                                             │ Time-travel debugging   │
                                             └─────────────────────────┘
```

**Sample Project:** The ChatGPT clone from Day 3 — a Streamlit chatbot (`app.py`, `chat.py`, `config.py`). The agent adds features to an app your students already know.

---

## Prerequisites

**Already covered in Day 10 (LangChain):**
- `ChatOpenAI`, `PromptTemplate`, `StrOutputParser`
- `Tool()` class, `AgentExecutor`, `create_react_agent`
- RAG with FAISS, document loaders, text splitters
- `RunnablePassthrough`, `RunnableParallel`

**Already covered in Day 11 (LangGraph):**
- `StateGraph`, `TypedDict`, `add_node`, `add_edge`, `add_conditional_edges`
- `START`, `END`, `compile`
- Basic state management and graph execution

**New in Day 12 (this tutorial):**

| Concept | Notebook | What It Does |
|---|---|---|
| `@tool` decorator | NB1 | Auto-generates tool schema from type hints + docstring |
| `bind_tools` | NB1 | Attaches tools to LLM so it decides when to call them |
| `ToolNode` | NB1 | Pre-built node that executes tool calls automatically |
| `MessagesState` | NB1 | Pre-built state with message list + append reducer |
| `astream_events` | NB1 | Stream tokens in real-time as the agent thinks |
| `with_structured_output` | NB2 | Force LLM to return Pydantic-validated responses |
| Conditional retry loop | NB2 | Route back to generator on error, bounded by max attempts |
| Reflection node | NB2 | Separate LLM call that reviews code quality |
| Dynamic rules injection | NB2 | Inject custom coding rules into prompts at runtime |
| `interrupt` + `Command` | NB3 | Pause graph for human review, then resume |
| `MemorySaver` | NB3 | Checkpoint state so it survives interruptions |
| `Send` API | NB3 | Dynamically fan-out work to parallel nodes |
| Reducers | NB3 | Merge results from parallel executions |
| Codebase RAG (FAISS) | NB3 | Semantic search over code for context retrieval |

---

## Environment Setup

```bash
conda activate accelerator
pip install langchain-openai langchain-community langchain-core langgraph python-dotenv pydantic faiss-cpu langchain-text-splitters
```

Required in `.env`:
```
OPENROUTER_API_KEY=your_key_here
```

---

## Notebook 1: Code Generator with Tools

**Cursor Features:** Chat, Agent Mode, Tab Completion, Rules

**Duration:** ~45 minutes

### What We Build

An agent that takes natural language, generates Python code, and reads/writes files — the core of any AI coding editor.

### Architecture

```
                    ┌──────────────┐
         ┌────────►│   Agent LLM  │◄────────┐
         │         │ (with tools) │         │
         │         └──────┬───────┘         │
         │                │                 │
         │         Has tool calls?          │
         │           /        \             │
         │         Yes         No           │
         │          │           │            │
         │    ┌─────▼─────┐    ▼            │
         │    │  ToolNode  │  END           │
         │    │ (execute)  │                │
         │    └─────┬──────┘                │
         │          │                       │
         └──────────┘                       │
              results fed back              │
              as messages                   │
```

This is the **Agent Loop** — the LLM thinks, optionally calls tools, observes results, and repeats until done.

### Key Concepts

#### 1. `@tool` Decorator (replaces `Tool()` class)

```python
from langchain_core.tools import tool

@tool
def read_file(filepath: str) -> str:
    """Read the contents of a file and return it as a string."""
    with open(filepath, "r") as f:
        return f.read()
```

The decorator reads the **docstring** (becomes the tool description) and **type hints** (becomes the input schema). No manual schema definition needed.

**Why this matters:** In Day 10 you wrote `Tool(name="...", func=..., description="...")`. The `@tool` decorator is the modern approach — less boilerplate, auto-validated schemas.

#### 2. `bind_tools` (replaces `AgentExecutor`)

```python
llm_with_tools = llm.bind_tools(tools)
response = llm_with_tools.invoke("What files are in the current directory?")
# response.tool_calls contains the tool the LLM wants to call
```

The LLM doesn't execute the tool — it returns a **tool call message** saying *which* tool to call and *with what arguments*. This gives you full control over execution.

**Key insight:** `bind_tools` tells the LLM about available tools. The LLM then decides:
- If the query needs a tool → returns `tool_calls` (content may be empty)
- If the query doesn't need a tool → returns normal text content

#### 3. `MessagesState` + `ToolNode` (the Agent Loop)

```python
from langgraph.graph import MessagesState
from langgraph.prebuilt import ToolNode

graph = StateGraph(MessagesState)
graph.add_node("agent", agent)         # LLM decides what to do
graph.add_node("tools", ToolNode(tools))  # Executes tool calls
graph.add_conditional_edges("agent", should_continue, ["tools", END])
graph.add_edge("tools", "agent")       # Results go back to agent
```

- **`MessagesState`** — pre-built state with a `messages` list and an append reducer. Replaces manual `TypedDict` for message-based agents.
- **`ToolNode`** — pre-built node that reads the last AI message, executes any tool calls, and returns results as tool messages.

#### 4. System Prompts (Cursor Rules)

```python
SYSTEM_PROMPT = """You are an expert Python developer. When generating code:
- Use type hints on all functions
- Add concise docstrings
- Follow PEP 8 conventions"""
```

This is equivalent to Cursor's `.cursorrules` file — instructions that shape how the AI writes code. The system prompt is injected as the first message in every conversation.

#### 5. Streaming with `astream_events`

```python
async for event in app.astream_events(inputs, version="v2"):
    if event["event"] == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="")
    elif event["event"] == "on_tool_start":
        print(f"\n--- Calling tool: {event['name']} ---")
```

Real-time token streaming — the same UX as watching Cursor type code character by character.

#### 6. Multi-Turn Conversations

```python
# Turn 1: Create a file
result = app.invoke({"messages": messages})
messages = result["messages"]

# Turn 2: Modify it — agent has full context from turn 1
messages.append(HumanMessage(content="Now add logging to that file"))
result = app.invoke({"messages": messages})
```

The full message history is passed back into the graph, giving the agent context from previous turns — "now modify the function you just created."

### Design Patterns in NB1

| Pattern | Where It Appears |
|---|---|
| **Agent Loop** (§2) | The `agent → tools → agent` cycle — goal intake, action, observation, repeat |
| **Tool Use** (§7) | Each tool has a clear description, strict schema, validated I/O |

---

## Notebook 2: Self-Correcting Code Agent

**Cursor Features:** Bugbot, Inline Edit (Cmd+K), Rules (`.cursorrules`)

**Duration:** ~45 minutes

### What We Build

An agent that generates code, **executes it**, detects errors, and fixes them automatically. Then a reviewer checks code quality and can send it back for improvement. This is Cursor's Bugbot + code review in a graph.

### Architecture

```
                ┌────────────┐
                │  Generate  │◄──────────────────────┐
                │  (LLM)     │                       │
                └─────┬──────┘                       │
                      │                              │
                ┌─────▼──────┐                       │
                │  Execute   │                       │
                │ (subprocess)│                      │
                └─────┬──────┘                       │
                      │                              │
               ┌──────┴──────┐                       │
               │             │                       │
            Success       Error                      │
               │          (retry if attempts < max)──┘
               │
         ┌─────▼──────┐
         │  Reviewer   │
         │  (LLM)      │
         └─────┬───────┘
               │
        ┌──────┴──────┐
        │             │
     Approved     Rejected
        │          (revise if attempts < max)─────►  back to Generate
        │
       END
```

Two retry loops, both bounded by `max_attempts`:
1. **Execution loop:** error → regenerate with error message
2. **Review loop:** rejected → regenerate with reviewer feedback

### Key Concepts

#### 1. `with_structured_output` (Pydantic-validated responses)

```python
class CodeOutput(BaseModel):
    code: str = Field(description="The complete Python code to execute")
    explanation: str = Field(description="Brief explanation of what the code does")

structured_llm = llm.with_structured_output(CodeOutput)
result = structured_llm.invoke("Write a prime number checker")
# result is a CodeOutput object — always has .code and .explanation
```

The LLM is forced to return a Pydantic model. No parsing, no regex, no "hope the LLM formats it right." This is how Cursor separates generated code from its explanation text.

**Difference from `bind_tools`:**
- `bind_tools` → LLM *may* call a tool (it decides)
- `with_structured_output` → LLM *always* returns the specified structure

#### 2. Code Execution via Subprocess

```python
def execute_python(code: str) -> dict:
    result = subprocess.run(
        ["python", "-c", code],
        capture_output=True, text=True, timeout=10,
    )
    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode,
    }
```

The agent runs its own code in an isolated subprocess. If it fails (`returncode != 0`), the error message is fed back to the generator.

#### 3. Conditional Retry Loop (Self-Correction)

```python
def should_retry(state: AgentState) -> str:
    if state["status"] == "success":
        return "success"
    if state["attempts"] < state.get("max_attempts", 3):
        return "retry"       # → back to generate with error context
    return "give_up"         # → end, don't loop forever
```

The routing function checks:
1. Did execution succeed? → done
2. Did it fail but we have retries left? → regenerate with the error message
3. Out of retries? → give up gracefully

**Critical:** Always bound retries. Without `max_attempts`, a tricky bug could cause infinite regeneration.

#### 4. Reflection Node (Code Review)

```python
class ReviewResult(BaseModel):
    approved: bool
    feedback: str

def review(state):
    result = reviewer_llm.invoke(f"Review this code:\n\n{state['code']}")
    if result.approved:
        return {"status": "approved"}
    else:
        return {"status": "review_failed", "review_feedback": result.feedback}
```

A separate LLM call that evaluates code quality *after* execution succeeds. Running code isn't enough — it might work but have bad naming, no type hints, or inefficient logic. The reviewer can reject and send it back with specific feedback.

#### 5. Dynamic Rules Injection (Cursor Rules)

```python
class FullAgentState(TypedDict):
    task: str
    rules: str          # ← injected at runtime
    code: str
    # ...

def generate_v2(state):
    prompt = f"Write Python code for: {state['task']}"
    if state.get("rules"):
        prompt = f"Follow these rules:\n{state['rules']}\n\n{prompt}"
```

Rules are part of the graph state, not hardcoded. Different invocations can pass different rules:

```python
# Without rules
full_agent.invoke({"task": "Sort a list of dicts", "rules": ""})

# With strict rules
full_agent.invoke({"task": "Sort a list of dicts", "rules": "Use type hints everywhere..."})
```

This is exactly how Cursor's `.cursorrules` files work — project-specific instructions injected into the agent's context.

#### 6. Inline Edit (Modify Existing Code)

```python
result = full_agent.invoke({
    "task": f"""Modify this existing code:
```python
{existing_code}
```
Changes: Add type hints, add docstring, return instead of print""",
    "rules": MODERNIZE_RULES,
})
```

Cursor's Cmd+K inline edit: take existing code + edit instructions, generate the modified version, execute it, review it. Same graph, different input.

### Design Patterns in NB2

| Pattern | Where It Appears |
|---|---|
| **Prompt Chaining** (§3) | Generate → Execute → Review as a sequential pipeline |
| **Reflection** (§6) | Reviewer evaluates output quality, can reject and retry |
| **Exception Handling** (§13) | Bounded retries, categorized failures (exec error vs review rejection) |

---

## Notebook 3: Production Coding Agent

**Cursor Features:** Agent Mode, @Mentions, Review, Terminal, Parallel Agents, Session Persistence

**Duration:** ~90 minutes

### What We Build

A full production agent that:
1. **Searches your codebase** for context (like Cursor's `@codebase`)
2. **Plans** which files to create/modify
3. **Generates code** for each file
4. **Reviews** its own work (auto-approves after 2 rejections)
5. **Pauses for human approval** before writing anything to disk
6. **Applies changes** and runs tests
7. **Generates files in parallel** when multiple files need changes
8. **Checkpoints every step** so you can time-travel through decisions

### Architecture: Main Orchestrator

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    ┌────────┐    ┌────────┐    ┌──────────┐    ┌─────────────┐  │
│    │  Plan  │───►│  Code  │───►│  Review  │───►│Human Review │  │
│    │  Node  │    │  Node  │    │  Node    │    │  (interrupt) │  │
│    └────────┘    └────┬───┘    └────┬─────┘    └──────┬──────┘  │
│                       ▲             │                  │         │
│                       │        ┌────┴────┐       ┌────┴────┐    │
│                       │     Approved  Rejected   Approve  Reject│
│                       │        │     (max 2,     │         │    │
│                       │        │    then auto)   │         │    │
│                       │        ▼                 ▼         │    │
│                       │   Human Review     ┌─────────┐     │    │
│                       │                    │  Apply  │     │    │
│                       └────────────────────│ Changes │◄────┘    │
│                          rejected by       └────┬────┘          │
│                          human                  │               │
│                                           ┌─────▼────┐          │
│                                           │Run Tests │          │
│                                           └──────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Architecture: Parallel Code Generation

```
                    ┌──────────┐
                    │   Plan   │
                    └────┬─────┘
                         │
                    fan_out_to_coders
                    (Send API)
                   /     |      \
                  ▼      ▼       ▼
            ┌────────┐┌────────┐┌────────┐
            │Code    ││Code    ││Code    │
            │File 1  ││File 2  ││File 3  │
            └───┬────┘└───┬────┘└───┬────┘
                │         │         │
                └────┬────┘─────────┘
                     ▼
               ┌───────────┐
               │  Collect   │  ← reducer merges results
               │  Results   │
               └────────────┘
```

### Key Concepts

#### 1. Codebase RAG (Cursor's @codebase / @file)

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

# Index all Python files in the project
documents = []
for py_file in project_path.glob("*.py"):
    documents.append(Document(
        page_content=py_file.read_text(),
        metadata={"filename": py_file.name}
    ))

vectorstore = FAISS.from_documents(chunks, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
```

Before generating code, the agent searches the codebase for relevant context. This is what happens when you type `@codebase` or `@file` in Cursor — it retrieves the most relevant code chunks and includes them in the LLM's context.

#### 2. Structured Planning

```python
class FileTask(BaseModel):
    filepath: str
    description: str
    action: str  # "create" or "modify"

class Plan(BaseModel):
    summary: str
    file_tasks: list[FileTask]

planner_llm = llm.with_structured_output(Plan)
```

The planner produces a machine-parseable plan: which files to touch, what to do with each, and whether to create or modify. This is how Cursor's Agent Mode decides what files to edit before writing any code.

#### 3. The Orchestration State

```python
class OrchestratorState(TypedDict):
    feature_request: str
    codebase_context: str
    plan: str
    file_tasks: list[dict]
    generated_code: list[dict]       # replaced each iteration (no reducer)
    review_result: str
    review_attempts: int             # tracks review cycles
    human_decision: str
    test_output: str
    status: str
```

**Key design decision:** `generated_code` has **no reducer** in the main orchestrator. Each coding pass replaces the previous one entirely. This prevents stale code from accumulating across retries.

The `review_attempts` counter enables auto-approval after 2 rejections — the human always gets the final call.

#### 4. Auto-Approval After 2 Rejections

```python
def review_node(state):
    attempts = state.get("review_attempts", 0)

    if attempts >= 2:
        print("AUTO-APPROVED (2 previous rejections — forwarding to human)")
        return {"status": "approved", "review_attempts": attempts + 1}

    # ... normal review logic ...
```

If the AI reviewer keeps rejecting, after 2 cycles the code is auto-approved and sent to the human. This prevents infinite review loops while ensuring the human always sees the code before it's applied.

**Why 2?** One rejection gives the coder a chance to improve. Two rejections means the reviewer and coder disagree — let the human decide.

#### 5. Human-in-the-Loop with `interrupt` + `Command`

```python
from langgraph.types import interrupt, Command

def human_review_node(state):
    # Build a summary of proposed changes
    changes = f"Plan: {state['plan']}\n\nProposed changes:\n..."

    # PAUSE execution — return the summary to the caller
    decision = interrupt(changes)

    return {"human_decision": decision}
```

**`interrupt(value)`** stops the graph and returns `value` to whoever called `invoke()`. The graph state is saved by the checkpointer.

**`Command(resume="approve")`** resumes execution from where it paused:

```python
# Cell 1: Agent runs plan → code → review → PAUSES here
result = agent.invoke({"feature_request": "Add system prompt"}, config=config)
# result contains the proposed changes — you read them

# Cell 2: You decide
result = agent.invoke(Command(resume="approve"), config=config)
# Agent resumes: apply → test → done
```

This is what separates a toy from a production tool. The agent never writes to disk without your explicit approval.

#### 6. Checkpointing with `MemorySaver`

```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()
agent = graph.compile(checkpointer=memory)

# Each thread_id gets its own checkpoint history
config = {"configurable": {"thread_id": "demo-1"}}
```

Every step the agent takes is checkpointed. This enables:
- **Interrupt/resume** — state survives between `interrupt` and `Command(resume=...)`
- **Time travel** — walk through every decision the agent made
- **Multiple threads** — different feature requests run independently

#### 7. Time-Travel Debugging

```python
history = list(agent.get_state_history(config))
for snapshot in reversed(history):
    print(f"status={snapshot.values.get('status')}, next={snapshot.next}")
```

Output:
```
Step 0: status=initial, next=('__start__',)
Step 1: status=initial, next=('plan',)
Step 2: status=planned, next=('code',)
Step 3: status=coded, next=('review',)
Step 4: status=approved, next=('human_review',)
Step 5: status=human_reviewed, next=('apply',)
Step 6: status=applied, next=('test',)
Step 7: status=tested, next=()
```

Every checkpoint captures the full state. You can inspect what the agent planned, what code it generated, whether the reviewer approved or rejected, and what the human decided.

#### 8. Parallel Code Generation with `Send`

```python
from langgraph.types import Send

def fan_out_to_coders(state) -> list[Send]:
    return [
        Send("code_file", {"task": task, "codebase_context": state["codebase_context"]})
        for task in state["file_tasks"]
    ]

graph.add_conditional_edges("plan", fan_out_to_coders, ["code_file"])
```

`Send` dynamically creates parallel node executions — one per file task. Each runs independently. This is how Cursor's parallel agents and background worktrees work.

#### 9. Reducers (Merging Parallel Results)

```python
def add_to_list(existing: list, new: list) -> list:
    return existing + new

class ParallelState(TypedDict):
    generated_code: Annotated[list[dict], add_to_list]  # ← reducer
```

When parallel nodes write to the same state field, the reducer merges them. Without a reducer, the last node to finish would overwrite all others.

**Important:** The reducer is only used in the parallel graph. The main orchestrator does NOT use a reducer on `generated_code` because each retry should replace (not accumulate) the previous attempt.

#### 10. Conditional Routing

```python
def route_after_review(state) -> str:
    if state["status"] == "approved":
        return "human_review"    # AI approved → ask human
    return "code"                # AI rejected → regenerate

def route_after_human(state) -> str:
    if state.get("human_decision") == "approve":
        return "apply"           # Human approved → write to disk
    return "code"                # Human rejected → regenerate
```

Two routing points, both explicit and inspectable. The routing logic is a plain Python function — no hidden prompt magic.

### Design Patterns in NB3

| Pattern | Where It Appears |
|---|---|
| **Agent Loop** (§2) | The full plan → code → review → human → apply cycle |
| **Planning** (§8) | Structured `Plan` with file-level tasks before any coding |
| **Multi-Agent** (§9) | Planner, Coder, Reviewer as specialized nodes |
| **Knowledge Retrieval / RAG** (§15) | FAISS vector store over codebase for @Mentions-style context |
| **Tool Use** (§7) | `search_codebase`, `read_file`, `write_file`, `execute_shell` |
| **Human-in-the-Loop** (§14) | `interrupt` + `Command` for approval before applying changes |
| **Reflection** (§6) | Reviewer evaluates code quality, can reject |
| **Exception Handling** (§13) | Auto-approve after 2 rejections, bounded review cycles |
| **Routing** (§4) | Conditional edges after review and human decision |
| **Parallelization** (§5) | `Send` API for fan-out to parallel coders |
| **Memory Management** (§10) | `MemorySaver` checkpointing + thread-based isolation |

---

## Design Patterns Summary

These patterns come from *Agentic Design Patterns* (Antonio Gulli). The tutorial uses 11 of the 21 patterns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DESIGN PATTERNS MAP                              │
│                                                                     │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────────┐  │
│  │  NB1        │    │  NB2         │    │  NB3                  │  │
│  │             │    │              │    │                       │  │
│  │ Agent Loop  │    │ Prompt       │    │ Planning              │  │
│  │ Tool Use    │    │  Chaining    │    │ Multi-Agent           │  │
│  │             │    │ Reflection   │    │ Knowledge Retrieval   │  │
│  │             │    │ Exception    │    │ Human-in-the-Loop     │  │
│  │             │    │  Handling    │    │ Parallelization       │  │
│  │             │    │              │    │ Memory Management     │  │
│  │             │    │              │    │ Routing               │  │
│  │             │    │              │    │ + all from NB1 & NB2  │  │
│  └─────────────┘    └──────────────┘    └───────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Pattern Details

#### 1. Agent Loop (§2)
> Every agent follows: Goal → Context → Plan → Act → Reflect → Repeat

**NB1:** The `agent → tools → agent` cycle. The LLM decides when to call a tool and when it's done.
**NB3:** The full orchestrator: plan → code → review → human → apply.

#### 2. Tool Use (§7)
> Every tool has a clear description, strict schema, validated I/O.

**NB1:** `@tool` decorator auto-generates schemas. `ToolNode` executes them.
**NB3:** `search_codebase`, `read_file`, `write_file`, `execute_shell` — four tools that give the agent real-world capabilities.

#### 3. Prompt Chaining (§3)
> Sequential steps where output of one feeds the next. Each prompt has one responsibility.

**NB2:** Generate → Execute → Review. Each step has a single job. Intermediate outputs are structured (Pydantic models).

#### 4. Reflection (§6)
> Evaluate output vs goal. Can revise the plan or retry actions.

**NB2:** The Reviewer node evaluates code quality after execution succeeds.
**NB3:** The review node checks generated code before forwarding to human.

#### 5. Exception Handling (§13)
> Categorize failures. Retry only when failure mode is understood. Never infinite retries.

**NB2:** Bounded retries with `max_attempts`. Separate handling for execution errors vs review rejections.
**NB3:** Auto-approve after 2 review rejections. The human always gets the final call.

#### 6. Routing (§4)
> Routing decisions must be explicit and inspectable. Prefer rule-based routing.

**NB3:** `route_after_review` and `route_after_human` — plain Python functions that check state fields. No hidden prompt logic.

#### 7. Planning (§8)
> Generate plans explicitly with steps and dependencies. Plans are revisable artifacts.

**NB3:** The planner produces a structured `Plan` with file-level tasks before any code is generated.

#### 8. Multi-Agent (§9)
> Each agent has a single responsibility. Communication contracts must be defined.

**NB3:** Planner (decides what to do), Coder (generates code), Reviewer (checks quality) — three specialized nodes with clear interfaces via the shared state.

#### 9. Human-in-the-Loop (§14)
> Define when human input is required. Ask precise, minimal questions. Resume after intervention.

**NB3:** `interrupt` pauses execution and shows proposed changes. `Command(resume=...)` resumes. The human sees exactly what will be written before any file is modified.

#### 10. Knowledge Retrieval / RAG (§15)
> Retrieval before generation. Validate relevance before use.

**NB3:** FAISS vector store indexes the codebase. The planner retrieves relevant code chunks before creating the plan. This is Cursor's `@codebase` and `@file` mentions.

#### 11. Parallelization (§5)
> Fan-out → work → fan-in. Merge results deterministically.

**NB3:** `Send` API spawns parallel coder nodes (one per file). Reducer merges results. This is Cursor's parallel agents / worktrees.

#### 12. Memory Management (§10)
> Separate short-term context from long-term memory. Write intentionally, read selectively.

**NB3:** `MemorySaver` checkpoints state at every step. Thread-based isolation means different feature requests don't interfere. Time-travel debugging reads historical state selectively.

---

## Cursor Feature → Implementation Mapping

| Cursor Feature | What It Does | Our Implementation |
|---|---|---|
| **Chat** | Natural language → code | NB1: LLM + tools + message history |
| **Agent Mode** | Autonomous multi-file edits | NB3: Full orchestrator with plan → code → review → apply |
| **Tab Completion** | Context-aware code suggestions | NB1: System prompt shapes output style |
| **Inline Edit (Cmd+K)** | Modify existing code from instructions | NB2: Pass existing code + edit instructions to generator |
| **Bugbot** | Auto-detect and fix errors | NB2: Execute → detect error → regenerate with error context |
| **Rules (`.cursorrules`)** | Project-specific coding instructions | NB2: Dynamic rules injection via state |
| **@codebase / @file** | Semantic code search for context | NB3: FAISS RAG over project files |
| **Terminal** | Execute shell commands | NB3: `execute_shell` tool via subprocess |
| **Review** | AI reviews proposed changes | NB3: Reviewer node with auto-approve after 2 rejections |
| **Apply with approval** | Human gate before writing files | NB3: `interrupt` + `Command` pattern |
| **Parallel Agents** | Multiple files coded simultaneously | NB3: `Send` API + reducer |
| **Session Persistence** | State survives across interactions | NB3: `MemorySaver` + thread config |
| **Time Travel** | Inspect past agent decisions | NB3: `get_state_history` over checkpoints |

---

## LangGraph API Cheat Sheet

### State & Graph

```python
from langgraph.graph import StateGraph, START, END, MessagesState
from typing_extensions import TypedDict
from typing import Annotated

# Simple state
class MyState(TypedDict):
    field: str

# State with reducer (for parallel merging)
def add_to_list(existing: list, new: list) -> list:
    return existing + new

class ParallelState(TypedDict):
    results: Annotated[list[dict], add_to_list]

# Build graph
graph = StateGraph(MyState)
graph.add_node("name", function)
graph.add_edge(START, "name")
graph.add_edge("name", END)
graph.add_conditional_edges("name", router_fn, {"route_a": "node_a", "route_b": "node_b"})
app = graph.compile()
```

### Tools

```python
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def my_tool(param: str) -> str:
    """Description becomes the tool schema."""
    return result

llm_with_tools = llm.bind_tools([my_tool])
tool_node = ToolNode([my_tool])
```

### Structured Output

```python
from pydantic import BaseModel, Field

class MyOutput(BaseModel):
    field: str = Field(description="What this field contains")

structured_llm = llm.with_structured_output(MyOutput)
result = structured_llm.invoke("prompt")  # returns MyOutput instance
```

### Human-in-the-Loop

```python
from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import MemorySaver

def human_node(state):
    decision = interrupt("What should I do?")  # PAUSES here
    return {"decision": decision}

memory = MemorySaver()
agent = graph.compile(checkpointer=memory)

# Run until interrupt
result = agent.invoke(inputs, config={"configurable": {"thread_id": "t1"}})

# Resume
result = agent.invoke(Command(resume="approve"), config={"configurable": {"thread_id": "t1"}})
```

### Parallel Execution

```python
from langgraph.types import Send

def fan_out(state) -> list[Send]:
    return [Send("worker_node", {"task": t}) for t in state["tasks"]]

graph.add_conditional_edges("planner", fan_out, ["worker_node"])
```

### Streaming

```python
# Step-by-step
for step in agent.stream(inputs):
    node_name = list(step.keys())[0]
    print(f"[{node_name}] {step[node_name]}")

# Token-by-token
async for event in agent.astream_events(inputs, version="v2"):
    if event["event"] == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="")
```

### Time Travel

```python
history = list(agent.get_state_history(config))
for snapshot in history:
    print(snapshot.values, snapshot.next)
```

---

## Sample Project Structure

```
sample_project/
├── config.py    # Settings: PAGE_TITLE, PAGE_ICON, MODEL, BASE_URL
├── chat.py      # LLM logic: get_client(), stream_response()
└── app.py       # Streamlit UI: chat interface with streaming
```

This is a simplified version of the ChatGPT clone from Day 3. The agent adds features to it during the demos:
- **Demo 1:** Add system prompt configuration (modifies all 3 files)
- **Demo 2:** Add "Clear Chat" button + message counter (modifies app.py)
- **Parallel Demo:** Add conversation export + model selector (modifies all 3 files in parallel)

---

## Teaching Flow (3 hours)

| Time | Notebook | Key Moments |
|---|---|---|
| 0:00 – 0:45 | **NB1** | `@tool` schema auto-gen, `bind_tools` vs `AgentExecutor`, agent loop diagram, streaming demo |
| 0:45 – 1:30 | **NB2** | `with_structured_output` demo, first self-correction (watch the retry), reviewer rejecting code, rules comparison (with vs without) |
| 1:30 – 1:45 | *Break* | |
| 1:45 – 2:15 | **NB3 Parts 1-8** | Codebase RAG, building the orchestrator node by node, graph visualization, **live demo** — watch the agent plan/code/review, **interrupt pause**, human approval |
| 2:15 – 2:45 | **NB3 Parts 9-11** | Parallel `Send` demo, time-travel walkthrough, second feature request end-to-end |
| 2:45 – 3:00 | **Recap** | Design patterns table, Cursor mapping table, Q&A |

### Teaching Tips

1. **Run every cell live.** The notebooks are designed so every cell produces visible output — don't skip cells.
2. **Pause at the graph diagrams.** Let students trace the flow before running the demo.
3. **At the interrupt in NB3:** Stop and ask "What would you do? Approve or reject?" before running the resume cell.
4. **Compare with/without rules in NB2.** Run both cells back-to-back and let students spot the differences.
5. **For the parallel demo:** Point out that the files are generated simultaneously, not sequentially — check the print timestamps.
