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
  codeFilename: "agent_graph.py",
  codeContent: `from langgraph.graph import StateGraph, START, END
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
  aiExchange: {
    userMessage: "Build the agent graph with conditional tool routing.",
    aiLabel: "COMPILING GRAPH",
    aiDescription: "Wiring StateGraph with agent node, ToolNode, and conditional edges. The should_continue function routes to tools or END...",
    aiCodeSnippet: `graph.add_edge(START, "agent")
graph.add_conditional_edges(
    "agent", should_continue, ["tools", END]
)
graph.add_edge("tools", "agent")
app = graph.compile()`,
  },
  demos: [
    {
      id: "conditional-routing",
      question: "How does the agent decide when to call a tool vs respond directly?",
      controlLabel: "Prompt Type",
      defaultLeft: "needs_tool",
      defaultRight: "no_tool",
      options: [
        { key: "needs_tool", label: "Needs Tool", description: "Prompt that requires a tool call to answer." },
        { key: "no_tool", label: "Direct Answer", description: "Prompt the LLM can answer from knowledge." },
      ],
      variants: {
        needs_tool: {
          label: "Tool Call Path",
          description: "LLM returns tool_calls → routes to ToolNode → loops back",
          log: [
            { tag: "BOOT", text: "Graph compiled. Starting execution..." },
            { tag: "INFO", text: "Input: 'What files are in the current directory?'" },
            { tag: "PROCESS", text: "→ agent node: invoking LLM with tools bound" },
            { tag: "TOOL", text: "LLM response: tool_calls=[{name: 'list_directory', args: {directory: '.'}}]" },
            { tag: "INFO", text: "should_continue → 'tools' (tool_calls detected)" },
            { tag: "PROCESS", text: "→ tools node: executing list_directory('.')" },
            { tag: "OK", text: "Tool returned: '01_code_generator.ipynb\\nREADME.md\\nsample_project'" },
            { tag: "INFO", text: "→ agent node: LLM summarizes tool result" },
            { tag: "INFO", text: "should_continue → END (no tool_calls)" },
            { tag: "SUCCESS", text: "Graph complete. Final response delivered." },
          ],
          output: `The files in the current directory are:
- 01_code_generator.ipynb
- README.md
- sample_project`,
          trace: [
            { type: "human", content: "What files are in the current directory?" },
            { type: "ai", content: "", toolName: "list_directory", toolArgs: ["directory: '.'"] },
            { type: "tool", content: "01_code_generator.ipynb\nREADME.md\nsample_project", toolName: "list_directory" },
            { type: "ai", content: "The files in the current directory are:\n- 01_code_generator.ipynb\n- README.md\n- sample_project" },
          ],
        },
        no_tool: {
          label: "Direct Response Path",
          description: "LLM responds directly → routes to END immediately",
          log: [
            { tag: "BOOT", text: "Graph compiled. Starting execution..." },
            { tag: "INFO", text: "Input: 'What is Python?'" },
            { tag: "PROCESS", text: "→ agent node: invoking LLM with tools bound" },
            { tag: "INFO", text: "LLM response: content='Python is a high-level...' tool_calls=[]" },
            { tag: "INFO", text: "should_continue → END (no tool_calls)" },
            { tag: "SUCCESS", text: "Graph complete. Final response delivered." },
          ],
          output: `Python is a high-level, interpreted programming language known for its clear syntax and readability. It was created by Guido van Rossum and first released in 1991. Python supports multiple programming paradigms including procedural, object-oriented, and functional programming.`,
          trace: [
            { type: "human", content: "What is Python?" },
            { type: "ai", content: "Python is a high-level, interpreted programming language known for its clear syntax and readability. It was created by Guido van Rossum and first released in 1991." },
          ],
        },
      },
    },
  ],
};
