from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import SystemMessage
from .tools import create_tools

SYSTEM_PROMPT = """You are Orion, an expert AI coding assistant. You help developers write, modify, and understand code.

When generating code:
- Use type hints on all functions
- Add concise docstrings
- Follow PEP 8 conventions
- Write clean, modern Python

You have access to tools for reading, writing, and listing files in the workspace, plus executing shell commands. Use them when needed to help the user."""


def create_chat_graph(api_key: str, model: str, workspace_path: str):
    tools = create_tools(workspace_path)

    llm = ChatOpenAI(
        model=model,
        openai_api_key=api_key,
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=0.1,
        streaming=True
    )
    llm_with_tools = llm.bind_tools(tools)

    def agent(state: MessagesState):
        messages = state["messages"]
        if not messages or not isinstance(messages[0], SystemMessage):
            messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: MessagesState) -> str:
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

    return graph.compile()
