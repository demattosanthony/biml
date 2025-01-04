"use client";

import IFCViewerToolbar from "./ifc-viewer-toolbar";
import { useEffect, useState } from "react";
import { useViewer } from "@/hooks/ifc-viewer/useViewer";
import { useIfcLoader } from "@/hooks/ifc-viewer/useIfcLoader";
import api from "@/lib/api";
import { useChat } from "@/hooks/useChat";
import { Button } from "./ui/button";

export default function IFCViewer({ files }: { files: File[] }) {
  const { initializeViewer } = useViewer("ifc-viewer");
  const { loadIfcFile, unloadAllIfcFiles } = useIfcLoader();
  const { setIfcSessionId } = useChat();

  const [newFiles, setNewFiles] = useState<File[]>([]);

  const handleModelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles?.length) return;

    const newFiles = Array.from(uploadedFiles);
    setNewFiles(newFiles);

    // Create new IFC session
    const sessionId = await api.createIfcSession(newFiles[0]);
    setIfcSessionId(sessionId);

    unloadAllIfcFiles();
    loadIfcFile(newFiles[0]);
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initializeViewer();
    };

    init();

    return () => cleanup?.();
  }, [initializeViewer]);

  useEffect(() => {
    if (files.length && newFiles.length === 0) {
      unloadAllIfcFiles();
      loadIfcFile(files[0]);
    }
  }, [files, loadIfcFile]);

  return (
    <div className="flex flex-1 relative h-full bg-secondary">
      {/* Upload button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <Button onClick={() => document.getElementById("file-upload")?.click()}>
          Upload your own ifc model
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".ifc"
          onChange={handleModelUpload}
          className="hidden"
        />
      </div>

      <div id="ifc-viewer" className="flex flex-1 relative" />
      <IFCViewerToolbar />
    </div>
  );
}
