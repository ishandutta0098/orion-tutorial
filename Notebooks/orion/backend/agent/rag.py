from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def build_index(workspace_path: str, api_key: str, base_url: str = "https://openrouter.ai/api/v1"):
    """Index all Python files in the workspace for RAG."""
    documents = []
    project_path = Path(workspace_path)

    for py_file in project_path.rglob("*.py"):
        if "__pycache__" in str(py_file):
            continue
        content = py_file.read_text()
        rel_path = str(py_file.relative_to(project_path))
        documents.append(Document(
            page_content=content,
            metadata={"filename": rel_path, "source": rel_path}
        ))

    if not documents:
        return None

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)

    embeddings = OpenAIEmbeddings(
        openai_api_key=api_key,
        openai_api_base=base_url,
        model="openai/text-embedding-3-small"
    )

    vectorstore = FAISS.from_documents(chunks, embeddings)
    return vectorstore.as_retriever(search_kwargs={"k": 3})


def search_codebase_fn(retriever, query: str) -> str:
    """Search the codebase using RAG retriever."""
    if retriever is None:
        return "No codebase index available"
    docs = retriever.invoke(query)
    results = []
    for doc in docs:
        results.append(f"--- {doc.metadata.get('filename', 'unknown')} ---\n{doc.page_content}")
    return "\n\n".join(results) if results else "No relevant code found"
