from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional, List, Any
import uuid

from .ifc_session import IfcSessionManager


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: str
    result: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {"id": self.id, "type": "function", "function": {"name": self.name, "arguments": self.arguments}}


@dataclass
class Message:
    role: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    tool_calls: List[ToolCall] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        if self.role == "tool":
            return {
                "role": "tool",
                "tool_call_id": self.tool_calls[0].id if self.tool_calls else None,
                "name": self.tool_calls[0].name if self.tool_calls else None,
                "content": self.content,
            }
        else:
            msg_dict = {"role": self.role, "content": self.content}
            if self.tool_calls:
                msg_dict["tool_calls"] = [tc.to_dict() for tc in self.tool_calls]
            return msg_dict

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Message":
        tool_calls = []
        if data.get("tool_calls"):  # Safely handle potential None
            for tc in data["tool_calls"]:
                if isinstance(tc, ToolCall):
                    tool_calls.append(tc)
                else:
                    try:
                        tool_calls.append(ToolCall(id=tc["id"], name=tc["function"]["name"], arguments=tc["function"]["arguments"]))
                    except (KeyError, TypeError) as e:
                        print(f"Error parsing tool call: {e}")
                        continue
        return cls(role=data["role"], content=data.get("content", ""), tool_calls=tool_calls)


@dataclass
class Thread:
    session_id: str 
    thread_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    messages: List[Message] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    
    def add_message(self, message: Message) -> None:
        self.messages.append(message)

    def get_formatted_messages(self) -> List[Dict[str, Any]]:
        return [msg.to_dict() for msg in self.messages]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "thread_id": self.thread_id,
            "created_at": self.created_at.isoformat(),
            "session_id": self.session_id,
            "messages": [msg.to_dict() for msg in self.messages],
        }



class ThreadManager:
    def __init__(self, session_manager: IfcSessionManager):
        self._threads: Dict[str, Thread] = {}
        self._session_manager = session_manager 

    def create_thread(self, session_id: str) -> str:
        if not self._session_manager.get_session(session_id):
            raise ValueError(f"Session {session_id} does not exist")
        thread = Thread(session_id=session_id)
        self._threads[thread.thread_id] = thread
        return thread.thread_id

    def get_thread(self, thread_id: str) -> Optional[Thread]:
        return self._threads.get(thread_id)

    def add_message(self, thread_id: str, message: Message) -> None:
        thread = self.get_thread(thread_id)
        if not thread:
            raise ValueError(f"Thread {thread_id} not found")
        thread.add_message(message)

    def get_messages(self, thread_id: str) -> List[Message]:
        thread = self.get_thread(thread_id)
        if not thread:
            raise ValueError(f"Thread {thread_id} not found")
        return thread.messages

    def to_dict(self) -> Dict[str, Any]:
        return {
            "threads": [thread.to_dict() for thread in self._threads.values()]
        }
