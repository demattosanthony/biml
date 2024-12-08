import inspect
import subprocess
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
    """
    Edit a file using vi editor's ex mode commands. This function allows programmatic text editing
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
        # Insert two lines at line 1
        commands = "1i|Hello World\nSecond line\n.\nwq"
        
        # Append text at line 5 and delete line 7
        commands = "5a|New Line\n.\n7dd\nwq"
        
        # Replace line 3 with new content
        commands = "3d\n2a|Updated Content\n.\nwq"

    Returns:
        str: "File edited successfully" if the operation succeeds

    Raises:
        RuntimeError: If the vi commands fail to execute, with the specific error message
        subprocess.CalledProcessError: If the subprocess fails to run
    """
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
        import subprocess

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