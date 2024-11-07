"use client";

import { TypographyH1, TypographyP } from "@/components/typography";
import MainInputForm from "./main-input-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col">
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
