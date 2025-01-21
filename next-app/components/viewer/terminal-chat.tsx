import { useChat } from "@/hooks/useChat";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Box, Check, Code, Hammer, Plus, X } from "lucide-react";
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
import CodeViewer from "../code-viewer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useIfcLoader } from "@/hooks/ifc-viewer/useIfcLoader";

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
    <div className="border-t border-muted h-full w-full flex bg-sidebar overflow-y-auto">
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
                  <div className="mb-2 gap-1">
                    {message.toolCalls.map((toolCall, j) => (
                      <ToolCallDisplay key={j} toolData={toolCall} />
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
          <form className="flex mb-4" onSubmit={handleSubmit}>
            <span className="text-primary mr-2 mt-auto">➜</span>
            <textarea
              value={input}
              placeholder="Ask DaVinci (⌘L)"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className="flex-1 bg-transparent text-foreground outline-none resize-none w-full"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
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

function getCleanFunctionName(name: string) {
  if (name === "execute_python_code_against_model") return "Python code";
  if (name === "get_project_info") return "Getting project info";
  if (name === "list_children_of_element") return "Listing children";
  if (name === "get_node_information") return "Getting element info";
  if (name === "get_all_ifc_categories") return "Getting categories";
  if (name === "get_elements_of_a_category")
    return "Getting elements of category";
  if (name === "save_model") return "Saving model";
  return name;
}

export function ToolCallDisplay({ toolData }: { toolData: ToolCall }) {
  const [isOpen, setIsOpen] = useState(false);
  const { loadIfcFile, unloadAllIfcFiles } = useIfcLoader();

  const getStatusIcon = () => {
    if (toolData.error) return <XCircle className="w-4 h-4 text-red-500" />;
    switch (toolData.status) {
      case "pending":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (toolData.function.name === "execute_python_code_against_model") {
    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="link" size="sm" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span>{getCleanFunctionName(toolData.function.name)}</span>
            {getStatusIcon()}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="gap-4 flex flex-col ml-6">
          <div className="">
            <CodeViewer
              code={JSON.parse(toolData.function.arguments).code || ""}
            />
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Output:</h4>
            <pre className="text-sm overflow-x-auto">{toolData.result}</pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (toolData.function.name === "save_model") {
    return (
      <>
        {toolData.status === "completed" && (
          <Button
            variant={"ghost"}
            onClick={(e) => {
              e.preventDefault();

              if (!toolData.result) return;
              const blob = new Blob([toolData.result], { type: "text/plain" });
              unloadAllIfcFiles();
              loadIfcFile(new File([blob], "model.ifc"));
            }}
          >
            <Box />
            Open new model
          </Button>
        )}
      </>
    );
  }

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen} key={toolData.id}>
      <CollapsibleTrigger asChild>
        <Button variant="link" size="sm" className="flex items-center gap-2">
          <Hammer className="h-4 w-4" />
          <span>{getCleanFunctionName(toolData.function.name)}</span>
          {getStatusIcon()}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="gap-4 flex flex-col ml-6">
        {toolData.function.arguments !== "{}" && (
          <div>
            <h4 className="mb-1 text-sm font-semibold">Input:</h4>
            <pre className="text-sm overflow-x-auto">
              {toolData.function.arguments}
            </pre>
          </div>
        )}

        <div>
          <h4 className="mb-1 text-sm font-semibold">Output:</h4>
          <pre className="text-sm overflow-x-auto">{toolData.result}</pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
