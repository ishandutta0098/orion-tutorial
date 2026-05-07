from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI


class ReviewResult(BaseModel):
    approved: bool = Field(description="Whether the code is approved")
    feedback: str = Field(description="Detailed review feedback")


def create_reviewer(api_key: str, model: str, base_url: str = "https://openrouter.ai/api/v1"):
    llm = ChatOpenAI(
        model=model,
        openai_api_key=api_key,
        openai_api_base=base_url,
        temperature=0
    )
    return llm.with_structured_output(ReviewResult)


def review_node(state, reviewer):
    """Review generated code. Auto-approves after 2 rejections."""
    attempts = state.get("review_attempts", 0)

    if attempts >= 2:
        return {
            "review_result": "AUTO-APPROVED: Forwarded to human review after 2 rejections",
            "review_attempts": attempts + 1,
            "status": "approved"
        }

    code_summary = ""
    for item in state.get("generated_code", []):
        code_preview = item.get("code", "")[:800]
        code_summary += f"\n--- {item['filepath']} ---\n{code_preview}\n"

    prompt = f"""Review this generated code for quality, correctness, and best practices.

Plan: {state.get('plan', 'No plan')}

Generated code:
{code_summary}

Check for: correct logic, proper error handling, good naming, type hints, and adherence to the plan."""

    result = reviewer.invoke(prompt)

    if result.approved:
        return {
            "review_result": f"APPROVED: {result.feedback}",
            "review_attempts": attempts + 1,
            "status": "approved"
        }

    return {
        "review_result": f"REJECTED: {result.feedback}",
        "review_attempts": attempts + 1,
        "status": "review_rejected"
    }
