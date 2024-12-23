from saron.thread import ThreadManager, Message
from saron.agent import Agent
from saron.ifc_session import IfcSessionManager

claude_sonnet = "claude-3-5-sonnet-20241022"

thread_manager = ThreadManager()
thread_id = thread_manager.create_thread()
thread = thread_manager.get_thread(thread_id)

ifc_session_manager = IfcSessionManager()
session_id = ifc_session_manager.create_session("/Users/anthonydemattos/auto-bim/train/dataset/mechanical.ifc")
session = ifc_session_manager.get_session(session_id)

agent = Agent(model_name=claude_sonnet, thread_manager=thread_manager, ifc_session_manager=ifc_session_manager)

project = session.list_projects()[0]

prompt = f"""IFC Project info:

{project}"""

user_input = input("User: ")
prompt += f"\n\n{user_input}"

thread.add_message(message=Message(role="user", content=user_input))


def main():
    while True:
        for chunk in agent.chat(thread_id=thread_id, ifc_session_id=session_id):
            print(chunk, flush=True, end="")

        user_input = input("User: ")
        thread.add_message(message=Message(role="user", content=user_input))


if __name__ == "__main__":
    main()
