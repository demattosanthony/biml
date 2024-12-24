"use client";

import { useSetup } from "@/hooks/ifc-viewer/useSetupViewer";
import IFCViewerToolbar from "./ifc-viewer-toolbar";
import { useEffect } from "react";

export default function IFCViewer({ files }: { files: File[] }) {
  const { setupWorld } = useSetup(files);

  useEffect(() => {
    if (files.length > 0) setupWorld();
  }, [setupWorld]);

  return (
    <div className="flex flex-1 relative h-full bg-secondary">
      <div id="ifc-viewer" className="flex flex-1 relative" />
      <IFCViewerToolbar />
    </div>
  );
}
