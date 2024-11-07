"use client";
import { MessageRole, useChat } from "@/hooks/useChat";
import { Bot, FileBox, User } from "lucide-react";
import MarkdownViewer from "../MarkdownViewer";
import { Button } from "../ui/button";
import { useEffect } from "react";

type ContentPart = {
  type: "text" | "ifc" | "partial-ifc";
  content: string;
};

const parseContent = (content: string): ContentPart[] => {
  const parts: ContentPart[] = [];
  let currentText = "";
  let inIfc = false;
  let currentIfc = "";

  // Process content character by character
  for (let i = 0; i < content.length; i++) {
    if (content.slice(i, i + 5) === "<ifc>") {
      // If we have any pending text, add it
      if (currentText) {
        parts.push({ type: "text", content: currentText });
        currentText = "";
      }
      inIfc = true;
      i += 4; // Skip the rest of "<ifc>"
      continue;
    }

    if (inIfc) {
      if (content.slice(i, i + 6) === "</ifc>") {
        // Complete IFC tag found
        parts.push({ type: "ifc", content: currentIfc });
        currentIfc = "";
        inIfc = false;
        i += 5; // Skip the rest of "</ifc>"
      } else {
        currentIfc += content[i];
        // Add as partial IFC if it's the last character and we're still in IFC
        if (i === content.length - 1) {
          parts.push({ type: "partial-ifc", content: currentIfc });
        }
      }
    } else {
      currentText += content[i];
      // Add remaining text if we're at the end
      if (i === content.length - 1 && currentText) {
        parts.push({ type: "text", content: currentText });
      }
    }
  }

  return parts;
};

const IFCButton = ({
  content,
  isPartial = false,
  index,
}: {
  content: string;
  index: number;
  isPartial?: boolean;
}) => {
  const { setSelectedIfcFile, selectedIfcFile } = useChat();
  const isSelected = selectedIfcFile?.index === index;

  const handleSelect = () => {
    setSelectedIfcFile(isSelected ? null : { index, content });
  };

  useEffect(() => {
    setSelectedIfcFile({ index, content });
  }, [content]);

  return (
    <Button
      onClick={handleSelect}
      className="gap-1"
      variant={isSelected ? "default" : "outline"}
      disabled={isPartial}
    >
      <FileBox size={20} />
      {isPartial ? "Loading IFC Model..." : "View IFC Model"}
    </Button>
  );
};

const MessageContent = ({
  content,
  messageIndex,
}: {
  content: string;
  messageIndex: number;
}) => {
  const parts = parseContent(content);
  return (
    <div className="space-y-4">
      {parts.map((part, index) => (
        <div key={index}>
          {part.type === "text" ? (
            <MarkdownViewer content={part.content} />
          ) : (
            <div className="my-4">
              <IFCButton
                content={part.content}
                index={messageIndex}
                isPartial={part.type === "partial-ifc"}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

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
                      message.content
                    ) : (
                      <MessageContent
                        content={message.content || ""}
                        messageIndex={index}
                      />
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
