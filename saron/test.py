import json
from saron.ifc_session import IfcSession
from litellm import completion, stream_chunk_builder
import json
import sys
from saron.tools import tool

session = IfcSession("/Users/anthonydemattos/auto-bim/train/dataset/mechanical.ifc")




project = session.list_projects()[0]

prompt = f"""IFC Project info:

{project}"""

user_input = input("User: ")
prompt += f"\n\n{user_input}"

messages = [
    {"role": "user", "content": prompt},
]

claude_haiku = "claude-3-5-haiku-20241022"
claude_sonnet = "claude-3-5-sonnet-20241022"
o1 = "o1"
o1_mini = "o1-mini"
gpt_4o = "gpt-4o"
gemini = "gemini/gemini-exp-1206"
gemini_flash = "gemini/gemini-2.0-flash-exp"

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
