from litellm import completion, stream_chunk_builder
import base64
import os
import json
import sys
from saron.tools import vi_code_editor, run_code

tools = {
    "vi_code_editor": vi_code_editor,
    "run_code": run_code,
}

# Load in bim object library. Read all file names from bim_objects folder
# bim_objects = []
# for file in os.listdir("bim_objects"):
#     if file.endswith(".ifc"):
#         bim_objects.append(file)

ifcopenshell_doc_paths = [
    # "/Users/anthonydemattos/auto-bim/docs/hello-world.md",
    # "/Users/anthonydemattos/auto-bim/docs/code-examples.md",
    # "/Users/anthonydemattos/auto-bim/docs/geomtry-processing.md",
    "/Users/anthonydemattos/auto-bim/docs/geometry-creation.md",
    # "/Users/anthonydemattos/auto-bim/docs/geometry-tree.md"
]

# read in the geomtry creation docs
ifcopenshell_docs = ""
for doc_path in ifcopenshell_doc_paths:
    with open(doc_path, "r") as file:
        ifcopenshell_docs += file.read() + ("\n" if doc_path != ifcopenshell_doc_paths[-1] else "")

# Inital code
model = ""
with open("model.py", "r") as file:
    model = file.read()

bim_spec = input("Enter the BIM specification: ")

# <ifcopenshell_docs>
# {ifcopenshell_docs}
# </ifcopenshell_docs>

prompt = f"""<memory>
1. You are currently at the path /Users/anthonydemattos/auto-bim/saron on this system.
2. when using the guid or other modules from ifcopenshell you need to import like this: `from ifcopenshell import guid`
</memory>

<inital_code>
{model}
</inital_code>

The inital code above is the current contents of the model.py file with the absolute path of /Users/anthonydemattos/auto-bim/saron/model.py

<bim_specification>
{bim_spec}
</bim_specification>

Your task is to write the code leveraging the ifcopenshell python library to meet the specified BIM requirements. Use the vi_code_editor tool when writing the code, instead of writing it all out and then updating.

Follow these steps to complete the task:
1. As a first step, analyze the provided code and the BIM specification.
2. Create a plan of action to modify the code to meet the BIM requirements.
3. Update the sourcecode to implement the plan.
4. Run the code to make sure it works as expected.

Always set up context for 3d and plan views in the IFC file. Your thinking should be thorough so it's fine if it's very long. Always save the file to output.ifc in the script."""


def update_code(new_code):
    model = new_code

    with open("model.py", "w") as file:
        file.write(model)

    return "Code updated successfully."


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
                print(f"Parameters: {tool_parameters}")

                result = ""
                tool_function = tools.get(tool_name)
                if tool_function:
                    result = tool_function.execute(tool_parameters)
                else:
                    result = f"Error: Tool '{tool_name}' not found."

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
