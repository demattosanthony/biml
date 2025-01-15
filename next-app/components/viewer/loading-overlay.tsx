"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { ClimbingBoxLoader } from "react-spinners";

export const LoadingOverlay = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[1000] bg-background">
      <Image
        height={300}
        width={300}
        src={"/rhombicuboctahedron-white.svg"}
        alt="Logo"
        className="animate-pulse hidden dark:flex"
      />
      <Image
        height={300}
        width={300}
        src={"/rhombicuboctahedron.svg"}
        alt="Logo"
        className="animate-pulse dark:hidden"
      />
    </div>
  );
};
