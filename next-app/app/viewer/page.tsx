"use client";

import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { ViewerLayout } from "@/components/viewer/viewer-layout";
import { ElementDetailsSidebarRight } from "@/components/element-details-sidebar";
import IFCViewer from "@/components/ifc-viewer";
import { LoadingOverlay } from "@/components/viewer/loading-overlay";
import { UploadSection } from "@/components/viewer/upload-section";

export default function ModelViewerUploadPage() {
  const models = useIfcViewerStore((state) => state.uploadedFiles);
  const setModels = useIfcViewerStore(
    (state) => state.actions.setUploadedFiles
  );
  const selectedElement = useIfcViewerStore((state) => state.selectedElement);
  const loading = useIfcViewerStore((state) => state.loadingModels);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {loading && <LoadingOverlay />}

      {models.length === 0 ? (
        <UploadSection onUpload={setModels} />
      ) : (
        <ViewerLayout
          selectedElement={selectedElement}
          rightSidebar={<ElementDetailsSidebarRight />}
        >
          <IFCViewer files={models} />
        </ViewerLayout>
      )}
    </div>
  );
}
