"use client";

import MainInputForm from "@/components/main-input-form";
import { TypographyH1, TypographyP } from "@/components/typography";

export default function ChatPage() {
  return (
    <div className="flex h-[85%] flex-col gap-10 justify-center items-center ">
      <div className="flex flex-col gap-2 items-center justify-center">
        <TypographyH1>What will you create?</TypographyH1>

        <TypographyP>Expert design engineer at your service.</TypographyP>
      </div>

      <div className=" max-w-[734px] flex flex-col gap-2">
        <MainInputForm />
      </div>
    </div>
  );
}
