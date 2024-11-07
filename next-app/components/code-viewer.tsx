"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  code: string;
  fileName?: string;
}

const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return { isCopied, copyToClipboard };
};

export default function CodeViewer({ code, fileName }: CodeViewerProps) {
  const { isCopied, copyToClipboard } = useClipboard();

  const highlightSyntax = (code: string) => {
    return code.split("\n").map((line, index) => (
      <div key={index} className="table-row">
        <span className="table-cell text-right pr-4 select-none text-gray-400 text-sm">
          {index + 1}
        </span>
        <span className="table-cell">
          {line.split(" ").map((word, wordIndex) => {
            let className = "";
            if (["function", "const", "let", "var", "return"].includes(word)) {
              className = "text-blue-600";
            } else if (word.startsWith('"') || word.startsWith("'")) {
              className = "text-green-600";
            } else if (!isNaN(Number(word))) {
              className = "text-orange-600";
            }
            return (
              <span key={wordIndex} className={className}>
                {word}{" "}
              </span>
            );
          })}
        </span>
      </div>
    ));
  };

  return (
    <div className="h-full w-full flex flex-col rounded-lg overflow-hidden shadow-lg bg-white text-gray-800 border border-gray-200">
      {fileName && (
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-600">
            {fileName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(code)}
            aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </div>
      )}
      <div className="flex-grow relative overflow-auto">
        <pre className="p-4">
          <code className="table">{highlightSyntax(code)}</code>
        </pre>
      </div>
    </div>
  );
}
