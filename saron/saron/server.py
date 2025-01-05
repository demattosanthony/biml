from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
from typing import Generator
from dataclasses import dataclass
from fastapi import UploadFile, File
import os

from saron.agent import Agent
from saron.thread import ThreadManager, Message
from saron.ifc_session import IfcSessionManager

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ifc_session_manager = IfcSessionManager()
thread_manager = ThreadManager(session_manager=ifc_session_manager)

claude_haiku = "claude-3-5-haiku-20241022"
claude_sonnet = "claude-3-5-sonnet-20241022"
o1 = "o1"
o1_mini = "o1-mini"
gpt_4o = "gpt-4o"
gemini = "gemini/gemini-exp-1206"
gemini_flash = "gemini/gemini-2.0-flash-exp"

agent = Agent(model_name=claude_sonnet, thread_manager=thread_manager, ifc_session_manager=ifc_session_manager)


@dataclass
class ChatRequest:
    message: str
    thread_id: str


@app.post("/threads/{ifc_session_id}")
async def threads_endpoint(ifc_session_id: str):
    thread_id = thread_manager.create_thread(session_id=ifc_session_id)
    return {"thread_id": thread_id}


@app.get("/threads/{thread_id}")
async def thread_endpoint(thread_id: str):
    thread = thread_manager.get_thread(thread_id)
    if not thread:
        return {"error": "Thread not found"}
    return thread.to_dict()


@app.post("/ifc_sessions")
async def ifc_sessions_endpoint(file: UploadFile = File(...)):
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # Save the uploaded file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)

    # Create IFC session with saved file
    session_id = ifc_session_manager.create_session(file_path)
    return {"session_id": session_id}


@app.post("/chat")
async def chat_endpoint(request: ChatRequest) -> StreamingResponse:
    try:
        # Add user message to thread
        user_message = Message(role="user", content=request.message)
        thread_manager.add_message(request.thread_id, message=user_message)

        def event_stream() -> Generator[str, None, None]:
            for chunk in agent.chat(thread_id=request.thread_id, verbose=True):
                yield chunk

            yield "event: DONE\ndata: {}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Welcome to AI Chat API"}


if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", port=8000, reload=True, app="saron.server:app")
