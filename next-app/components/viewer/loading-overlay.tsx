"use client";

import { useTheme } from "next-themes";
import { ClimbingBoxLoader } from "react-spinners";

export const LoadingOverlay = () => {
  const { theme, systemTheme } = useTheme();
  const realTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-background">
      <ClimbingBoxLoader
        size={20}
        loading
        color={realTheme === "dark" ? "#FFF" : "#000"}
      />
    </div>
  );
};
