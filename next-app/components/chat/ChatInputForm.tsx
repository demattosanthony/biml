"use client";

import { CheckIcon, Paperclip, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { MessageRole, useChat } from "@/hooks/useChat";

export default function ChatInputForm() {
  const { threadId } = useParams();
  const [input, setInput] = useState("");

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

    await generateText([
      ...messages,
      {
        role: MessageRole.user,
        content: input,
      },
    ]);
    setInput("");
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
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
      onSubmit={handleSubmit}
      className="flex items-center relative h-auto gap-2 z-50 max-w-[800px] w-full"
    >
      <Paperclip className="p-1 absolute bottom-[13px] left-2 h-8 w-8 rounded-full" />

      <Textarea
        ref={textAreaRef}
        value={input}
        role="textbox"
        autoFocus
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        // disabled={disabled || generating}
        placeholder="Design anything..."
        className="h-[24px] max-h-[250px] pr-[58px] pt-[17px] pl-11 resize-none w-full text-md overflow-hidden overflow-y-auto rounded-3xl focus:shadow-sm"
      />
      <Button
        size="sm"
        className="p-1 absolute right-2 bottom-[12px] h-9 w-9 rounded-full"
        type="submit"
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          if (generating) {
            // If currently generating, abort the ongoing request
            handleAbort();
          } else {
            handleSubmit(e);
          }
        }}
      >
        {generating ? (
          <StopCircle className="w-8 h-8" />
        ) : (
          <CheckIcon className="w-8 h-8" />
        )}
      </Button>
    </form>
  );
}
