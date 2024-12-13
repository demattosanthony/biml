import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyTable,
  TypographyTh,
  TypographyTd,
  TypographyTr,
  TypographyList,
  TypographyLi,
  TypographyInlineCode,
} from "./typography";

// CodeBlock component
const CodeBlock: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ children, className = "" }) => {
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
  };

  return match ? (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 bg-black/50 text-white border-none rounded px-2 py-1 cursor-pointer hover:bg-black/70 transition-colors"
      >
        Copy
      </button>
      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div">
        {codeString}
      </SyntaxHighlighter>
    </div>
  ) : (
    <TypographyInlineCode>{children}</TypographyInlineCode>
  );
};

const MarkdownViewer: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown
    components={{
      h1: ({ children }) => <TypographyH1>{children}</TypographyH1>,
      h2: ({ children }) => <TypographyH2>{children}</TypographyH2>,
      h3: ({ children }) => <TypographyH3>{children}</TypographyH3>,
      h4: ({ children }) => <TypographyH4>{children}</TypographyH4>,
      p: ({ children }) => <TypographyP>{children}</TypographyP>,
      blockquote: ({ children }) => (
        <TypographyBlockquote>{children}</TypographyBlockquote>
      ),
      table: ({ children }) => <TypographyTable>{children}</TypographyTable>,
      thead: ({ children }) => <thead>{children}</thead>,
      tbody: ({ children }) => <tbody>{children}</tbody>,
      tr: ({ children }) => <TypographyTr>{children}</TypographyTr>,
      th: ({ children }) => <TypographyTh>{children}</TypographyTh>,
      td: ({ children }) => <TypographyTd>{children}</TypographyTd>,
      ul: ({ children }) => <TypographyList>{children}</TypographyList>,
      ol: ({ children }) => <TypographyList>{children}</TypographyList>,
      li: ({ children }) => <TypographyLi>{children}</TypographyLi>,
      code: ({ className, children }) => (
        <CodeBlock className={className}>{children}</CodeBlock>
      ),
      em: ({ children }) => <em>{children}</em>,
      strong: ({ children }) => <strong>{children}</strong>,
      a: ({ children, ...props }) => (
        <a
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      ),
      img: ({ ...props }) => <img className="max-w-full h-auto" {...props} />,
    }}
    remarkPlugins={[remarkGfm]}
    className="flex flex-col gap-2"
  >
    {content}
  </ReactMarkdown>
);

export default MarkdownViewer;
