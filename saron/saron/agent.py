from typing import Generator
import json
from litellm import completion, stream_chunk_builder
from .thread import Message, ThreadManager, ToolCall
from .ifc_session import IfcSessionManager


class Agent:
    def __init__(self, model_name: str, thread_manager: ThreadManager, ifc_session_manager: IfcSessionManager):
        self.model_name = model_name
        self.thread_manager = thread_manager
        self.ifc_session_manager = ifc_session_manager

    def chat(self, thread_id: str, ifc_session_id: str, verbose=False) -> Generator[str, None, None]:
        ifc_session = self.ifc_session_manager.get_session(ifc_session_id)
        thread = self.thread_manager.get_thread(thread_id)
        if not thread or not ifc_session:
            raise ValueError(f"Thread {thread_id} not found")

        formatted_messages = thread.get_formatted_messages()
        tools = ifc_session.get_tools()

        while True:
            try:
                response = completion(
                    model=self.model_name, messages=formatted_messages, temperature=0, stream=True, tools=[tool.to_dict() for tool in tools.values()]
                )

                chunks = []
                current_content = ""
                for chunk in response:
                    chunks.append(chunk)
                    content_delta = chunk.choices[0].delta.content or ""
                    if verbose:
                        print(content_delta, flush=True, end="")
                    current_content += content_delta
                    yield content_delta

                model_response = stream_chunk_builder(chunks)
                response_message = model_response.choices[0].message

                # Create tool calls list if they exist
                tool_calls = []
                if hasattr(response_message, "tool_calls") and response_message.tool_calls:
                    for tc in response_message.tool_calls:
                        try:
                            tool_calls.append(ToolCall(id=tc.id, name=tc.function.name, arguments=tc.function.arguments))
                        except AttributeError as e:
                            print(f"Error creating tool call: {e}")
                            continue

                # Create and add assistant message
                assistant_message = Message(role="assistant", content=current_content, tool_calls=tool_calls)
                self.thread_manager.add_message(thread_id, assistant_message)

                # Handle tool calls if present
                if tool_calls:
                    for tool_call in tool_calls:
                        if verbose:
                            print(f"Tool Call: {tool_call.name}")
                        if verbose:
                            print(f"Arguments: {tool_call.arguments}")
                        result = self._execute_tool_call(tool_call, tools=tools)
                        # yield f"\nTool Result: {result}\n"
                        if verbose:
                            print(f"Tool Result: {result}")

                        tool_message = Message(role="tool", content=result, tool_calls=[tool_call])
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

    def _execute_tool_call(self, tool_call: ToolCall, tools) -> str:
        try:
            tool_name = tool_call.name
            tool_parameters = json.loads(tool_call.arguments)

            tool_function = tools.get(tool_name)
            if not tool_function:
                return f"Tool {tool_name} not found"

            result = tool_function.execute(tool_parameters)
            tool_call.result = result
            return result
        except Exception as e:
            error_msg = f"Error executing tool: {str(e)}"
            print(error_msg)  # Log the error
            return error_msg
