import { useChat } from "@/hooks/useChat";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { MessageRole, ToolCall } from "@/types/message";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useViewerStore } from "@/store/useViewerStore";

export function ToolStateDisplay({ toolData }: { toolData: ToolCall }) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    switch (toolData.status) {
      case "pending":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-sm rounded-md">
      <button
        className="w-full flex items-center justify-between p-2 text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{toolData.function.name || "No tool selected"}</span>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-2 text-sm border-t border-gray-200">
          {toolData.function.arguments && (
            <div className="mb-2">
              <strong>Parameters:</strong>
              <pre className="mt-1 text-xs overflow-x-auto">
                {toolData.function.arguments}
              </pre>
            </div>
          )}
          {toolData.result && (
            <div className="mb-2">
              <strong>Response:</strong>
              <pre className="mt-1 text-xs overflow-x-auto">
                {toolData.result}
              </pre>
            </div>
          )}
          {/* {toolData. && (
            <div>
              <strong>Error:</strong>
              <p className="mt-1 text-xs text-red-500">{toolData.error}</p>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}

export default function TerminalChat() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    generating,
    createThread,
    resetChat,
    ifcSessionId,
  } = useChat();
  const { setAiMode } = useViewerStore();

  useEffect(() => {
    createThread();
  }, [ifcSessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await sendMessage();
  };

  return (
    <div className="border-t border-muted h-full w-full flex bg-sidebar">
      <div className="h-full bg-sidebar font-mono text-sm overflow-y-auto p-4 w-full">
        {messages.map((message, i) => {
          // User messages
          if (message.role === MessageRole.user) {
            return (
              <div key={i} className="whitespace-pre-wrap mb-2 text-zinc-400">
                <span className="text-primary">➜</span> {message.content}
              </div>
            );
          }

          // Assistant messages (with possible toolCalls)
          if (message.role === MessageRole.assistant) {
            return (
              <div key={i} className="whitespace-pre-wrap mb-2 text-foreground">
                {/* If there are any tool calls, show them underneath */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="mb-2">
                    {message.toolCalls.map((toolCall, j) => (
                      <ToolStateDisplay key={j} toolData={toolCall} />
                    ))}
                  </div>
                )}

                {/* The main assistant text */}
                {message.content}
              </div>
            );
          }

          // Any other roles (system, etc.)
          return (
            <div key={i} className="whitespace-pre-wrap mb-2">
              {message.content}
            </div>
          );
        })}

        {!generating && (
          <form className="flex items-center" onSubmit={handleSubmit}>
            <span className="text-primary mr-2">➜</span>
            <input
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
