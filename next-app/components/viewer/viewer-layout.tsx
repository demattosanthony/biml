"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { IFCViewerSidebar } from "@/components/viewer-sidebar";

interface ViewerLayoutProps {
  children: React.ReactNode;
  selectedElement: any;
  rightSidebar: React.ReactNode;
  terminalChat?: React.ReactNode;
}

export const ViewerLayout = ({
  children,
  selectedElement,
  rightSidebar,
  terminalChat,
}: ViewerLayoutProps) => (
  <div className="flex h-full w-full">
    {/* Left sidebar and main content */}
    <div className="flex-1 flex min-w-0">
      <SidebarProvider
        name="ifc-viewer-sidebar"
        className="flex-1 h-full overflow-hidden"
        style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
      >
        <IFCViewerSidebar />
        <SidebarInset className="flex overflow-hidden">
          <div className="flex-1 relative w-full h-full">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>

    {/* Element details sidebar */}
    {/* <div
      className="transition-[width] duration-300 ease-in-out overflow-hidden"
      style={{ width: selectedElement ? "20rem" : "0" }}
    >
      <div className="h-full w-[20rem]">
        <SidebarProvider
          name="ifc-element-details-sidebar-right"
          className="h-full overflow-hidden relative"
          open={!!selectedElement}
          defaultOpen={false}
          style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
        >
          {rightSidebar}
        </SidebarProvider>
      </div>
    </div> */}

    {/* Terminal chat */}
    <div
      className="transition-[width] duration-300 ease-in-out overflow-hidden"
      //   style={{ width: terminalChat ? "365px" : "0" }}
    >
      <SidebarProvider
        name="ifc-terminal-chat"
        className="h-full overflow-hidden relative"
        open={!!terminalChat}
        defaultOpen={true}
        style={{ "--sidebar-width": "425px" } as React.CSSProperties}
      >
        <Sidebar side="right" variant="sidebar">
          <SidebarContent>{terminalChat}</SidebarContent>

          <SidebarRail />
        </Sidebar>
      </SidebarProvider>
    </div>
  </div>
);
