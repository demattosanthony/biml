from typing import AsyncGenerator
import json
from litellm import acompletion, stream_chunk_builder
from .thread import Message, ThreadManager, ToolCall
from .ifc_session import IfcSessionManager


class Agent:
    def __init__(self, model_name: str, thread_manager: ThreadManager, ifc_session_manager: IfcSessionManager):
        self.model_name, self.thread_manager, self.ifc_session_manager = model_name, thread_manager, ifc_session_manager

    async def chat(self, thread_id: str, verbose=False) -> AsyncGenerator[str, None]:
        thread = self.thread_manager.get_thread(thread_id)
        ifc_session = self.ifc_session_manager.get_session(session_id=thread.session_id)
        if not (thread and ifc_session):
            raise ValueError(f"Thread {thread_id} not found")

        formatted_messages = thread.get_formatted_messages()
        tools = ifc_session.get_tools()

        while True:
            try:
                response = await acompletion(
                    model=self.model_name, messages=formatted_messages, temperature=0, stream=True, tools=[tool.to_dict() for tool in tools.values()]
                )

                chunks, current_content = [], ""
                async for chunk in response:
                    chunks.append(chunk)
                    content_delta = chunk.choices[0].delta.content or ""
                    if verbose:
                        print(content_delta, flush=True, end="")
                    current_content += content_delta
                    yield "event: message\ndata: " + json.dumps({"chunk": content_delta}) + "\n\n"

                model_response = stream_chunk_builder(chunks)
                response_message = model_response.choices[0].message

                tool_calls = [
                    ToolCall(id=tc.id, name=tc.function.name, arguments=tc.function.arguments)
                    for tc in getattr(response_message, "tool_calls", []) or []
                    if hasattr(tc, "function")
                ]

                self.thread_manager.add_message(thread_id, Message(role="assistant", content=current_content, tool_calls=tool_calls))

                if not tool_calls:
                    return

                for tool_call in tool_calls:
                    yield "event: tool_selected\ndata: " + json.dumps(
                        {"id": tool_call.id, "name": tool_call.name, "arguments": tool_call.arguments}
                    ) + "\n\n"

                    if verbose:
                        print(f"Tool Call: {tool_call.name}, with arguments: {tool_call.arguments}")

                    try:
                        result = self._execute_tool_call(tool_call, tools)
                        yield "event: tool_result\ndata: " + json.dumps({"id": tool_call.id, "result": result}) + "\n\n"
                    except Exception as e:
                        result = f"Error executing tool: {str(e)}"
                        yield "event: tool_result\ndata: " + json.dumps({"id": tool_call.id, "result": str(e), "error": True}) + "\n\n"

                    if tool_call.name == "save_model":
                        tool_call.result = result = "Model saved"

                    if verbose:
                        print(f"Tool Result: {result}")

                    self.thread_manager.add_message(thread_id, Message(role="tool", content=result, tool_calls=[tool_call]))
                    formatted_messages = thread.get_formatted_messages()

            except Exception as e:
                print(f"Error during chat: {str(e)}")
                raise e

    def _execute_tool_call(self, tool_call: ToolCall, tools) -> str:
        try:
            tool_function = tools.get(tool_call.name)
            if not tool_function:
                return f"Tool {tool_call.name} not found"
            result = tool_function.execute(json.loads(tool_call.arguments))
            tool_call.result = result
            return result
        except Exception as e:
            print(f"Error executing tool: {str(e)}")
            raise e
