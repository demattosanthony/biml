"use client";

import { useSetup } from "@/hooks/ifc-viewer/useSetupViewer";

export default function IFCViewer({ files }: { files: File[] }) {
  useSetup(files);

  return (
    <div className="flex flex-1 cursor-default relative" id="ifc-viewer">
      {/* {loadingModel && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-90 z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )} */}
    </div>
  );
}
