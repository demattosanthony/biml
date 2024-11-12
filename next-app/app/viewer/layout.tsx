import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IFCViewerSidebar } from "@/components/viewer-sidebar";

export default function IfcViewerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <IFCViewerSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
