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

    def tearDown(self):
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

    def test_vi_editor_multiple_commands(self):
        """Test executing multiple vi commands in sequence"""
        # First verify the initial content
        with open(self.temp_file_name, 'r') as f:
            initial_content = f.read().splitlines()
            self.assertEqual(len(initial_content), 2)  # Should be 2 lines initially

        # Using proper ex command format without pipes
        commands = """1i
New first line
.
$a
Last line
.
w
q"""  # Split write and quit commands
        result = vi_code_editor.execute(filename=self.temp_file_name, commands=commands)
        self.assertEqual(result, "File edited successfully")
        
        # Read and verify the final content
        with open(self.temp_file_name, 'r') as f:
            content = f.read().splitlines()
            # Let's verify each line
            expected_content = [
                "New first line",
                "This is the old line.",
                "Another old line.",
                "Last line"
            ]
            self.assertEqual(content, expected_content)
            self.assertEqual(len(content), 4)  # Should now have 4 lines total

    def test_vi_editor_invalid_commands(self):
        """Test handling of invalid vi commands"""
        commands = "invalid_command\nwq"
        with self.assertRaises(RuntimeError):
            vi_code_editor.execute(filename=self.temp_file_name, commands=commands)

    def test_vi_editor_nonexistent_file(self):
        """Test editing a nonexistent file"""
        commands = "i|Some content\n.\nwq"
        with self.assertRaises(RuntimeError):
            vi_code_editor.execute(filename="/nonexistent/file.txt", commands=commands)

    def test_get_current_weather_default_unit(self):
        """Test weather function with default unit parameter"""
        result = get_current_weather.execute(location="London")
        self.assertEqual(result["unit"], "celsius")
        self.assertEqual(result["location"], "London")

    def test_get_current_weather_invalid_params(self):
        """Test weather function with missing required parameter"""
        with self.assertRaises(TypeError):
            get_current_weather.execute()

    def test_add_numbers_negative_values(self):
        """Test addition with negative numbers"""
        result = add_numbers.execute(a=-3, b=-5)
        self.assertEqual(result, -8)

    def test_add_numbers_zero_values(self):
        """Test addition with zero values"""
        result = add_numbers.execute(a=0, b=0)
        self.assertEqual(result, 0)

    def test_tool_schema_docstring_preservation(self):
        """Test that tool decorator preserves function docstrings in schema"""
        tool_dict = add_numbers.to_dict()
        self.assertIn("Add two numbers together.", tool_dict["function"]["description"])

    def test_tool_execute_invalid_param_type(self):
        """Test handling of invalid parameter types"""
        with self.assertRaises(TypeError):
            add_numbers.execute(a="not a number", b=5)

    def test_vi_editor_complex_editing(self):
        """Test complex editing operations with vi"""
        commands = (
            "1,$d\n"  # Delete all lines
            "i|First line\nSecond line\nThird line\n.\n"  # Insert new content
            "2s/Second/Modified/\n"  # Substitute text on line 2
            "wq"  # Save and quit
        )
        result = vi_code_editor.execute(filename=self.temp_file_name, commands=commands)
        self.assertEqual(result, "File edited successfully")
        
        with open(self.temp_file_name, 'r') as f:
            content = f.read().splitlines()
            self.assertEqual(len(content), 3)
            self.assertEqual(content[0], "First line")
            self.assertEqual(content[1], "Modified line")
            self.assertEqual(content[2], "Third line")

    def test_tool_execute_dict_missing_params(self):
        """Test execution with missing parameters in dict form"""
        with self.assertRaises(TypeError):
            add_numbers.execute({"a": 3})  # Missing 'b' parameter

    def test_tool_execute_kwargs_strict_params(self):
        """Test that extra parameters are not allowed"""
        with self.assertRaises(TypeError):
            add_numbers.execute(a=3, b=5, extra="ignored")


if __name__ == "__main__":
    unittest.main()