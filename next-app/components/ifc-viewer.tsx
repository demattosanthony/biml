"use client";

import { useSetup } from "@/hooks/ifc-viewer/useSetupViewer";
import IFCViewerToolbar from "./ifc-viewer-toolbar";

export default function IFCViewer({ files }: { files: File[] }) {
  useSetup(files);

  return (
    <div className="flex flex-1 relative h-full bg-secondary">
      <div id="ifc-viewer" className="flex flex-1 relative" />
      <IFCViewerToolbar />
    </div>
  );
}
