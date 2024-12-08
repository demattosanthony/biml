import unittest
import tempfile
import os
from subprocess import CalledProcessError
from saron.tools import tool, vi_code_editor

@tool
def get_current_weather(location: str, unit: str = "celsius"):
    """
    This function gets current weather in a given location.
    """
    return {
        "location": location,
        "temperature": "20",
        "unit": unit,
        "condition": "Sunny"
    }

@tool
def say_hello(name: str):
    """Greet someone by name."""
    return f"Hello, {name}!"

@tool
def add_numbers(a: int, b: int):
    """
    Add two numbers together.
    """
    return a + b

class TestToolsDecorator(unittest.TestCase):
    def setUp(self):
        # Create a temporary file with initial content
        self.temp_file = tempfile.NamedTemporaryFile(delete=False)
        self.temp_file_name = self.temp_file.name
        initial_content = "This is the old line.\nAnother old line.\n"
        self.temp_file.write(initial_content.encode('utf-8'))
        self.temp_file.close()
        # self.temp_file_name = "/Users/anthonydemattos/auto-bim/saron/model.py"

    def tearDown(self):
        # Clean up the temp file
        if os.path.exists(self.temp_file_name):
            os.remove(self.temp_file_name)

    def test_get_current_weather_tool_schema(self):
        tool_dict = get_current_weather.to_dict()
        self.assertEqual(tool_dict["type"], "function")
        self.assertEqual(tool_dict["function"]["name"], "get_current_weather")
        self.assertIn("current weather in a given location", tool_dict["function"]["description"])
        params = tool_dict["function"]["parameters"]
        self.assertEqual(params["type"], "object")
        self.assertIn("location", params["properties"])
        self.assertIn("required", params)
        self.assertIn("location", params["required"])
        # Check default type for unit was handled
        self.assertIn("unit", params["properties"])

    def test_get_current_weather_execute(self):
        result = get_current_weather.execute(location="New York, NY", unit="fahrenheit")
        self.assertEqual(result["location"], "New York, NY")
        self.assertEqual(result["unit"], "fahrenheit")
        self.assertEqual(result["condition"], "Sunny")

    def test_say_hello_tool_schema(self):
        tool_dict = say_hello.to_dict()
        self.assertEqual(tool_dict["function"]["name"], "say_hello")
        self.assertIn("Greet someone by name.", tool_dict["function"]["description"])
        params = tool_dict["function"]["parameters"]
        self.assertIn("name", params["properties"])
        self.assertIn("name", params["required"])

    def test_tool_execute_with_dict(self):
        """Test tool execution with a dictionary of arguments"""
        result = add_numbers.execute({"a": 3, "b": 5})
        self.assertEqual(result, 8)

    def test_tool_execute_with_kwargs(self):
        """Test tool execution with keyword arguments"""
        result = add_numbers.execute(a=3, b=5)
        self.assertEqual(result, 8)

    def test_add_numbers_tool_schema(self):
        tool_dict = add_numbers.to_dict()
        self.assertEqual(tool_dict["function"]["name"], "add_numbers")
        self.assertIn("Add two numbers together.", tool_dict["function"]["description"])
        params = tool_dict["function"]["parameters"]
        self.assertEqual(params["properties"]["a"]["type"], "number")
        self.assertEqual(params["properties"]["b"]["type"], "number")
        self.assertIn("a", params["required"])
        self.assertIn("b", params["required"])

    def test_add_numbers_execute(self):
        result = add_numbers.execute(a=3, b=5)
        self.assertEqual(result, 8)


    def test_basic_editing(self):
        # test editing a file
        commands = '1i|Line 1 content\nLine 2 content'
        result = vi_code_editor.execute(filename=self.temp_file_name, commands=commands)
        
        # Verify the result
        self.assertEqual(result, "File edited successfully")
        
        # Check the file contents
        with open(self.temp_file_name, "r") as f:
            content = f.read()
        
        self.assertIn("Line 1 content", content)


if __name__ == "__main__":
    unittest.main()