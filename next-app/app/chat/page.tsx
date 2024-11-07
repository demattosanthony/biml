"use client";

import ChatInputForm from "@/components/chat/chat-input-form";
import ChatMessagesList from "@/components/chat/messages-list";
import CodeViewer from "@/components/code-viewer";
import IFCViewer from "@/components/ifc-viewer";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import useClipboard from "@/hooks/useClipboard";
import { Eye, Download, Check, Copy } from "lucide-react";

export default function ChatPage() {
  const { selectedIfcFile, artifcatMode, setArtifactMode } = useChat();
  const fileName = "test.ifc";

  const handleDownload = () => {
    const formattedContent = selectedIfcFile?.content.replace(/\\n/g, "\n");
    const blob = new Blob([formattedContent || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download.txt"; // Default filename if none provided
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { isCopied, copyToClipboard } = useClipboard();

  return (
    <div className="h-screen w-screen flex transition-all">
      <div
        className={`flex flex-1 flex-col ${selectedIfcFile && "max-w-[50%]"}`}
      >
        <ChatMessagesList />

        <div className="w-full flex items-center justify-center mx-auto p-2 pt-1">
          <ChatInputForm />
        </div>
      </div>

      <div
        className={`flex min-w-[0.00001px] max-w-[50%] transition-transform duration-300 transform ${
          selectedIfcFile
            ? "translate-x-0 opacity-100 flex-1"
            : "translate-x-full opacity-0"
        }`}
      >
        {selectedIfcFile && (
          <div className="h-full w-full flex flex-col rounded-lg  shadow-lg bg-white text-gray-800 border border-gray-200">
            {fileName && (
              <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
                <div className="gap-1 items-center">
                  <Button
                    variant={artifcatMode === "preview" ? "default" : "ghost"}
                    onClick={() => setArtifactMode("preview")}
                  >
                    <Eye className="h-4 w-4 text-white mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant={artifcatMode === "file" ? "default" : "ghost"}
                    onClick={() => setArtifactMode("file")}
                  >
                    test.ifc
                  </Button>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    aria-label="Download file"
                  >
                    <Download className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(selectedIfcFile?.content || "")
                    }
                    aria-label={
                      isCopied ? "Copied to clipboard" : "Copy to clipboard"
                    }
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {artifcatMode === "preview" ? (
              <IFCViewer
                blob={
                  new Blob([selectedIfcFile?.content || ""], {
                    type: "text/plain",
                  })
                }
                modelName="test.ifc"
              />
            ) : (
              <CodeViewer
                code={selectedIfcFile?.content || ""}
                fileName="test.ifc"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
