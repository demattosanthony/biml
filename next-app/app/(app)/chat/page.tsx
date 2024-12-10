"use client";

import MainInputForm from "@/components/main-input-form";
import { TypographyH1, TypographyP } from "@/components/Typography";

export default function ChatPage() {
  return (
    <main className="h-full w-full overflow-hidden flex flex-col">
      {/* <div className="w-full justify-end flex p-2">
        <ModeToggle />
      </div> */}
      <div className="flex h-[90%] flex-col gap-10 justify-center items-center ">
        <div className="flex flex-col gap-2 items-center justify-center">
          <TypographyH1>What will you create?</TypographyH1>

          <TypographyP>Expert design engineer at your service.</TypographyP>
        </div>

        <div className=" max-w-[734px] flex flex-col gap-2">
          <MainInputForm />
        </div>
      </div>
    </main>
  );
}
