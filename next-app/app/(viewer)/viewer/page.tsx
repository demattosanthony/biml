"use client";

import { useEffect, useState } from "react";
import { ViewerLayout } from "@/components/viewer/viewer-layout";
import { ElementDetailsSidebarRight } from "@/components/element-details-sidebar";
import IFCViewer from "@/components/ifc-viewer";
import { LoadingOverlay } from "@/components/viewer/loading-overlay";
import TerminalChat from "@/components/viewer/terminal-chat";
import api from "@/lib/api";
import { useChat } from "@/hooks/useChat";
import { useViewerStore } from "@/store/useViewerStore";

export default function ModelViewerUploadPage() {
  const [files, setUploadedFiles] = useState<File[]>([]);
  const { isLoading, aiMode, selectedElement } = useViewerStore();

  const { setIfcSessionId } = useChat();

  // Same handleModelUpload logic, but we won't show any UI for it
  const handleModelUpload = async (files: File[]) => {
    setUploadedFiles(files);
    api.createIfcSession(files[0]).then((sessionId) => {
      setIfcSessionId(sessionId);
    });
  };

  // Automatically load the sample IFC on page load
  useEffect(() => {
    const loadSampleModel = async () => {
      const sampleIfc = "/sample.ifc";
      try {
        const response = await fetch(sampleIfc);
        const blob = await response.blob();
        const file = new File([blob], "sample.ifc", {
          type: "application/ifc",
        });
        handleModelUpload([file]);
      } catch (error) {
        console.error("Error loading sample model:", error);
      }
    };

    loadSampleModel();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {isLoading && <LoadingOverlay />}
      <ViewerLayout
        selectedElement={selectedElement}
        rightSidebar={<ElementDetailsSidebarRight />}
      >
        <div className="w-full h-full flex flex-1 flex-col transition-all duration-300">
          {/* IFC viewer container */}
          <div
            className={`${
              aiMode ? "h-[50%]" : "flex-1"
            } transition-all duration-300`}
          >
            <IFCViewer files={files} />
          </div>

          {/* Terminal chat container */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              aiMode ? "h-[50%]" : "h-0"
            }`}
          >
            {aiMode && <TerminalChat />}
          </div>
        </div>
      </ViewerLayout>
    </div>
  );
}
