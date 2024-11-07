"use client";

import ChatInputForm from "@/components/chat/ChatInputForm";
import ChatMessagesList from "@/components/chat/MessagesList";
import CodeViewer from "@/components/code-viewer";
import { useChat } from "@/hooks/useChat";
import { useMemo } from "react";

export default function ChatPage() {
  const { messages } = useChat();

  const latestIfcFileContent = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].ifcFileContent) {
        return messages[i].ifcFileContent;
      }
    }
    return null;
  }, [messages]);

  return (
    <div className="h-screen w-screen flex">
      <div className="flex flex-1 flex-col">
        <ChatMessagesList />

        <div className="w-full flex items-center justify-center mx-auto p-2 pt-1">
          <ChatInputForm />
        </div>
      </div>

      {latestIfcFileContent && (
        <div className="flex flex-1 max-w-[50%] transition-all ease-in-out">
          <CodeViewer code={latestIfcFileContent || ""} fileName="test.ifc" />
        </div>
      )}
    </div>
  );
}
