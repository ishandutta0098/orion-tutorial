import type { ChapterDef } from "../schema";

export const ch10: ChapterDef = {
  slug: "reflection",
  number: 10,
  notebook: "Notebook 02",
  subtopicLabel: "2.3 Reflection",
  title: "Reflection",
  subtitle: "Add a reviewer node that evaluates code quality after execution succeeds.",
  cursorFeature: "Bugbot",
  designPatterns: ["Reflection"],
  intro: "Passing tests isn't enough — code can be correct but poorly written. The reflection pattern adds a reviewer node after successful execution. It evaluates quality (naming, structure, edge cases) and can send the code back for revision, creating a second improvement loop.",
  takeaway: "Reflection separates 'does it work?' from 'is it good?'. A dedicated reviewer node catches quality issues that unit tests miss, pushing the agent toward production-grade output.",
  demos: [],
  backendCode: `from langgraph.graph import StateGraph, START, END

class ReviewResult(BaseModel):
    approved: bool = Field(description="Whether the code meets quality standards")
    feedback: str = Field(description="Specific feedback for improvement")

reviewer_llm = llm.with_structured_output(ReviewResult)

def review(state: FullAgentState) -> FullAgentState:
    result = reviewer_llm.invoke(
        f"Review this Python code for quality (type hints, naming, PEP 8, efficiency):\\n\\n{state['code']}"
    )
    if result.approved:
        return {"status": "approved", "review_feedback": ""}
    else:
        return {"status": "review_failed", "review_feedback": result.feedback}

def route_after_execute(state) -> str:
    if state["status"] == "executed":
        return "review"
    if state["attempts"] < state.get("max_attempts", 3):
        return "retry"
    return "give_up"

def route_after_review(state) -> str:
    if state["status"] == "approved":
        return "done"
    if state["attempts"] < state.get("max_attempts", 3):
        return "revise"
    return "done"

graph = StateGraph(FullAgentState)
graph.add_node("generate", generate_v2)
graph.add_node("execute", execute_v2)
graph.add_node("review", review)
graph.add_edge(START, "generate")
graph.add_edge("generate", "execute")
graph.add_conditional_edges("execute", route_after_execute, {
    "review": "review", "retry": "generate", "give_up": END
})
graph.add_conditional_edges("review", route_after_review, {
    "done": END, "revise": "generate"
})
full_agent = graph.compile()`,
  backendFilename: "reflection_graph.py",
  chatConfig: {
    mode: "reflection",
    graphVisualization: true,
    graphNodes: [
      { id: "__start__", label: "__start__" },
      { id: "generate", label: "generate" },
      { id: "execute", label: "execute" },
      { id: "review", label: "review" },
      { id: "__end__", label: "__end__" },
    ],
    graphEdges: [
      { from: "__start__", to: "generate" },
      { from: "generate", to: "execute" },
      { from: "execute", to: "review", label: "review" },
      { from: "execute", to: "generate", label: "retry", style: "dashed" },
      { from: "execute", to: "__end__", label: "give_up", style: "dashed" },
      { from: "review", to: "generate", label: "revise", style: "dashed" },
      { from: "review", to: "__end__", label: "done" },
    ],
    animationSequence: ["__start__", "generate", "execute", "review", "generate", "execute", "review", "__end__"],
    graphRunSteps: {
      default: [
        {
          node: "generate",
          title: "Attempt 1",
          detail: "Generated a working sieve implementation without type hints or docstring.",
        },
        {
          node: "execute",
          title: "Success",
          detail: "stdout: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]",
          status: "success",
        },
        {
          node: "review",
          title: "Needs revision",
          detail: "Add type hints, a descriptive function name, a docstring, edge case handling, and a main guard.",
          status: "warning",
        },
        {
          node: "generate",
          title: "Attempt 2",
          detail: "Revised code with typing, docstring, edge case handling, and main guard.",
        },
        {
          node: "execute",
          title: "Success",
          detail: "stdout: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]",
          status: "success",
        },
        {
          node: "review",
          title: "Approved",
          detail: "Code approved. Type hints present, descriptive naming, docstring included, edge case handled.",
          status: "success",
        },
        {
          node: "__end__",
          title: "Done",
          detail: "The revised version passed both execution and review.",
          status: "success",
        },
      ],
    },
    defaultPrompt: "Write a function to find all prime numbers up to n using the Sieve of Eratosthenes. Test it by printing primes up to 50.",
    conversations: {
      default: [
        {
          role: "tool",
          toolName: "generate",
          toolArgs: { attempt: "1" },
          content: `def sieve(n):
    primes = [True] * (n + 1)
    primes[0] = primes[1] = False
    for i in range(2, int(n**0.5) + 1):
        if primes[i]:
            for j in range(i*i, n+1, i):
                primes[j] = False
    return [i for i, p in enumerate(primes) if p]

print(sieve(50))`,
        },
        {
          role: "tool",
          toolName: "execute",
          toolArgs: { status: "SUCCESS" },
          content: `stdout: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
returncode: 0`,
        },
        {
          role: "tool",
          toolName: "review",
          toolArgs: { approved: "false" },
          content: `Feedback: Add type hints for better clarity. Use a more descriptive function name like 'sieve_of_eratosthenes'. Add a docstring explaining the algorithm. Handle edge case where n < 2. Use if __name__ == '__main__' guard.`,
        },
        {
          role: "tool",
          toolName: "generate",
          toolArgs: { attempt: "2" },
          content: `from typing import List


def sieve_of_eratosthenes(n: int) -> List[int]:
    """Find all prime numbers up to n using the Sieve of Eratosthenes.

    Args:
        n: Upper bound (inclusive) for prime search.

    Returns:
        List of prime numbers up to n.
    """
    if n < 2:
        return []

    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    for i in range(2, int(n**0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False

    return [i for i, prime in enumerate(is_prime) if prime]


if __name__ == '__main__':
    prime_numbers = sieve_of_eratosthenes(50)
    print(prime_numbers)`,
        },
        {
          role: "tool",
          toolName: "execute",
          toolArgs: { status: "SUCCESS" },
          content: `stdout: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
returncode: 0`,
        },
        {
          role: "tool",
          toolName: "review",
          toolArgs: { approved: "true" },
          content: `Code approved. Type hints present, descriptive naming, docstring included, edge case handled, __main__ guard in place.`,
        },
        {
          role: "assistant",
          content: `✓ Task approved after 2 attempts

The first version worked but the reviewer requested improvements:
- Type hints
- Descriptive function name
- Docstring
- Edge case handling
- \`if __name__\` guard

The revised version passed both execution and review.

**Output:** [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]`,
        },
      ],
    },
    generatedFile: {
      filename: "sieve.py",
      content: `from typing import List


def sieve_of_eratosthenes(n: int) -> List[int]:
    """Find all prime numbers up to n using the Sieve of Eratosthenes.

    Args:
        n: Upper bound (inclusive) for prime search.

    Returns:
        List of prime numbers up to n.
    """
    if n < 2:
        return []

    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    for i in range(2, int(n**0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False

    return [i for i, prime in enumerate(is_prime) if prime]


if __name__ == '__main__':
    prime_numbers = sieve_of_eratosthenes(50)
    print(prime_numbers)`,
    },
  },
};
