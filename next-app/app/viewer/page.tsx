"use client";

import IFCFileUploadCard from "@/components/ifc-upload-card";
import IFCViewer from "@/components/ifc-viewer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IFCViewerSidebar } from "@/components/viewer-sidebar";
import { useState } from "react";

export default function ModelViewerUploadPage() {
  const [models, setModels] = useState<File[]>([]);

  const handleUpload = (files: File[]) => {
    setModels(files);
  };

  return (
    <div className="h-screen w-screen flex flex-1 flex-col overflow-hidden">
      {models.length === 0 ? (
        <IFCFileUploadCard onUpload={handleUpload} />
      ) : (
        <SidebarProvider>
          <IFCViewerSidebar />
          <SidebarInset>
            <div className="flex flex-1 h-full w-full">
              <IFCViewer files={models} />
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </div>
  );
}
