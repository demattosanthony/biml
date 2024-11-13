import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import useIfcViewerStore from "@/stores/useIfcViewerStore";

export function ElementDetailsSidebarRight({}: React.ComponentProps<
  typeof Sidebar
>) {
  const selectedElement = useIfcViewerStore((state) => state.selectedElement);
  const setSelectedElement = useIfcViewerStore(
    (state) => state.actions.setSelectedElement
  );
  return (
    <Sidebar side="right">
      <SidebarContent>{selectedElement?.name}</SidebarContent>
      <SidebarRail
        onClick={() => {
          setSelectedElement(null);
        }}
      />
    </Sidebar>
  );
}
