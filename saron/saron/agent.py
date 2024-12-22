from typing import Generator, Any, Dict, Optional
import json
from litellm import completion, stream_chunk_builder
from .thread import Message, ThreadManager, ToolCall

class Agent:
    def __init__(self, tools: Dict[str, Any], model_name: str, thread_manager: ThreadManager):
        self.tools = tools
        self.model_name = model_name
        self.thread_manager = thread_manager

    def chat(self, thread_id: str) -> Generator[str, None, None]:
        thread = self.thread_manager.get_thread(thread_id)
        if not thread:
            raise ValueError(f"Thread {thread_id} not found")

        formatted_messages = thread.get_formatted_messages()
        
        while True:
            try:
                response = completion(
                    model=self.model_name,
                    messages=formatted_messages,
                    temperature=0,
                    stream=True,
                    tools=[tool.to_dict() for tool in self.tools.values()]
                )
                
                chunks = []
                current_content = ""
                for chunk in response:
                    chunks.append(chunk)
                    content_delta = chunk.choices[0].delta.content or ""
                    print(content_delta, flush=True, end="")
                    current_content += content_delta
                    yield content_delta
                
                model_response = stream_chunk_builder(chunks)
                response_message = model_response.choices[0].message
                
                # Create tool calls list if they exist
                tool_calls = []
                if hasattr(response_message, 'tool_calls') and response_message.tool_calls:
                    for tc in response_message.tool_calls:
                        try:
                            tool_calls.append(ToolCall(
                                id=tc.id,
                                name=tc.function.name,
                                arguments=tc.function.arguments
                            ))
                        except AttributeError as e:
                            print(f"Error creating tool call: {e}")
                            continue

                # Create and add assistant message
                assistant_message = Message(
                    role='assistant',
                    content=current_content,
                    tool_calls=tool_calls
                )
                self.thread_manager.add_message(thread_id, assistant_message)
                
                # Handle tool calls if present
                if tool_calls:
                    for tool_call in tool_calls:
                        print(f"Tool Call: {tool_call.name}")
                        print(f"Arguments: {tool_call.arguments}")
                        result = self._execute_tool_call(tool_call)
                        yield f"\nTool Result: {result}\n"
                        print(f"Tool Result: {result}")
                        
                        tool_message = Message(
                            role='tool',
                            content=result,
                            tool_calls=[tool_call]
                        )
                        self.thread_manager.add_message(thread_id, tool_message)
                        
                        # Update formatted messages for next iteration
                        formatted_messages = thread.get_formatted_messages()
                else:
                    return

            except Exception as e:
                error_msg = f"Error during chat: {str(e)}"
                print(error_msg)  # Log the error
                yield error_msg
                return

    def _execute_tool_call(self, tool_call: ToolCall) -> str:
        try:
            tool_name = tool_call.name
            tool_parameters = json.loads(tool_call.arguments)
            
            tool_function = self.tools.get(tool_name)
            if not tool_function:
                return f"Tool {tool_name} not found"
            
            result = tool_function.execute(tool_parameters)
            tool_call.result = result
            return result
        except Exception as e:
            error_msg = f"Error executing tool: {str(e)}"
            print(error_msg)  # Log the error
            return error_msg


# tools = {
#     "vi_code_editor": vi_code_editor,
#     "run_code": run_code,
#     "browse_ifcopenshell_codebase": browse_ifcopenshell_codebase,
# }

# # Inital code
# inital_code = """import ifcopenshell
# from ifcopenshell import api
# from ifcopenshell.api import project, root

# # Setup project
# model = ifcopenshell.api.project.create_file(version="IFC4")
# project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="My Project")
# site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite", name="Site")
# building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding", name="Building")
# """
# with open("model.py", "w") as file:
#     file.write(inital_code)

# bim_spec = input("Enter the BIM specification: ")

# # ifcopenshell_docs = ""
# # with open("/Users/anthonydemattos/auto-bim/docs/geometry-creation.md", "r") as file:
# #     ifcopenshell_docs = file.read()
# #     <ifcopenshell_docs>
# # {ifcopenshell_docs}
# # </ifcopenshell_docs>

# prompt = f"""<memory>
# 1. You are currently at the path /Users/anthonydemattos/auto-bim/saron on this system.
# 2. when using any modules from ifcopenshell, you should import them like this: `from ifcopenshell import module_name`
# </memory>

# <file>
#     <filepath>/Users/anthonydemattos/auto-bim/saron/model.py</filepath>
#     <contents>
#     {inital_code}
#     </contents>
# </file>

# <bim_specification>
# {bim_spec}
# </bim_specification>

# Your task is to write the code leveraging the ifcopenshell python library to meet the specified BIM requirements. Use the vi_code_editor tool when writing the code, instead of writing it all out and then updating.

# Follow these steps to complete the task:
# 1. As a first step, analyze the provided code and the BIM specification.
# 2. Create a plan of action to modify the code to meet the BIM requirements.
# 3. Update the sourcecode to implement the plan.
# 4. Run the code to make sure it works as expected.

# Always set up context for 3d and plan views in the IFC file. Your thinking should be thorough so it's fine if it's very long. ALWAYS save the file to output.ifc in the script."""


# # read pdf file as base64 and then utf-8
# # with open("arch_set_setty-office.pdf", "rb") as file:
# #     pdf_base64 = base64.b64encode(file.read()).decode("utf-8")

# messages = [
#     # {"role": "system", "content": system_message},
#     {"role": "user", "content": prompt},
# ]

# claude_haiku = "claude-3-5-haiku-20241022"
# claude_sonnet = "claude-3-5-sonnet-20241022"
# o1_preview = "o1-preview"
# o1_mini = "o1-mini"
# gpt_4o = "gpt-4o"
# pplx_online_big = "perplexity/llama-3.1-sonar-large-128k-online"
# gemini = "gemini/gemini-exp-1206"


# def main():
#     while True:
#         response = completion(
#             model=claude_haiku,
#             messages=messages,
#             temperature=0,
#             stream=True,
#             tools=[tool.to_dict() for tool in tools.values()],
#         )

#         chunks = []
#         for chunk in response:
#             chunks.append(chunk)
#             print(chunk.choices[0].delta.content or "", flush=True, end="")

#         # Rebuild the model response from the chunks
#         model_response = stream_chunk_builder(chunks)

#         # Update the messages
#         messages.append(model_response.choices[0].message.model_dump())

#         # Check for tool calls
#         tool_calls = model_response.choices[0].message.tool_calls
#         if tool_calls:
#             for tool_call in tool_calls:
#                 tool_call_id = tool_call.id
#                 tool_name = tool_call.function.name
#                 tool_parameters = json.loads(tool_call.function.arguments)

#                 print(f"Tool Call: {tool_name}")
#                 for key, value in tool_parameters.items():
#                     print(f"{key}: {value}")

#                 result = ""
#                 tool_function = tools.get(tool_name)
#                 try:
#                     result = tool_function.execute(tool_parameters)
#                 except Exception as e:
#                     result = f"An error occurred: {str(e)}"

#                 messages.append(
#                     {
#                         "tool_call_id": tool_call_id,
#                         "role": "tool",
#                         "name": tool_name,
#                         "content": result,
#                     }
#                 )
#                 print(result)
#         else:
#             user_input = input("\n\nUser: ")
#             if user_input == "exit":
#                 sys.exit()
#             messages.append({"role": "user", "content": user_input})
#         print("\n\n")


# if __name__ == "__main__":
#     main()
