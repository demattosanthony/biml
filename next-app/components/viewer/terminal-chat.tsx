import { useChat } from "@/hooks/useChat";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { useIfcViewer } from "@/hooks/ifc-viewer/useIfcViewer";
import { MessageRole } from "@/types/message";

export default function TerminalChat() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    generating,
    createThread,
    resetChat,
  } = useChat();
  const { setAiMode } = useIfcViewer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await sendMessage();
  };

  useEffect(() => {
    createThread();
  }, []);

  return (
    <div className="border-t border-muted h-full w-full flex">
      <div className="h-full bg-background font-mono text-sm overflow-y-auto p-4 w-full">
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

      <div className="flex justify-end p-1">
        <Button
          variant={"ghost"}
          className="h-6 w-6"
          size={"icon"}
          onClick={() => resetChat()}
        >
          <Plus />
        </Button>
        <Button
          variant={"ghost"}
          className="h-6 w-6"
          size={"icon"}
          onClick={() => {
            setAiMode(false);
            // trigger resize event to update the viewer
            setTimeout(() => {
              window.dispatchEvent(new Event("resize"));
            }, 200);
          }}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
