"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  code: string;
  fileName?: string;
}

export default function CodeViewer({ code, fileName }: CodeViewerProps) {
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
    <div className="flex-grow relative overflow-auto">
      <pre className="">
        <code className="table">
          {
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={"python"}
              PreTag="div"
              showLineNumbers={true}
              wrapLines={true}
            >
              {code}
            </SyntaxHighlighter>
          }
        </code>
      </pre>
    </div>
  );
}
