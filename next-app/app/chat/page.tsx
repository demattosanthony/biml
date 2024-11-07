"use client";

import ChatInputForm from "@/components/chat/ChatInputForm";
import ChatMessagesList from "@/components/chat/MessagesList";
import CodeViewer from "@/components/code-viewer";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const { selectedIfcFile } = useChat();

  return (
    <div className="h-screen w-screen flex">
      <div className="flex flex-1 flex-col">
        <ChatMessagesList />

        <div className="w-full flex items-center justify-center mx-auto p-2 pt-1">
          <ChatInputForm />
        </div>
      </div>

      {selectedIfcFile && (
        <div className="flex flex-1 max-w-[50%] transition-all ease-in-out">
          <CodeViewer
            code={selectedIfcFile.content || ""}
            fileName="test.ifc"
          />
        </div>
      )}
    </div>
  );
}
