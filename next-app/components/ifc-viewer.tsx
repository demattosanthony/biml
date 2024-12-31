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
    <div className="relative h-full bg-secondary">
      <div id="ifc-viewer" className="relative h-full w-full" />
      <IFCViewerToolbar />
    </div>
  );
}
