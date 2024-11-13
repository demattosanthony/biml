"use client";

import { useSetup } from "@/hooks/ifc-viewer/useSetupViewer";
import IFCViewerToolbar from "./ifc-viewer-toolbar";
import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { Loader2 } from "lucide-react";

export default function IFCViewer({ files }: { files: File[] }) {
  const loadingModels = useIfcViewerStore((state) => state.loadingModels);
  useSetup(files);

  return (
    <div className="flex flex-1 cursor-default relative" id="ifc-viewer">
      <IFCViewerToolbar />
      {loadingModels && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-90 z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}
