"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenuButton,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronRight } from "lucide-react";
import { useIfcViewer } from "@/hooks/ifc-viewer/useIfcViewer";
import { Property, ElementAttributes } from "@/types/ifc";

export function ElementDetailsSidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { selectedElement, setSelectedElement } = useIfcViewer();

  // Helper function to format property values
  const formatPropertyValue = (prop: Property) => {
    if (prop.value === null || prop.value === undefined) return "N/A";

    if (typeof prop.value === "boolean") return prop.value ? "Yes" : "No";
    if (typeof prop.value === "number") {
      return prop.unit ? `${prop.value} ${prop.unit}` : prop.value.toString();
    }
    return prop.value.toString();
  };

  // Helper function to render material content based on material type
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

  // Helper function to render attributes
  const renderAttributes = (attributes: ElementAttributes) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attribute</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(attributes).map(([key, attr], index) => (
            <TableRow key={`attribute-${key}-${index}`}>
              <TableCell className="font-medium capitalize">{key}</TableCell>
              <TableCell>
                {attr.value === null || attr.value === undefined
                  ? "N/A"
                  : typeof attr.value === "boolean"
                  ? attr.value
                    ? "Yes"
                    : "No"
                  : typeof attr.value === "number"
                  ? attr.unit
                    ? `${attr.value} ${attr.unit}`
                    : attr.value.toString()
                  : attr.value.toString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Sidebar side="right" {...props} className="absolute top-0 bottom-0">
      <SidebarHeader>
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          {selectedElement?.name || "No Element Selected"}
        </h4>
        <p className="text-sm text-muted-foreground">
          {selectedElement?.ifcClass || "Unknown Class"}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Property Sets Section */}
            {selectedElement?.psets && selectedElement.psets.length > 0 && (
              <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen
              >
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
                                {pset.properties.map((prop, propIndex) => (
                                  <TableRow key={`${prop.name}-${propIndex}`}>
                                    <TableCell className="font-medium">
                                      {prop.name}
                                    </TableCell>
                                    <TableCell>
                                      {formatPropertyValue(prop)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Quantity Sets Section */}
            {selectedElement?.qsets && selectedElement.qsets.length > 0 && (
              <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    Quantity Sets
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2">
                    {selectedElement.qsets.map((qset, index) => (
                      <Collapsible
                        key={`${qset.name}-${index}`}
                        className="pl-3 group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                            {qset.name}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-2">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-1/2">
                                    Quantity
                                  </TableHead>
                                  <TableHead className="w-1/2">Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {qset.quantities.map((quantity, qtyIndex) => (
                                  <TableRow
                                    key={`${quantity.name}-${qtyIndex}`}
                                  >
                                    <TableCell className="font-medium">
                                      {quantity.name}
                                    </TableCell>
                                    <TableCell>
                                      {formatPropertyValue(quantity)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Attributes Section */}
            {selectedElement?.attributes &&
              Object.keys(selectedElement.attributes).length > 0 && (
                <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                      Attributes
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-2 rounded-md border">
                      {renderAttributes(selectedElement.attributes)}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

            {/* Materials Section */}
            {selectedElement?.materials &&
              selectedElement.materials.length > 0 && (
                <Collapsible
                  className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                  defaultOpen
                >
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
