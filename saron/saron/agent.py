from litellm import completion, stream_chunk_builder
import base64
import os
import json
import sys
from saron.tools import vi_code_editor, run_code, browse_ifcopenshell_codebase

tools = {
    "vi_code_editor": vi_code_editor,
    "run_code": run_code,
    "browse_ifcopenshell_codebase": browse_ifcopenshell_codebase,
}

# Inital code
inital_code = """import ifcopenshell
from ifcopenshell import api
from ifcopenshell.api import project, root

# Setup project
model = ifcopenshell.api.project.create_file(version="IFC4")
project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="My Project")
site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite", name="Site")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding", name="Building")
"""
with open("model.py", "w") as file:
    file.write(inital_code)

bim_spec = input("Enter the BIM specification: ")

# ifcopenshell_docs = ""
# with open("/Users/anthonydemattos/auto-bim/docs/geometry-creation.md", "r") as file:
#     ifcopenshell_docs = file.read()
#     <ifcopenshell_docs>
# {ifcopenshell_docs}
# </ifcopenshell_docs>

prompt = f"""<memory>
1. You are currently at the path /Users/anthonydemattos/auto-bim/saron on this system.
2. when using any modules from ifcopenshell, you should import them like this: `from ifcopenshell import module_name`
</memory>

<file>
    <filepath>/Users/anthonydemattos/auto-bim/saron/model.py</filepath>
    <contents>
    {inital_code}
    </contents>
</file>

<bim_specification>
{bim_spec}
</bim_specification>

Your task is to write the code leveraging the ifcopenshell python library to meet the specified BIM requirements. Use the vi_code_editor tool when writing the code, instead of writing it all out and then updating.

Follow these steps to complete the task:
1. As a first step, analyze the provided code and the BIM specification.
2. Create a plan of action to modify the code to meet the BIM requirements.
3. Update the sourcecode to implement the plan.
4. Run the code to make sure it works as expected.

Always set up context for 3d and plan views in the IFC file. Your thinking should be thorough so it's fine if it's very long. ALWAYS save the file to output.ifc in the script."""


# read pdf file as base64 and then utf-8
# with open("arch_set_setty-office.pdf", "rb") as file:
#     pdf_base64 = base64.b64encode(file.read()).decode("utf-8")

messages = [
    # {"role": "system", "content": system_message},
    {"role": "user", "content": prompt},
]

claude_haiku = "claude-3-5-haiku-20241022"
claude_sonnet = "claude-3-5-sonnet-20241022"
o1_preview = "o1-preview"
o1_mini = "o1-mini"
gpt_4o = "gpt-4o"
pplx_online_big = "perplexity/llama-3.1-sonar-large-128k-online"
gemini = "gemini/gemini-exp-1206"


def main():
    while True:
        response = completion(
            model=claude_haiku,
            messages=messages,
            temperature=0,
            stream=True,
            tools=[tool.to_dict() for tool in tools.values()],
        )

        chunks = []
        for chunk in response:
            chunks.append(chunk)
            print(chunk.choices[0].delta.content or "", flush=True, end="")

        # Rebuild the model response from the chunks
        model_response = stream_chunk_builder(chunks)

        # Update the messages
        messages.append(model_response.choices[0].message.model_dump())

        # Check for tool calls
        tool_calls = model_response.choices[0].message.tool_calls
        if tool_calls:
            for tool_call in tool_calls:
                tool_call_id = tool_call.id
                tool_name = tool_call.function.name
                tool_parameters = json.loads(tool_call.function.arguments)

                print(f"Tool Call: {tool_name}")
                for key, value in tool_parameters.items():
                    print(f"{key}: {value}")

                result = ""
                tool_function = tools.get(tool_name)
                try:
                    result = tool_function.execute(tool_parameters)
                except Exception as e:
                    result = f"An error occurred: {str(e)}"

                messages.append(
                    {
                        "tool_call_id": tool_call_id,
                        "role": "tool",
                        "name": tool_name,
                        "content": result,
                    }
                )
                print(result)
        else:
            user_input = input("\n\nUser: ")
            if user_input == "exit":
                sys.exit()
            messages.append({"role": "user", "content": user_input})
        print("\n\n")


if __name__ == "__main__":
    main()
