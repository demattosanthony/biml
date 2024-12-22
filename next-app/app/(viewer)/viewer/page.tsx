"use client";

import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { ViewerLayout } from "@/components/viewer/viewer-layout";
import { ElementDetailsSidebarRight } from "@/components/element-details-sidebar";
import IFCViewer from "@/components/ifc-viewer";
import { LoadingOverlay } from "@/components/viewer/loading-overlay";
import { UploadSection } from "@/components/viewer/upload-section";
import TerminalChat from "@/components/viewer/terminal-chat";
import api from "@/lib/api";
import { useChat } from "@/hooks/useChat";

export default function ModelViewerUploadPage() {
  const models = useIfcViewerStore((state) => state.uploadedFiles);
  const setModels = useIfcViewerStore(
    (state) => state.actions.setUploadedFiles
  );
  const selectedElement = useIfcViewerStore((state) => state.selectedElement);
  const loading = useIfcViewerStore((state) => state.loadingModels);
  const aiMode = useIfcViewerStore((state) => state.aiMode);
  const { setIfcSessionId } = useChat();

  const handleModelUpload = async (files: File[]) => {
    setModels(files);
    api.createIfcSession(files[0]).then((sessionId) => {
      setIfcSessionId(sessionId);
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {loading && <LoadingOverlay />}

      {models.length === 0 ? (
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
              <IFCViewer files={models} />
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
