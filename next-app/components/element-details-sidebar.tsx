import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useIfcViewerStore, { PropertyValue } from "@/stores/useIfcViewerStore";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronRight } from "lucide-react";

export function ElementDetailsSidebarRight({}: React.ComponentProps<
  typeof Sidebar
>) {
  const selectedElement = useIfcViewerStore((state) => state.selectedElement);
  const setSelectedElement = useIfcViewerStore(
    (state) => state.actions.setSelectedElement
  );

  // Helper function to format property values
  const formatPropertyValue = (prop: PropertyValue) => {
    if (prop.value === null || prop.value === undefined) return "N/A";

    // Handle different value types
    if (typeof prop.value === "boolean") return prop.value ? "Yes" : "No";
    if (typeof prop.value === "number") {
      return prop.unit ? `${prop.value} ${prop.unit}` : prop.value.toString();
    }
    return prop.value.toString();
  };

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          {selectedElement?.name}
        </h4>
        <p className="text-sm text-muted-foreground">
          {selectedElement?.ifcClass}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {selectedElement?.psets && selectedElement.psets.length > 0 ? (
              <Collapsible className="w-full">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-lg font-semibold hover:bg-secondary [&[data-state=open]>svg]:rotate-90">
                  Property Sets
                  <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2">
                    {selectedElement.psets.map((pset, index) => (
                      <Collapsible
                        key={`${pset.name}-${index}`}
                        className="ml-4"
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-md hover:bg-secondary [&[data-state=open]>svg]:rotate-90">
                          {pset.name}
                          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-2">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-1/2">
                                    Property
                                  </TableHead>
                                  <TableHead className="w-1/2">Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(pset.properties).map(
                                  ([key, prop], propIndex) => (
                                    <TableRow key={`${key}-${propIndex}`}>
                                      <TableCell className="font-medium">
                                        {key}
                                      </TableCell>
                                      <TableCell>
                                        {formatPropertyValue(prop)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <p className="text-sm text-muted-foreground p-4">
                No property sets available for this element
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail
        onClick={() => {
          setSelectedElement(null);
        }}
      />
    </Sidebar>
  );
}
