from pydantic import BaseModel, ConfigDict


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    api_key: str | None = None
    model: str | None = None
    rules: str | None = None


class FileNode(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    path: str
    is_directory: bool
    children: list["FileNode"] | None = None


class FileContent(BaseModel):
    path: str
    content: str


class AgentRunRequest(BaseModel):
    feature_request: str
    api_key: str | None = None
    model: str | None = None
    thread_id: str | None = None
    rules: str | None = None


class AgentApproveRequest(BaseModel):
    thread_id: str
    decision: str


class TerminalRequest(BaseModel):
    command: str


class TerminalResponse(BaseModel):
    stdout: str
    stderr: str
    returncode: int


class RulesRequest(BaseModel):
    content: str


class ModelInfo(BaseModel):
    id: str
    name: str
    description: str = ""
