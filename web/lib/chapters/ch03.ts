import type { ChapterDef } from "../schema";

export const ch03: ChapterDef = {
  slug: "agent-graph",
  number: 3,
  notebook: "Notebook 01",
  title: "Building the Agent Graph",
  subtitle: "Wire up MessagesState, ToolNode, and conditional routing into a working agent loop.",
  cursorFeature: "Chat Mode",
  designPatterns: ["Agent Loop", "Tool Use"],
  intro: "A LangGraph agent is a state machine. You define nodes (LLM calls, tool execution) and edges (conditional routing based on whether the model wants to call a tool or return a final answer). MessagesState tracks the conversation, and ToolNode handles tool dispatch automatically.",
  takeaway: "The agent graph pattern — model node → should_continue → tool node → loop back — is the fundamental architecture of every LangGraph agent. Master this and everything else is an extension.",
  backendFilename: "agent_graph.py",
  backendCode: `from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState
from langgraph.prebuilt import ToolNode


def agent(state: MessagesState):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}


def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END


graph = StateGraph(MessagesState)

graph.add_node("agent", agent)
graph.add_node("tools", ToolNode(tools))

graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, ["tools", END])
graph.add_edge("tools", "agent")

app = graph.compile()
print("Graph compiled")`,
  chatConfig: {
    mode: "agent-chat",
    defaultPrompt: "List the files in the current directory",
    conversations: {
      default: [
        {
          role: "tool",
          content: "notebook_01/\n  setting_up_llm.py\n  defining_tools.py\n  agent_graph.py\n  code_generation.py\n  system_prompt.py\n  streaming.py\n  multi_turn.py\nnotebook_02/\n  error_detection.py\n  sandbox_execution.py\n  self_correction_loop.py\nnotebook_03/\n  production_config.py\n  logging_monitoring.py",
          toolName: "list_directory",
          toolArgs: { directory: "." },
        },
        {
          role: "assistant",
          content: "The current directory contains 3 notebook folders:\n\n**notebook_01/** — Code Generator with Tools\n- setting_up_llm.py\n- defining_tools.py\n- agent_graph.py\n- code_generation.py\n- system_prompt.py\n- streaming.py\n- multi_turn.py\n\n**notebook_02/** — Self-Correcting Agent\n- error_detection.py\n- sandbox_execution.py\n- self_correction_loop.py\n\n**notebook_03/** — Production Agent\n- production_config.py\n- logging_monitoring.py",
        },
      ],
    },
  },
  demos: [],
};
