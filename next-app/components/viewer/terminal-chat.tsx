import { MessageRole, useChat } from "@/hooks/useChat";
import { useState } from "react";

export default function TerminalChat() {
  const { messages, input, setInput, sendMessage, generating } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await sendMessage();
  };

  return (
    <div className="border-t border-muted h-full w-full flex flex-col">
      <div
        // ref={terminalRef}
        className="h-full bg-background font-mono text-sm overflow-auto p-4"
      >
        {messages.map((message, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {message.role === MessageRole.user ? (
              <div className="text-zinc-400">
                <span className="text-primary">➜</span> {message.content}
              </div>
            ) : (
              <div className="text-foreground mb-2">{message.content}</div>
            )}
          </div>
        ))}
        {!generating && (
          <form className="flex items-center" onSubmit={handleSubmit}>
            <span className="text-primary mr-2">➜</span>
            <input
              // ref={inputRef}
              type="text"
              value={input}
              placeholder="Ask DaVinci..."
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none"
              autoFocus
            />
          </form>
        )}
      </div>
    </div>
  );
}
