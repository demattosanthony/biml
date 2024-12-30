import { useChat } from "@/hooks/useChat";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { useIfcViewer } from "@/hooks/ifc-viewer/useIfcViewer";
import { MessageRole, ToolCall } from "@/types/message";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

function ToolCallAccordion({ toolCalls }: { toolCalls: ToolCall[] }) {
  return (
    <Accordion type="single" collapsible className="w-min">
      {toolCalls.map((toolCall, idx) => (
        <AccordionItem key={idx} value={`toolCall-${idx}`}>
          <AccordionTrigger>
            <div className="flex items-center space-x-2 ">
              <span>{toolCall.function.name.toUpperCase()}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4">
              <p>
                <strong>Arguments:</strong>
                <code>{toolCall.function.arguments}</code>
              </p>
              {toolCall.status === "completed" && (
                <div>
                  <p>
                    <strong>Result:</strong>
                  </p>
                  <pre className="bg-muted p-2 rounded">{toolCall.result}</pre>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
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
  const { setAiMode } = useIfcViewer();

  useEffect(() => {
    createThread();
  }, [ifcSessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await sendMessage();
  };

  return (
    <div className="border-t border-muted h-full w-full flex">
      <div className="h-full bg-background font-mono text-sm overflow-y-auto p-4 w-full">
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
                  <ToolCallAccordion toolCalls={message.toolCalls} />
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
