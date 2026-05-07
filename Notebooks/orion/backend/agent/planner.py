from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI


class FileTask(BaseModel):
    filepath: str = Field(description="Path to the file to create or modify")
    description: str = Field(description="What changes to make to this file")
    action: str = Field(description="'create' for new files, 'modify' for existing files")


class Plan(BaseModel):
    summary: str = Field(description="High-level summary of the implementation plan")
    file_tasks: list[FileTask] = Field(description="List of file-level tasks")


def create_planner(api_key: str, model: str, base_url: str = "https://openrouter.ai/api/v1"):
    llm = ChatOpenAI(
        model=model,
        openai_api_key=api_key,
        openai_api_base=base_url,
        temperature=0
    )
    return llm.with_structured_output(Plan)


def plan_node(state, planner, codebase_context: str = ""):
    """Plan which files to create/modify based on the feature request."""
    prompt = f"""You are a senior developer planning code changes for a Python project.

Feature request: {state['feature_request']}

Current codebase context:
{codebase_context or state.get('codebase_context', 'No context available')}

Create a plan specifying which files to create or modify. Be specific about what each file should contain."""

    plan = planner.invoke(prompt)

    return {
        "plan": plan.summary,
        "file_tasks": [task.model_dump() for task in plan.file_tasks],
        "status": "planned"
    }
