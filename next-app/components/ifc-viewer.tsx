"use client";

import IFCViewerToolbar from "./ifc-viewer-toolbar";
import { useEffect } from "react";
import { useViewer } from "@/hooks/ifc-viewer/useViewer";
import { useIfcLoader } from "@/hooks/ifc-viewer/useIfcLoader";

export default function IFCViewer({ files }: { files: File[] }) {
  const { initializeViewer } = useViewer("ifc-viewer");
  const { loadIfcFile, unloadAllIfcFiles } = useIfcLoader();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initializeViewer();
    };

    init();

    return () => cleanup?.();
  }, [initializeViewer]);

  useEffect(() => {
    if (files.length) {
      unloadAllIfcFiles();
      loadIfcFile(files[0]);
    }
  }, [files, loadIfcFile]);

  return (
    <div className="flex flex-1 relative h-full bg-secondary">
      <div id="ifc-viewer" className="absolute top-0 left-0 right-0 bottom-0" />
      <IFCViewerToolbar />
    </div>
  );
}
