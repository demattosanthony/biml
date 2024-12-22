import { MessageRole, useChat } from "@/hooks/useChat";
import { useState } from "react";

export default function TerminalChat() {
  const [input, setinput] = useState("");
  const { messages } = useChat();

  return (
    <div className="border-t border-muted">
      <div
        // ref={terminalRef}
        className="h-[300px] bg-background font-mono text-sm overflow-auto p-4"
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
        <form className="flex items-center">
          <span className="text-primary mr-2">➜</span>
          <input
            // ref={inputRef}
            type="text"
            value={""}
            placeholder="Ask DaVinci..."
            onChange={(e) => setinput(e.target.value)}
            className="flex-1 bg-transparent text-foreground outline-none"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
