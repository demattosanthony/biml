"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { ClimbingBoxLoader } from "react-spinners";

export const LoadingOverlay = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[1000] bg-background">
      {/* <ClimbingBoxLoader
        size={20}
        loading
        color={realTheme === "dark" ? "#FFF" : "#000"}
      /> */}
      <Image
        height={300}
        width={300}
        src={
          resolvedTheme === "dark"
            ? "/rhombicuboctahedron-white.svg"
            : "/rhombicuboctahedron.svg"
        }
        alt="Logo"
        className="animate-pulse"
      />
      {/* <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        DaVinci
      </h3> */}
    </div>
  );
};
