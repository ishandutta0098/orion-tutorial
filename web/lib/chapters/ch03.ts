import type { ChapterDef } from "../schema";

export const ch03: ChapterDef = {
  slug: "agent-graph",
  number: 3,
  notebook: "Notebook 01",
  subtopicLabel: "1.3 Agent Graph",
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
    graphVisualization: true,
    defaultPrompt: "List the files in the current directory",
    conversations: {
      default: [
        {
          role: "tool",
          content: "sample_project/\n  app.py\n  chat.py\n  config.py\norion/\n  agent_graph.py\ngenerated/",
          toolName: "list_directory",
          toolArgs: { directory: "." },
        },
        {
          role: "assistant",
          content: "The agent used `list_directory` and found the files shown in the Explorer:\n\n**sample_project/**\n- app.py\n- chat.py\n- config.py\n\n**orion/**\n- agent_graph.py\n\n**generated/**\n- empty for now",
        },
      ],
    },
  },
  demos: [],
};
