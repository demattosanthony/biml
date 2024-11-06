"use client";

import { MessageRole, useChat } from "@/hooks/useChat";
import { Bot, User } from "lucide-react";
import MarkdownViewer from "../MarkdownViewer";

export default function ChatMessagesList() {
  const { messages } = useChat();

  return (
    <div className="flex-1 w-full overflow-y-auto pt-10">
      <div className="max-w-[900px] mx-auto p-4 w-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">No messages yet</div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className="flex items-start space-x-4">
                {message.role === MessageRole.user ? <User /> : <Bot />}
                <div className="flex-1">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {message.role === MessageRole.user ? (
                      <> {message.content}</>
                    ) : (
                      <MarkdownViewer content={message.content || ""} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
