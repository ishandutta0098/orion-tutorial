import type { ChapterDef } from "../schema";

export const ch13: ChapterDef = {
  slug: "codebase-rag",
  number: 13,
  notebook: "Notebook 03",
  subtopicLabel: "3.1 Codebase RAG",
  title: "Codebase RAG with FAISS",
  subtitle: "Semantic search over your codebase — the @codebase and @file equivalent.",
  cursorFeature: "Agent Mode",
  designPatterns: ["Knowledge Retrieval"],
  intro: "A production agent needs to understand existing code before writing new code. FAISS-powered codebase RAG lets the agent search semantically — finding relevant functions, classes, and patterns by meaning, not just text matching. This is how Cursor's @codebase and @file references work under the hood.",
  takeaway: "Codebase RAG transforms a context-blind agent into one that understands your project. Semantic search finds related code that keyword search misses, enabling accurate modifications to large codebases.",
  demos: [],
  backendCode: `from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pathlib import Path

project_path = Path("sample_project")
documents = []
for py_file in project_path.glob("*.py"):
    content = py_file.read_text()
    documents.append(
        Document(
            page_content=content,
            metadata={"source": str(py_file), "filename": py_file.name},
        )
    )

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)

embeddings = OpenAIEmbeddings(
    openai_api_key=api_key,
    openai_api_base="https://openrouter.ai/api/v1",
)

vectorstore = FAISS.from_documents(chunks, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})


@tool
def search_codebase(query: str) -> str:
    """Search the indexed codebase for relevant code snippets."""
    results = retriever.invoke(query)
    return "\\n\\n".join(
        f"--- {doc.metadata['filename']} ---\\n{doc.page_content}" for doc in results
    )`,
  backendFilename: "codebase_rag.py",
  chatConfig: {
    mode: "codebase-search",
    defaultPrompt: "streaming chat response",
    conversations: {
      default: [
        {
          role: "tool",
          toolName: "search_codebase",
          toolArgs: { query: "streaming chat response" },
          content: `--- app.py ---
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Ask me anything..."):
    st.session_state.messages.append({"role": "user", "content": prompt})

--- app.py ---
st.session_state.messages.append({"role": "assistant", "content": response_text})

--- app.py ---
import streamlit as st
from chat import get_client, stream_response
from config import PAGE_ICON, PAGE_TITLE

st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON)
st.title(f"{PAGE_ICON} {PAGE_TITLE}")`,
        },
        {
          role: "assistant",
          content: `Found 3 relevant chunks for "streaming chat response":\n\n1. [app.py] — Chat message display loop and user input handling\n2. [app.py] — Appending assistant response to session state\n3. [app.py] — App initialization with imports and config\n\nThe streaming logic lives in app.py, using st.write_stream() to display tokens as they arrive from the LLM.`,
        },
      ],
      "system prompt configuration": [
        {
          role: "tool",
          toolName: "search_codebase",
          toolArgs: { query: "system prompt configuration" },
          content: `--- config.py ---
PAGE_TITLE = "My ChatBot"
PAGE_ICON = "🤖"
MODEL = "openai/gpt-4o-mini"
BASE_URL = "https://openrouter.ai/api/v1"

--- chat.py ---
from config import BASE_URL, MODEL
from openai import OpenAI

def get_client(api_key):
    return OpenAI(base_url=BASE_URL, api_key=api_key)

def stream_response(client, messages):
    response = client.chat.completions.create(
        model=MODEL, messages=messages, stream=True,
    )
    for chunk in response:
        content = chunk.choices[0].delta.content
        if content:
            yield content

--- app.py ---
with st.chat_message("assistant"):
    response_text = st.write_stream(
        stream_response(client, st.session_state.messages)
    )`,
        },
        {
          role: "assistant",
          content: `Found 3 relevant chunks for "system prompt configuration":\n\n1. [config.py] — Current config has PAGE_TITLE, PAGE_ICON, MODEL, BASE_URL but no system prompt\n2. [chat.py] — stream_response takes (client, messages) — no system prompt parameter yet\n3. [app.py] — Messages passed directly without system prompt prepending\n\nTo add a system prompt, you'd need to add a constant in config.py and inject it into the messages list in chat.py.`,
        },
      ],
    },
  },
};
