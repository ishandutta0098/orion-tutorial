from langchain_core.tools import tool
import os
import subprocess


def create_tools(workspace_path: str):
    @tool
    def read_file(filepath: str) -> str:
        """Read the contents of a file and return it as a string."""
        full_path = os.path.join(workspace_path, filepath)
        if not os.path.realpath(full_path).startswith(os.path.realpath(workspace_path)):
            return "Error: Access denied - path outside workspace"
        if not os.path.exists(full_path):
            return f"Error: File not found: {filepath}"
        with open(full_path, "r") as f:
            return f.read()

    @tool
    def write_file(filepath: str, content: str) -> str:
        """Write content to a file. Creates directories if needed."""
        full_path = os.path.join(workspace_path, filepath)
        if not os.path.realpath(full_path).startswith(os.path.realpath(workspace_path)):
            return "Error: Access denied - path outside workspace"
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content)
        return f"Successfully wrote to {filepath}"

    @tool
    def list_directory(directory: str = ".") -> str:
        """List contents of a directory."""
        full_path = os.path.join(workspace_path, directory)
        if not os.path.realpath(full_path).startswith(os.path.realpath(workspace_path)):
            return "Error: Access denied - path outside workspace"
        if not os.path.isdir(full_path):
            return f"Error: Not a directory: {directory}"
        entries = []
        for entry in sorted(os.listdir(full_path)):
            if entry.startswith('.') or entry == '__pycache__':
                continue
            entry_path = os.path.join(full_path, entry)
            prefix = "[DIR]" if os.path.isdir(entry_path) else "[FILE]"
            entries.append(f"{prefix} {entry}")
        return "\n".join(entries) if entries else "Empty directory"

    @tool
    def execute_shell(command: str) -> str:
        """Execute a shell command and return the output."""
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True,
            timeout=15, cwd=workspace_path
        )
        output = ""
        if result.stdout:
            output += f"STDOUT:\n{result.stdout}"
        if result.stderr:
            output += f"STDERR:\n{result.stderr}"
        if not output:
            output = "(no output)"
        return f"Exit code: {result.returncode}\n{output}"

    return [read_file, write_file, list_directory, execute_shell]
