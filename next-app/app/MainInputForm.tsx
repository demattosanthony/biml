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
    initializeChat,
    addMessage,
    updateLatestAssistantMessage,
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
    // await apiClient.sendMessage(threadId as string, input);
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
      textAreaRef.current.style.height = "115px";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    initializeChat();
  }, []);

  return (
    <form className="relative h-auto z-50 " onSubmit={handleSubmit}>
      <Textarea
        placeholder="Ask anything..."
        className="shadow-sm ring-0 focus:ring-0 focus:border-2 focus-visible:ring-0 resize-none min-h-[115px] max-h-[450px] w-[734px] p-4 pb-14 text-sm"
        onChange={(e) => setInput(e.target.value)}
        ref={textAreaRef}
        onKeyDown={handleKeyDown}
        value={input}
        autoFocus
      />

      <div className="absolute bottom-2 left-4">
        <div className="flex items-center gap-1">
          {/* <Button variant={"outline"} size={"icon"}>
            <Paperclip className="w-5 h-5" />
          </Button> */}
        </div>
      </div>

      <Button
        ref={buttonRef}
        className="absolute bottom-2 right-4 rounded-full h-[35px] w-[35px]"
        size={"icon"}
        variant={"default"}
        type="submit"
        disabled={!input}
      >
        <ArrowRight className="w-5 h-5" />
      </Button>
    </form>
  );
}
