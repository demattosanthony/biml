"use client";

import { Paperclip, SendHorizonal, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { MessageRole, useChat } from "@/hooks/useChat";

export default function ChatInputForm() {
  const { threadId } = useParams();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(true);

  const {
    addMessage,
    messages,
    resetChat,
    generateText,
    handleAbort,
    generating,
  } = useChat();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = async (event: any) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const caretPosition = event.target.selectionStart;
      const textBeforeCaret = input.substring(0, caretPosition);
      const textAfterCaret = input.substring(caretPosition);
      if (setInput) {
        setInput(textBeforeCaret + "\n" + textAfterCaret);
        // Set cursor position after state update
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.selectionStart = caretPosition + 1;
            textAreaRef.current.selectionEnd = caretPosition + 1;
          }
        }, 0);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (buttonRef.current) buttonRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setGenerating(true);

    addMessage({
      role: MessageRole.user,
      content: input,
    });

    addMessage({
      role: MessageRole.assistant,
      content: "",
    });

    setInput("");

    await generateText([
      ...messages,
      {
        role: MessageRole.user,
        content: input,
      },
    ]);
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "50px";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    return () => {
      resetChat();
    };
  }, []);

  return (
    <form
      className={`relative h-auto min-h-[24px] max-h-[450px] w-[750px] max-w-4xl mx-auto rounded-2xl border ${
        focused && "border-black"
      }`}
      onSubmit={handleSubmit}
    >
      <div className="flex h-full w-full items-end">
        <Textarea
          placeholder="Ask Davinci..."
          onChange={(e) => setInput(e.target.value)}
          ref={textAreaRef}
          onKeyDown={handleKeyDown}
          value={input}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          autoFocus
          className="resize-none min-h-[24px] h-[50px] max-h-[400px] w-full pt-[14px] rounded-xl border-none focus:ring-0 shadow-none focus-visible:ring-0 flex-1 text-base focus-visible:ring-offset-0 bg-transparent"
        />

        <div className="h-full pr-1 flex pb-[9px]">
          <Button
            ref={buttonRef}
            className="h-8 w-8"
            variant="ghost"
            type="submit"
          >
            <Paperclip />
          </Button>

          <Button
            ref={buttonRef}
            className="h-8 w-8"
            variant="ghost"
            type="submit"
            // disabled={!input}
          >
            {generating ? <StopCircle /> : <SendHorizonal />}
          </Button>
        </div>
      </div>
    </form>
  );
}
