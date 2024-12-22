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
    
    # Skip 'self' parameter if this is an instance method
    parameters_to_check = sig.parameters.items()
    if 'self' in sig.parameters:
        parameters_to_check = [(name, param) for name, param in parameters_to_check if name != 'self']
    
    for param_name, param in parameters_to_check:
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

    if properties == {}:
        parameters = None

    class BoundToolWrapper:
        def __init__(self, wrapper, instance):
            self.wrapper = wrapper
            self.instance = instance
            
        def __call__(self, *args, **kwargs):
            return self.wrapper.execute(self.instance, *args, **kwargs)
            
        def to_dict(self):
            return self.wrapper.to_dict()
            
        def execute(self, *args, **kwargs):
            if len(args) == 1 and isinstance(args[0], dict):
                return self.wrapper.execute(self.instance, **args[0])
            return self.wrapper.execute(self.instance, *args, **kwargs)

    class ToolWrapper:
        def __init__(self, func, name, description, parameters):
            self.func = func
            self.name = name
            self.description = description
            self.parameters = parameters

        def to_dict(self):
            function_dict = {
                "type": "function",
                "function": {
                    "name": self.name,
                    "description": self.description,
                },
            }
            if self.parameters is not None:
                function_dict["function"]["parameters"] = self.parameters
            return function_dict

        def execute(self, *args, **kwargs):
            """Execute the tool function with either a dict of parameters or keyword arguments"""
            if len(args) == 1 and isinstance(args[0], dict):
                # Handle dictionary input
                return self.func(**args[0])
            # Handle keyword arguments
            return self.func(*args, **kwargs)

        def __call__(self, *args, **kwargs):
            """Make the tool callable like the original function"""
            return self.execute(*args, **kwargs)

        def __get__(self, obj, objtype=None):
            """Support instance method binding"""
            if obj is None:
                return self
            return BoundToolWrapper(self, obj)

    return ToolWrapper(func, name, description, parameters)


@tool
def vi_code_editor(filename: str, commands: str):
    """Edit files using vi editor commands.

    Args:
        filename: Path to file to edit (e.g., '/path/to/file.txt')
        commands: Vi commands, one per line. Use \n between lines.

    Common commands:
        - 'i': Insert at current line
        - 'a': Append after current line
        - '.': End insert/append
        - 'dd': Delete line
        - 'wq': Save and quit

    Examples:
        # Add text after pattern
        commands = "/pattern/a|New text\n.\nwq"

        # Replace line with pattern
        commands = "/old text/c|New text\n.\nwq"

        # Delete lines between patterns
        commands = "/start/,/end/d\nwq"

        # Add text at end of file
        commands = "$a|New text\n.\nwq"

    Note: This tool is mainly used to edit model.py"""
    try:
        # Run ex with the commands string directly
        subprocess.run(["ex", "-sc", commands, "-cx", filename], check=True)
        return "File edited successfully"
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode("utf-8").strip() if e.stderr else str(e)
        raise RuntimeError(f"Failed to edit file: {error_msg}")


@tool
def run_code():
    """Run the current ifcopenshell script and generate the output IFC file. This will return any errors that need to be fixed."""
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
def browse_ifcopenshell_codebase(path: str, filename: str = None):
    """Browse or read files from the ifcopenshell-python source code.

    Args:
        path: Directory path starting with '/ifcopenshell' (e.g., '/ifcopenshell' or '/ifcopenshell/api')
        filename: (Optional) Name of file to read. If not provided, lists directory contents instead.

    Examples:
        # List files in main directory
        browse_ifcopenshell_codebase(path="/ifcopenshell")

        # List files in API directory
        browse_ifcopenshell_codebase(path="/ifcopenshell/api")

        # Read a specific file
        browse_ifcopenshell_codebase(path="/ifcopenshell/api", filename="project.py")

    Note: This tool is read-only and cannot modify files.."""
    root_path = "/Users/anthonydemattos/IfcOpenShell/src/ifcopenshell-python/"
    path = "/Users/anthonydemattos/IfcOpenShell/src/ifcopenshell-python" + path

    # Construct the absolute path
    absolute_path = os.path.abspath(os.path.join(root_path, path))

    # Check if the path is within the root directory
    if not absolute_path.startswith(os.path.abspath(root_path)):
        return "Error: The specified path is outside the 'root' codebase."

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
