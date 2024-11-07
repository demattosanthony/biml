"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageRole, useChat } from "@/hooks/useChat";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function MainInputForm() {
  const {
    generateText,
    // initializeChat,
    addMessage,
  } = useChat();

  const [input, setInput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleKeyDown = async (event: any) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const caretPosition = event.target.selectionStart;
      const textBeforeCaret = input.substring(0, caretPosition);
      const textAfterCaret = input.substring(caretPosition);
      if (setInput) {
        setInput(textBeforeCaret + "\n" + textAfterCaret);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (buttonRef.current) buttonRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/chat`);

    addMessage({
      role: MessageRole.user,
      content: input,
    });

    addMessage({
      role: MessageRole.assistant,
      content: "",
    });

    await generateText([
      {
        role: MessageRole.user,
        content: input,
      },
    ]);

    setInput("");
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // useEffect(() => {
  //   initializeChat();
  // }, []);

  return (
    <form
      className="relative h-auto min-h-[96px] max-h-[450px] w-[734px] max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border-2 border-gray-100"
      onSubmit={handleSubmit}
    >
      <Textarea
        placeholder="Ask anything..."
        onChange={(e) => setInput(e.target.value)}
        ref={textAreaRef}
        onKeyDown={handleKeyDown}
        value={input}
        autoFocus
        className="resize-none h-11 min-h-[45px] max-h-[400px] w-full rounded-xl border-none focus:ring-0 shadow-none focus-visible:ring-0 flex-1 mt-2 text-base"
      />

      <div className="w-full flex justify-end p-2">
        <Button
          ref={buttonRef}
          className=" rounded-full h-[30px] w-[30px]"
          size="icon"
          variant="default"
          type="submit"
          disabled={!input}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}
