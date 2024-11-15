"use client";

import { ElementDetailsSidebarRight } from "@/components/element-details-sidebar";
import IFCFileUploadCard from "@/components/ifc-upload-card";
import IFCViewer from "@/components/ifc-viewer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IFCViewerSidebar } from "@/components/viewer-sidebar";
import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ClimbingBoxLoader } from "react-spinners";

export default function ModelViewerUploadPage() {
  const [models, setModels] = useState<File[]>([]);
  const selectedElement = useIfcViewerStore((state) => state.selectedElement);
  const loading = useIfcViewerStore((state) => state.loadingModels);
  const { theme, systemTheme } = useTheme();
  const realTheme = theme === "system" ? systemTheme : theme;

  const handleUpload = (files: File[]) => {
    setModels(files);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-[1000] bg-background">
          <ClimbingBoxLoader
            size={20}
            loading
            color={realTheme === "dark" ? "#FFF" : "#000"} // Change color based on theme
          />
        </div>
      )}

      {models.length === 0 && <IFCFileUploadCard onUpload={handleUpload} />}

      {models.length > 0 && (
        <div className="flex h-full w-full">
          <div className="flex-1 flex min-w-0">
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
          </div>

          <div
            className="transition-[width] duration-300 ease-in-out overflow-hidden"
            style={{ width: selectedElement ? "20rem" : "0" }}
          >
            <div className="h-full w-[20rem]">
              <SidebarProvider
                name="ifc-element-details-sidebar-right"
                className="h-full overflow-hidden"
                open={!!selectedElement}
                defaultOpen={false}
                style={{
                  // @ts-ignore
                  "--sidebar-width": "20rem",
                }}
              >
                <ElementDetailsSidebarRight />
              </SidebarProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
