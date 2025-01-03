"use client";

import IFCViewerToolbar from "./ifc-viewer-toolbar";
import { useEffect } from "react";
import { useViewer } from "@/hooks/ifc-viewer/useViewer";

export default function IFCViewer({ files }: { files: File[] }) {
  const { initializeViewer } = useViewer("ifc-viewer");

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initializeViewer();
    };

    init();

    return () => cleanup?.();
  }, []);

  return (
    <div className="flex flex-1 relative h-full bg-secondary">
      <div id="ifc-viewer" className="flex flex-1 relative" />
      <IFCViewerToolbar />
    </div>
  );
}
