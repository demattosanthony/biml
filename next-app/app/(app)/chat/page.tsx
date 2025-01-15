"use client";

import ChatInputForm from "@/components/chat/chat-input-form";
import STLViewer from "@/components/viewer/stl-viewer";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [stlFile, setStlFile] = useState<File | null>(null);

  function loadFile() {
    const path = "/Rhombicuboctahedron.stl";
    fetch(path)
      .then((response) => response.blob())
      .then((blob) => {
        setStlFile(new File([blob], "Rhombicuboctahedron.stl"));
      });
  }

  useEffect(() => {
    loadFile();
  }, []);

  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <div className="flex flex-1 justify-center">
        <div className="h-[85%] max-w-[750px] flex flex-col items-center justify-center">
          <div className="min-h-[350px] min-w-[350px] flex items-center justify-center">
            {stlFile && <STLViewer file={stlFile} size={350} />}
          </div>

          {/* <Image
            height={175}
            width={175}
            src={
              resolvedTheme === "dark"
                ? "/rhombicuboctahedron-white.svg"
                : "/rhombicuboctahedron.svg"
            }
            alt="Logo"
            className="h-[175px]"
          /> */}
          <div className="space-y-2 text-center">
            <h1 className="text-5xl font-bold tracking-tighter">
              What would you like to design?
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload an existing IFC file or start from scratch
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
