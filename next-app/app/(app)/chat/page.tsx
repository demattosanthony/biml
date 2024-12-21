"use client";

import ChatInputForm from "@/components/chat/chat-input-form";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <div className="flex flex-1 justify-center">
        <div className="h-[85%] max-w-[600px] flex flex-col items-center justify-center gap-1">
          <Image
            height={175}
            width={175}
            src={
              resolvedTheme === "dark"
                ? "/rhombicuboctahedron-white.svg"
                : "/rhombicuboctahedron.svg"
            }
            alt="Logo"
            className="h-[175px]"
          />
          <div className="space-y-1 text-center">
            <h1 className="text-6xl font-bold tracking-tighter">
              DaVinci Chat
            </h1>
            <p className="text-sm text-muted-foreground">
              Expert engineer at your service.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center mx-auto p-2 pt-1 pb-4">
        <ChatInputForm
          onSubmit={() => {
            router.push(`/chat/test`);
          }}
        />
      </div>
    </div>
  );
}
