import type { ChapterDef } from "../schema";

export const ch12: ChapterDef = {
  slug: "inline-edit",
  number: 12,
  notebook: "Notebook 02",
  subtopicLabel: "2.5 Inline Edit",
  title: "Inline Edit",
  subtitle: "Modify existing code based on instructions while enforcing coding rules.",
  cursorFeature: "Inline Edit",
  designPatterns: ["Prompt Chaining", "Reflection"],
  intro: "Inline editing is different from generation — you're modifying existing code, not starting from scratch. The agent reads the current file, applies targeted changes based on an instruction, and ensures the result still follows your coding rules. This is the Cursor inline edit experience.",
  takeaway: "Inline edit combines read-modify-write with rule enforcement. The agent sees the full file context, makes surgical changes, and validates against dynamic rules — preserving the codebase while improving it.",
  demos: [],
  backendCode: `existing_code = """
def greet(name):
    print("Hello " + name)

greet("World")
"""

result = full_agent.invoke({
    "task": f"""Modify this existing code:
\\\`\\\`\\\`python
{existing_code}
\\\`\\\`\\\`

Changes requested:
- Add type hints
- Add a docstring
- Support an optional greeting parameter (default "Hello")
- Return the string instead of printing it
- Add tests that verify the output""",
    "rules": "",
    "attempts": 0,
    "max_attempts": 3,
})

print(f"Status: {result['status']} (attempts: {result['attempts']})")
print(f"Output: {result['execution_result']}")
print(f"\\nModified code:\\n{result['code']}")`,
  backendFilename: "inline_edit.py",
  chatConfig: {
    mode: "inline-edit",
    defaultPrompt: `Modify this code:
- Add type hints
- Add a docstring
- Support an optional greeting parameter (default "Hello")
- Return the string instead of printing it
- Add tests that verify the output`,
    inlineEditPrompt: "Add type hints, docstring, optional greeting param, return instead of print, add tests",
    initialCode: {
      filename: "greet.py",
      content: `def greet(name):
    print("Hello " + name)

greet("World")`,
    },
    conversations: {
      default: [
        {
          role: "tool",
          toolName: "generate",
          toolArgs: { attempt: "1", mode: "inline-edit" },
          content: `def greet(name: str, greeting: str = "Hello") -> str:
    """Greets a person with the specified greeting.

    Args:
        name: The name of the person to greet.
        greeting: The greeting to use. Defaults to "Hello".

    Returns:
        The greeting message.
    """
    return greeting + ' ' + name


def test_greet():
    assert greet("World") == "Hello World"
    assert greet("Alice") == "Hello Alice"
    assert greet("Bob", "Hi") == "Hi Bob"
    assert greet("Charlie", "Good morning") == "Good morning Charlie"


if __name__ == "__main__":
    test_greet()
    print("All tests passed!")`,
        },
        {
          role: "tool",
          toolName: "execute",
          toolArgs: { status: "SUCCESS" },
          content: `stdout: All tests passed!
returncode: 0`,
        },
        {
          role: "tool",
          toolName: "review",
          toolArgs: { approved: "true" },
          content: `Code approved. Type hints, docstring, optional parameter, return value, and tests all present.`,
        },
        {
          role: "assistant",
          content: `✓ Inline edit completed in 1 attempt

**Changes applied:**
- Added type hints (\`name: str\`, \`greeting: str\`, \`-> str\`)
- Added Google-style docstring
- Added optional \`greeting\` parameter with default "Hello"
- Changed \`print()\` to \`return\`
- Added test function with assertions
- Added \`if __name__\` guard

**Test output:** All tests passed!`,
        },
      ],
    },
    generatedFile: {
      filename: "greet.py",
      content: `def greet(name: str, greeting: str = "Hello") -> str:
    """Greets a person with the specified greeting.

    Args:
        name: The name of the person to greet.
        greeting: The greeting to use. Defaults to "Hello".

    Returns:
        The greeting message.
    """
    return greeting + ' ' + name


def test_greet():
    assert greet("World") == "Hello World"
    assert greet("Alice") == "Hello Alice"
    assert greet("Bob", "Hi") == "Hi Bob"
    assert greet("Charlie", "Good morning") == "Good morning Charlie"


if __name__ == "__main__":
    test_greet()
    print("All tests passed!")`,
    },
  },
};
