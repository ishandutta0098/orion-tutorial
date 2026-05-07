from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI


class CodeResult(BaseModel):
    filepath: str = Field(description="The file path")
    code: str = Field(description="The complete file contents")
    explanation: str = Field(description="Brief explanation of what was generated")


def create_coder(api_key: str, model: str, base_url: str = "https://openrouter.ai/api/v1"):
    llm = ChatOpenAI(
        model=model,
        openai_api_key=api_key,
        openai_api_base=base_url,
        temperature=0
    )
    return llm.with_structured_output(CodeResult)


def code_node(state, coder, rules: str = ""):
    """Generate code for all file tasks."""
    generated = []

    for task in state.get("file_tasks", []):
        prompt = f"""Generate the complete Python code for this file.

File: {task['filepath']}
Action: {task['action']}
Description: {task['description']}

Codebase context:
{state.get('codebase_context', 'No context available')}"""

        if rules:
            prompt = f"Follow these coding rules:\n{rules}\n\n{prompt}"

        review_feedback = state.get("review_result", "")
        if review_feedback and "rejected" in review_feedback.lower():
            prompt += f"\n\nPrevious review feedback (address these issues):\n{review_feedback}"

        result = coder.invoke(prompt)
        generated.append({
            "filepath": result.filepath,
            "code": result.code,
            "explanation": result.explanation
        })

    return {
        "generated_code": generated,
        "status": "coded"
    }


def code_single_file(state, coder, rules: str = ""):
    """Generate code for a single file task (used in parallel mode)."""
    task = state["task"]
    prompt = f"""Generate the complete Python code for this file.

File: {task['filepath']}
Action: {task['action']}
Description: {task['description']}

Codebase context:
{state.get('codebase_context', 'No context available')}"""

    if rules:
        prompt = f"Follow these coding rules:\n{rules}\n\n{prompt}"

    result = coder.invoke(prompt)
    return {
        "generated_code": [{
            "filepath": result.filepath,
            "code": result.code,
            "explanation": result.explanation
        }]
    }
