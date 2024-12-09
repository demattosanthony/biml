import inspect
import subprocess
import os
from typing import get_type_hints

def tool(func):
    # Extract the name and docstring
    name = func.__name__
    description = inspect.getdoc(func) or ""

    # Extract parameters
    sig = inspect.signature(func)
    hints = get_type_hints(func)
    properties = {}
    required = []
    for param_name, param in sig.parameters.items():
        if param_name == 'self':
            # skip 'self' for class methods
            continue
        prop = {"type": "string"}  # default type
        if param_name in hints:
            # Simple type mapping if available
            hint_type = hints[param_name]
            if hint_type in (int, float):
                prop["type"] = "number"
            elif hint_type == bool:
                prop["type"] = "boolean"
            else:
                prop["type"] = "string"
        properties[param_name] = prop
        if param.default is param.empty:
            required.append(param_name)

    parameters = {
        "type": "object",
        "properties": properties,
    }
    if required:
        parameters["required"] = required

    # Create a tool object with execute logic
    class ToolWrapper:
        def __init__(self, func, name, description, parameters):
            self.func = func
            self.name = name
            self.description = description
            self.parameters = parameters

        def to_dict(self):
            return {
                "type": "function",
                "function": {
                    "name": self.name,
                    "description": self.description,
                    "parameters": self.parameters,
                },
            }

        def execute(self, *args, **kwargs):
            """Execute the tool function with either a dict of parameters or keyword arguments"""
            if len(args) == 1 and isinstance(args[0], dict):
                # Handle dictionary input
                return self.func(**args[0])
            # Handle keyword arguments
            return self.func(**kwargs)

    return ToolWrapper(func, name, description, parameters)

@tool
def vi_code_editor(filename: str, commands: str):
    """Edit a file using vi editor's ex mode commands. This function allows programmatic text editing
    by executing a series of vi/ex commands on a specified file.
    
    Args:
        filename: The absolute path to the file to edit
        commands: A string containing vi/ex commands, with each command on a new line.
                 For multi-line inserts, use \n to separate lines.

    Common vi/ex commands:
        - 'i': Insert text at current line
        - 'a': Append text after current line
        - '.': End insert/append mode
        - 'dd': Delete current line
        - 'wq': Save and quit

    Examples:
        # Insert text after a specific pattern
        commands = "/pattern/a|New text after pattern\n.\nwq"
        
        # Replace a line containing a pattern
        commands = "/old text/c|Updated content\n.\nwq"
        
        # Delete lines between two patterns
        commands = "/start pattern/,/end pattern/d\nwq"
        
        # Append text at the end of file
        commands = "$a|Text at end of file\n.\nwq"

    Returns:
        str: "File edited successfully" if the operation succeeds

    Raises:
        RuntimeError: If the vi commands fail to execute, with the specific error message
        subprocess.CalledProcessError: If the subprocess fails to run

    You should mainly use this tool to edit the model.py file to meet the BIM requirements."""
    try:
        # Run ex with the commands string directly
        subprocess.run(["ex", "-sc", commands, "-cx", filename], check=True)
        return "File edited successfully"
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8').strip() if e.stderr else str(e)
        raise RuntimeError(f"Failed to edit file: {error_msg}")

@tool
def run_code():
    """
    Run the current ifcopenshell script and generate the output IFC file. This will return any errors that need to be fixed.
    """
    try:
        # Run the model.py script using subprocess
        result = subprocess.run(
            [
                "/Users/anthonydemattos/auto-bim/saron/.venv/bin/python3",
                "/Users/anthonydemattos/auto-bim/saron/model.py",
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print("An error occurred during code execution.")
            print(f"Error Message: {result.stderr}")

            return f"An error occurred while running the code. The error message is:\n{result.stderr}"
        else:
            print(result.stdout)
            return "Code executed successfully."
    except Exception as e:
        return f"An error occurred: {str(e)}"

@tool
def browse_codebase(path: str, filename: str = None):
    """This tool is designed to interact with the Bonsai (formerly blenderbim) codebase, a Blender addon for IFC editing. It provides two primary functionalities: browsing directories and reading file contents.

**Functionality:**

1. **Directory Browsing:**
    *   You can use this tool to list the contents of any directory within the Bonsai codebase.
    *   To do this, provide the `path` argument, which should be a string representing the directory path relative to the root of the Bonsai repository (`/bonsai`).
    *   The tool will return a list of strings, where each string is the name of a file or subdirectory within the specified directory.

2. **File Reading:**
    *   You can use this tool to read the contents of a specific file within the Bonsai codebase.
    *   To do this, provide both the `path` argument (the directory containing the file) and the `filename` argument (the name of the file you want to read).
    *   The tool will return a string containing the entire content of the specified file.

**Arguments:**

*   `path` (str): The directory path within the Bonsai codebase, relative to the root directory `/bonsai`. For example:
    *   `/bonsai` to refer to the main source directory.
    *   `/bonsai/bonsai/core` to refer to the `core` subdirectory.
*   `filename` (str, optional): The name of the file you want to read. If provided, the tool will return the file's content. If omitted, the tool will list the contents of the directory specified by `path`.

**Error Handling:**

The tool includes error handling for various scenarios:

*   **Invalid Path:** If the provided `path` does not exist or is outside the Bonsai codebase, it returns an appropriate error message.
*   **Not a File:** If a `filename` is provided, but it does not correspond to a file in the specified `path`, an error message is returned.
*   **Read/List Errors:** If there are issues reading the file or listing the directory contents (e.g., due to permissions), an error message detailing the issue is returned.

**Examples:**

*   **List contents of the main source directory:**
    ```python
    browse_codebase(path="/bonsai")
    ```
*   **List contents of the `core` directory:**
    ```python
    browse_codebase(path="/bonsai/bonsai/core")
    ```
*   **Read the contents of the `project.py` file within the `core` directory:**
    ```python
    browse_codebase(path="/bonsai/bonsai/core", filename="project.py")
    ```

**Important Notes:**

*   The tool assumes that the Bonsai repository is located at `/Users/anthonydemattos/IfcOpenShell/src/bonsai`.
*   All paths are relative to the root of the Bonsai repository (`/bonsai`).
*   The tool is read-only; it cannot modify files or directories.

When writing code that uses this package make sure to import from bonsai and not from legacy blenderbim. Don't be afraid to really explore the codebase and see the contens of lots of files."""
    bonsai_root = "/Users/anthonydemattos/IfcOpenShell/src/bonsai"  # Assuming 'bonsai' is in the current working directory
    path = "/Users/anthonydemattos/IfcOpenShell/src" + path

    # Construct the absolute path
    absolute_path = os.path.abspath(os.path.join(bonsai_root, path))

    # Check if the path is within the bonsai directory
    if not absolute_path.startswith(os.path.abspath(bonsai_root)):
        return "Error: The specified path is outside the 'bonsai' codebase."

    if not os.path.exists(absolute_path):
        return f"Error: The path '{path}' does not exist."

    if filename:
        # Display file content
        file_path = os.path.join(absolute_path, filename)
        if not os.path.isfile(file_path):
            return f"Error: '{filename}' is not a file in the specified path."
        try:
            with open(file_path, "r") as f:
                content = f.read()
            return content
        except Exception as e:
            return f"Error reading file: {e}"
    else:
        # List directory contents
        try:
            items = os.listdir(absolute_path)
            return str(items)
        except Exception as e:
            return f"Error listing directory contents: {e}"