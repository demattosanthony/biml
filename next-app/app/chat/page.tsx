"use client";

import ChatInputForm from "@/components/chat/ChatInputForm";
import ChatMessagesList from "@/components/chat/MessagesList";

export default function ChatPage() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <ChatMessagesList />

      <div className="w-full flex items-center justify-center mx-auto p-2 pt-1">
        <ChatInputForm />
      </div>
    </div>
  );
}
