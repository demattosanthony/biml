"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useIfcViewerStore, { Property } from "@/stores/useIfcViewerStore";
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

  const formatPropertyValue = (prop: Property) => {
    if (prop.value === null || prop.value === undefined) return "N/A";

    if (typeof prop.value === "boolean") return prop.value ? "Yes" : "No";
    if (typeof prop.value === "number") {
      return prop.unit ? `${prop.value} ${prop.unit}` : prop.value.toString();
    }
    return prop.value.toString();
  };

  const renderMaterialContent = (material: any) => {
    switch (material.type) {
      case "layerset":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layer</TableHead>
                <TableHead>Thickness</TableHead>
                <TableHead>Material</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {material.layers?.map((layer: any, index: number) => (
                <TableRow key={`layer-${index}`}>
                  <TableCell>Layer {index + 1}</TableCell>
                  <TableCell>{layer.thickness} mm</TableCell>
                  <TableCell>{layer.materialName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "list":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {material.materials?.map((name: string, index: number) => (
                <TableRow key={`material-${index}`}>
                  <TableCell>{name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "single":
        return (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>{material.name}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );

      default:
        return null;
    }
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
              <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    Property Sets
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2">
                    {selectedElement.psets.map((pset, index) => (
                      <Collapsible
                        key={`${pset.name}-${index}`}
                        className="pl-3 group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                            {pset.name}
                          </SidebarMenuButton>
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
            {/* Materials Section */}
            {selectedElement?.materials &&
              selectedElement.materials.length > 0 && (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                          Materials
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2">
                          {selectedElement.materials.map((material, index) => (
                            <Collapsible
                              key={`material-${index}`}
                              className="pl-3 group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                            >
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                  <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                  {material.type === "layerset"
                                    ? "Material Layer Set"
                                    : material.type === "list"
                                    ? "Material List"
                                    : "Material"}
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="p-2">
                                <div className="rounded-md border">
                                  {renderMaterialContent(material)}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                </SidebarMenu>
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
