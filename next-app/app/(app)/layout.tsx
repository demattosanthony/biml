import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider name="main-app-sidebar">
      {/* <AppSidebar />
      <SidebarInset>
        <Header /> */}
      {children}
      {/* </SidebarInset> */}
    </SidebarProvider>
  );
}
