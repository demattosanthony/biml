import json
from saron.ifc_session import IfcSession
from litellm import completion, stream_chunk_builder
import json
import sys
from saron.tools import tool

session = IfcSession("/Users/anthonydemattos/auto-bim/next-app/public/sample.ifc")


@tool 
def list_children(guid: str, ifc_type: str | None = None):
    """This tool acts as model browser for the ifc model. You can use it to navigate the element tree of the ifc model. Provide a guid of an element to list its children.
    
Most elemenet trees beging with the project then a site, then a building, then floors, then spaces, then elements. You can use this tool to navigate the tree and explore the model.

Provide a ifc_type to filter the children by type. For example, ifc_type=IfcWall will only return children that are walls. Only do this if you know the ifc type of the children you are looking for."""
    return json.dumps(session.list_children(guid, ifc_type=ifc_type), indent=2)

@tool
def get_node_info(guid: str):
    """Returns detailed info about a node (element)."""
    return json.dumps(session.get_node_info(guid), indent=2)

tools = {
    "list_children": list_children,
    "get_node_info": get_node_info,
}

project = session.list_projects()[0]

prompt = f"""IFC Project info:

{project}

Use the provided tools to explore the ifc model. Then return a detailed summary of the model."""

messages = [
    {"role": "user", "content": prompt},
]

claude_haiku = "claude-3-5-haiku-20241022"
claude_sonnet = "claude-3-5-sonnet-20241022"
o1 = "o1"
o1_mini = "o1-mini"
gpt_4o = "gpt-4o"
gemini = "gemini/gemini-exp-1206"


def main():
    while True:
        response = completion(
            model=claude_sonnet,
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
                print("\n\nTool Result:")
                print(result)
        else:
            user_input = input("\n\nUser: ")
            if user_input == "exit":
                sys.exit()
            messages.append({"role": "user", "content": user_input})
        print("\n\n")


if __name__ == "__main__":
    main()
