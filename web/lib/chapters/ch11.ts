import type { ChapterDef } from "../schema";

export const ch11: ChapterDef = {
  slug: "dynamic-rules",
  number: 11,
  notebook: "Notebook 02",
  subtopicLabel: "2.4 Dynamic Rules",
  title: "Dynamic Rules",
  subtitle: "Inject coding rules at runtime — the .cursorrules equivalent for agents.",
  cursorFeature: "Cursor Rules",
  designPatterns: ["Prompt Chaining"],
  intro: "Hard-coded system prompts are static. Dynamic rules injection loads coding standards from state at runtime, so the same agent can enforce different conventions per project. This mirrors how .cursorrules files customize Cursor's behavior per repository.",
  takeaway: "Dynamic rules let you swap coding standards without changing agent code. Store rules in state, inject them into the system prompt at runtime, and the agent adapts to any project's conventions.",
  demos: [],
  backendCode: `STRICT_RULES = """- ALL functions must have type hints on parameters and return type
- ALL functions must have a Google-style docstring
- Use list comprehensions instead of loops where possible
- Add if __name__ == '__main__' guard for test code
- Variable names must be descriptive (no single letters except loop counters)"""

def generate_v2(state: FullAgentState) -> FullAgentState:
    prompt = f"Write Python code for: {state['task']}"

    if state.get("rules"):
        prompt = f"Follow these rules:\\n{state['rules']}\\n\\n{prompt}"

    if state.get("error"):
        prompt += f"\\n\\nPrevious attempt had execution error:\\n{state['error']}\\nFix the code."
    elif state.get("review_feedback"):
        prompt += f"\\n\\nReviewer said:\\n{state['review_feedback']}\\nImprove the code."

    result = structured_llm.invoke(prompt)
    return {
        "code": result.code,
        "explanation": result.explanation,
        "attempts": state.get("attempts", 0) + 1,
        "status": "executing",
        "error": "",
        "review_feedback": "",
    }

# Without rules
result_no_rules = full_agent.invoke({
    "task": "Write a function to sort a list of dicts by a given key.",
    "rules": "",
    "attempts": 0, "max_attempts": 3,
})

# With rules
result_with_rules = full_agent.invoke({
    "task": "Write a function to sort a list of dicts by a given key.",
    "rules": STRICT_RULES,
    "attempts": 0, "max_attempts": 3,
})`,
  backendFilename: "dynamic_rules.py",
  chatConfig: {
    mode: "rules-toggle",
    defaultPrompt: "Write a function to sort a list of dictionaries by a given key. Test with sample data.",
    rules: `- ALL functions must have type hints on parameters and return type
- ALL functions must have a Google-style docstring
- Use list comprehensions instead of loops where possible
- Add if __name__ == '__main__' guard for test code
- Variable names must be descriptive (no single letters except loop counters)`,
    conversations: {
      no_rules: [
        {
          role: "assistant",
          content: `Generated without coding rules:

\`\`\`python
def sort_by_key(data, key):
    return sorted(data, key=lambda x: x.get(key))


d = [
    {'name': 'Alice', 'age': 30},
    {'name': 'Bob', 'age': 25},
    {'name': 'Charlie', 'age': 35}
]

print(sort_by_key(d, 'age'))
\`\`\`

Output: [{'name': 'Bob', 'age': 25}, {'name': 'Alice', 'age': 30}, {'name': 'Charlie', 'age': 35}]

Note: This works, but it has no type hints, no docstring, no \`if __name__\` guard, and terse variable names like \`d\` and \`x\`.`,
        },
      ],
      strict: [
        {
          role: "tool",
          toolName: "rules_injected",
          toolArgs: { count: "5" },
          content: `- ALL functions must have type hints on parameters and return type
- ALL functions must have a Google-style docstring
- Use list comprehensions instead of loops where possible
- Add if __name__ == '__main__' guard for test code
- Variable names must be descriptive (no single letters except loop counters)`,
        },
        {
          role: "assistant",
          content: `Generated with strict coding rules enforced:

\`\`\`python
from typing import List, Dict, Any


def sort_dicts_by_key(list_of_dicts: List[Dict[str, Any]], sort_key: str) -> List[Dict[str, Any]]:
    """Sort a list of dictionaries by a specified key.

    Args:
        list_of_dicts: The list of dictionaries to be sorted.
        sort_key: The key in the dictionaries to sort by.

    Returns:
        A new list of dictionaries sorted by the specified key.
    """
    return sorted(list_of_dicts, key=lambda dictionary: dictionary.get(sort_key, None))


if __name__ == '__main__':
    sample_data = [
        {'name': 'Alice', 'age': 30},
        {'name': 'Bob', 'age': 25},
        {'name': 'Charlie', 'age': 35},
        {'name': 'David', 'age': 20},
    ]

    sorted_data = sort_dicts_by_key(sample_data, 'age')
    print(sorted_data)
\`\`\`

Output: [{'name': 'David', 'age': 20}, {'name': 'Bob', 'age': 25}, {'name': 'Alice', 'age': 30}, {'name': 'Charlie', 'age': 35}]

✓ All 5 rules enforced: type hints, Google-style docstring, list comprehension (via sorted), \`if __name__\` guard, descriptive variable names.`,
        },
      ],
    },
    generatedFile: {
      filename: "sort_dicts.py",
      content: `from typing import List, Dict, Any


def sort_dicts_by_key(list_of_dicts: List[Dict[str, Any]], sort_key: str) -> List[Dict[str, Any]]:
    """Sort a list of dictionaries by a specified key.

    Args:
        list_of_dicts: The list of dictionaries to be sorted.
        sort_key: The key in the dictionaries to sort by.

    Returns:
        A new list of dictionaries sorted by the specified key.
    """
    return sorted(list_of_dicts, key=lambda dictionary: dictionary.get(sort_key, None))


if __name__ == '__main__':
    sample_data = [
        {'name': 'Alice', 'age': 30},
        {'name': 'Bob', 'age': 25},
        {'name': 'Charlie', 'age': 35},
        {'name': 'David', 'age': 20},
    ]

    sorted_data = sort_dicts_by_key(sample_data, 'age')
    print(sorted_data)`,
    },
  },
};
