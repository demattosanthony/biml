"use client";

import { ElementDetailsSidebarRight } from "@/components/element-details-sidebar";
import IFCFileUploadCard from "@/components/ifc-upload-card";
import IFCViewer from "@/components/ifc-viewer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IFCViewerSidebar } from "@/components/viewer-sidebar";
import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { useState } from "react";

export default function ModelViewerUploadPage() {
  const [models, setModels] = useState<File[]>([]);
  const selectedElement = useIfcViewerStore((state) => state.selectedElement);

  const handleUpload = (files: File[]) => {
    setModels(files);
  };

  return (
    <div className="h-screen w-screen flex flex-1 flex-col overflow-hidden">
      {models.length === 0 ? (
        <IFCFileUploadCard onUpload={handleUpload} />
      ) : (
        <>
          <SidebarProvider
            name="ifc-viewer-sidebar"
            className="flex-1 h-full overflow-hidden"
            style={{
              // @ts-ignore
              "--sidebar-width": "20rem",
            }}
          >
            <IFCViewerSidebar />
            <SidebarInset className="flex overflow-hidden">
              <div className="flex-1 relative w-full h-full">
                <IFCViewer files={models} />
              </div>
            </SidebarInset>
          </SidebarProvider>

          <SidebarProvider
            name="ifc-element-details-sidebar-right"
            open={!!selectedElement}
            defaultOpen={false}
            style={{
              // @ts-ignore
              "--sidebar-width": "20rem",
            }}
          >
            <ElementDetailsSidebarRight />
          </SidebarProvider>
        </>
      )}
    </div>
  );
}
