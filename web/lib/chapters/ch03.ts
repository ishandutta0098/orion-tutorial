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
          content: "03_production_coding_agent.ipynb\norion\nREADME.md\n02_self_correcting_code_agent.ipynb\nCONTENTS.md\n01_code_generator_with_tools.ipynb\nsample_project",
          toolName: "list_directory",
          toolArgs: { directory: "." },
        },
        {
          role: "assistant",
          content: "The files in the current directory are:\n\n- 03_production_coding_agent.ipynb\n- 02_self_correcting_code_agent.ipynb\n- 01_code_generator_with_tools.ipynb\n- README.md\n- CONTENTS.md\n- orion (directory)\n- sample_project (directory)",
        },
      ],
    },
  },
  demos: [],
};
