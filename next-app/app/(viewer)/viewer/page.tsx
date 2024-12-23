"use client";

import { ViewerLayout } from "@/components/viewer/viewer-layout";
import { ElementDetailsSidebarRight } from "@/components/element-details-sidebar";
import IFCViewer from "@/components/ifc-viewer";
import { LoadingOverlay } from "@/components/viewer/loading-overlay";
import { UploadSection } from "@/components/viewer/upload-section";
import TerminalChat from "@/components/viewer/terminal-chat";
import api from "@/lib/api";
import { useChat } from "@/hooks/useChat";
import { useIfcViewer } from "@/hooks/ifc-viewer/useIfcViewer";

export default function ModelViewerUploadPage() {
  const {
    uploadedFiles,
    setUploadedFiles,
    selectedElement,
    loadingModels,
    aiMode,
  } = useIfcViewer();

  const { setIfcSessionId } = useChat();

  const handleModelUpload = async (files: File[]) => {
    setUploadedFiles(files);
    api.createIfcSession(files[0]).then((sessionId) => {
      setIfcSessionId(sessionId);
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {loadingModels && <LoadingOverlay />}

      {uploadedFiles.length === 0 ? (
        <UploadSection onUpload={handleModelUpload} />
      ) : (
        <ViewerLayout
          selectedElement={selectedElement}
          rightSidebar={<ElementDetailsSidebarRight />}
        >
          <div className="w-full h-full flex flex-1 flex-col transition-all duration-300">
            <div
              className={`${
                aiMode ? "h-[50%]" : "flex-1"
              } transition-all duration-300`}
            >
              <IFCViewer files={uploadedFiles} />
            </div>
            {/* Wrap in a container div that always exists */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                aiMode ? "h-[50%]" : "h-0"
              }`}
            >
              {aiMode && <TerminalChat />}
            </div>
          </div>
        </ViewerLayout>
      )}
    </div>
  );
}
