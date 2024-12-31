"use client";

import React, { useState, MouseEvent } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useIfcViewer } from "@/hooks/ifc-viewer/useIfcViewer";
import {
  EntityNode,
  Property,
  ElementAttributes,
  MaterialData,
} from "@/types/ifc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FragmentsGroup } from "@thatopen/fragments";

export function IFCViewerSidebar() {
  const {
    models,
    categories,
    plans,
    setUploadedFiles,
    highlighter,
    hider,
    selectedElement,
    setSelectedElement,
  } = useIfcViewer();

  const { theme, systemTheme } = useTheme();
  const realTheme = theme === "system" ? systemTheme : theme;
  const [activeFloor, setActiveFloor] = useState<string | null>(null);

  return (
    <Sidebar side="left" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-fit px-1.5">
                  <div className="flex aspect-square items-center justify-center rounded-md">
                    <Image
                      height={30}
                      width={30}
                      src={
                        realTheme === "dark"
                          ? "/rhombicuboctahedron-white.svg"
                          : "/rhombicuboctahedron.svg"
                      }
                      alt="Logo"
                      className="h-[75px]"
                    />
                  </div>
                  <span className="truncate font-bold">DaVinci Viewer</span>
                  <ChevronDown className="opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => setUploadedFiles([])}
                >
                  <div className="font-medium text-muted-foreground">
                    Back to Home
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ---- MAIN CONTENT ---- */}
      <SidebarContent>
        {/* SELECTED ELEMENT DETAILS */}
        {selectedElement && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-semibold flex justify-between items-center">
              {"Selected Element"}
              <button
                onClick={() => setSelectedElement(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent className="ml-2 gap-1 flex flex-col">
              <h4 className="scroll-m-20 text-lg font-medium tracking-tight">
                {selectedElement?.name || "No Element Selected"}
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedElement.ifcClass || "Unknown Class"}
              </p>
              <SelectedElementDetails element={selectedElement} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* MODEL BROWSER */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold">
            Model Browser
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {models.map((model, i) =>
                model.tree ? (
                  <Tree
                    key={i}
                    node={model.tree}
                    model={model.fragmentsGroup}
                  />
                ) : null
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* FLOOR PLANS */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold">
            2D Plans
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {plans?.list.map((floor) => (
                <SidebarMenuItem key={floor.id}>
                  <Button
                    variant={activeFloor === floor.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      if (activeFloor === floor.id) {
                        setActiveFloor(null);
                        plans.exitPlanView();
                      } else {
                        setActiveFloor(floor.id);
                        plans.goTo(floor.id);
                      }
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {floor.name}
                  </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CATEGORIES */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold">
            Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories &&
                Object.keys(categories).map((category, i) => (
                  <SidebarMenuItem
                    key={i}
                    onMouseEnter={(e: MouseEvent) => {
                      e.stopPropagation();
                      const cat = categories[category];
                      Object.entries(cat.fragIds).forEach(([_, fragMap]) => {
                        highlighter?.highlightByID(
                          "hover",
                          fragMap,
                          true,
                          false
                        );
                      });
                    }}
                    onMouseLeave={(e: MouseEvent) => {
                      e.stopPropagation();
                      highlighter?.clear("hover");
                    }}
                  >
                    <SidebarMenuButton>{category}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}

/* -------------------- Selected Element Details -------------------- */
function SelectedElementDetails({ element }: { element: any }) {
  // Minimal helpers
  const formatPropValue = (prop: Property) => {
    if (prop.value === null || prop.value === undefined) return "N/A";
    if (typeof prop.value === "boolean") return prop.value ? "Yes" : "No";
    if (typeof prop.value === "number")
      return prop.unit ? `${prop.value} ${prop.unit}` : `${prop.value}`;
    return prop.value.toString();
  };

  const renderAttributes = (attributes: ElementAttributes) => (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="p-1">Attribute</TableHead>
          <TableHead className="p-1">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(attributes).map(([key, val], i) => (
          <TableRow key={`${key}-${i}`} className="p-1">
            <TableCell className="font-medium capitalize p-1">{key}</TableCell>
            <TableCell className="p-1">
              {val.value === null || val.value === undefined
                ? "N/A"
                : typeof val.value === "boolean"
                ? val.value
                  ? "Yes"
                  : "No"
                : typeof val.value === "number"
                ? val.unit
                  ? `${val.value} ${val.unit}`
                  : val.value
                : val.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderMaterialContent = (m: MaterialData) => {
    if (m.type === "layerset") {
      return (
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="p-1">Layer</TableHead>
              <TableHead className="p-1">Thickness</TableHead>
              <TableHead className="p-1">Material</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {m.layers?.map((layer, i) => (
              <TableRow key={i}>
                <TableCell className="p-1">{`Layer ${i + 1}`}</TableCell>
                <TableCell className="p-1">{layer.thickness} mm</TableCell>
                <TableCell className="p-1">{layer.materialName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    if (m.type === "list") {
      return (
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="p-1">Material</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {m.materials?.map((mat: string, i: number) => (
              <TableRow key={i}>
                <TableCell className="p-1">{mat}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    if (m.type === "single") {
      return (
        <Table className="text-xs">
          <TableBody>
            <TableRow>
              <TableCell className="p-1">{m.name}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {element?.psets?.length > 0 && (
        <SimpleCollapsible label="Property Sets" defaultOpen>
          {element.psets.map((pset: any, i: number) => (
            <SimpleCollapsible key={i} label={pset.name}>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-1">Property</TableHead>
                    <TableHead className="p-1">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pset.properties.map((p: Property, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="p-1">{p.name}</TableCell>
                      <TableCell className="p-1">
                        {formatPropValue(p)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SimpleCollapsible>
          ))}
        </SimpleCollapsible>
      )}

      {element?.qsets?.length > 0 && (
        <SimpleCollapsible label="Quantity Sets" defaultOpen>
          {element.qsets.map((qset: any, i: number) => (
            <SimpleCollapsible key={i} label={qset.name}>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-1">Quantity</TableHead>
                    <TableHead className="p-1">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qset.quantities.map((q: Property, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="p-1">{q.name}</TableCell>
                      <TableCell className="p-1">
                        {formatPropValue(q)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SimpleCollapsible>
          ))}
        </SimpleCollapsible>
      )}

      {element?.attributes && Object.keys(element.attributes).length > 0 && (
        <SimpleCollapsible label="Attributes">
          <div className="p-2 rounded-md border">
            {renderAttributes(element.attributes)}
          </div>
        </SimpleCollapsible>
      )}

      {element?.materials?.length > 0 && (
        <SimpleCollapsible label="Materials" defaultOpen>
          {element.materials.map((mat: any, i: number) => (
            <SimpleCollapsible
              key={i}
              label={
                mat.type === "layerset"
                  ? "Material Layer Set"
                  : mat.type === "list"
                  ? "Material List"
                  : "Material"
              }
            >
              <div className="p-2 rounded-md border">
                {renderMaterialContent(mat)}
              </div>
            </SimpleCollapsible>
          ))}
        </SimpleCollapsible>
      )}
    </div>
  );
}

/* -------------------- Reusable Minimal Collapsible -------------------- */
function SimpleCollapsible({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible
      className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90 pl-3"
      defaultOpen={defaultOpen}
    >
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="h-auto text-xs hover:bg-secondary relative flex items-center justify-start">
          <ChevronRight className="mr-1 h-4 w-4 transition-transform" />
          {label}
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-3 mt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

/* -------------------- Entity Tree Components -------------------- */
function Tree({ node, model }: { node: EntityNode; model: FragmentsGroup }) {
  const { highlighter, hider } = useIfcViewer();
  const [isHidden, setIsHidden] = useState(false);
  const [hovered, setHovered] = useState(false);

  const getAllIds = (n: EntityNode): number[] => {
    let ids = [n.expressID];
    if (n.children) n.children.forEach((c) => (ids = ids.concat(getAllIds(c))));
    return ids;
  };

  const toggleVisibility = (e: MouseEvent) => {
    e.stopPropagation();
    setIsHidden((prev) => !prev);
    const fragMap = model.getFragmentMap(getAllIds(node));
    hider?.set(!isHidden, fragMap);
  };

  if (!node.children || node.children.length === 0) {
    return <Node node={node} model={model} />;
  }

  return (
    <SidebarMenuItem className={`pl-3 ${isHidden ? "opacity-50" : ""}`}>
      <Collapsible
        defaultOpen={
          node.ifcClass.toLowerCase() === "ifcproject" ||
          node.ifcClass.toLowerCase() === "ifcsite"
        }
        className="[&[data-state=open]>button>svg:first-child]:rotate-90"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="text-xs relative flex items-center justify-between hover:bg-secondary h-auto"
            onMouseEnter={(e) => {
              e.stopPropagation();
              setHovered(true);
              highlighter?.highlightByID(
                "hover",
                model.getFragmentMap(getAllIds(node)),
                true,
                false
              );
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              setHovered(false);
              highlighter?.clear("hover");
            }}
          >
            <ChevronRight className="transition-transform mr-1 flex-shrink-0" />
            <div className="flex flex-col flex-1">
              <div className="text-md font-semibold">{node.ifcClass}</div>
              <p className="text-sm text-muted-foreground truncate">
                {node.name}
              </p>
            </div>
            {hovered && (
              <button
                className="opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  toggleVisibility(e);
                }}
              >
                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!isHidden && (
          <CollapsibleContent>
            <div className="pl-3">
              {node.children.map((child, i) => (
                <Tree key={i} node={child} model={model} />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  );
}

function Node({ node, model }: { node: EntityNode; model: FragmentsGroup }) {
  const { highlighter, hider } = useIfcViewer();
  const [isHidden, setIsHidden] = useState(false);
  const [hovered, setHovered] = useState(false);

  const toggleVisibility = (e: MouseEvent) => {
    e.stopPropagation();
    setIsHidden((prev) => !prev);
    const fragMap = model.getFragmentMap([node.expressID]);
    hider?.set(!isHidden, fragMap);
  };

  return (
    <SidebarMenuButton
      className={`text-xs pl-4 relative flex items-center justify-between h-auto ${
        isHidden ? "opacity-50" : ""
      } hover:bg-secondary`}
      onClick={async () => {
        if (!isHidden) {
          await highlighter?.highlightByID(
            "select",
            model.getFragmentMap([node.expressID]),
            true,
            true
          );
        }
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        highlighter?.highlightByID(
          "hover",
          model.getFragmentMap([node.expressID]),
          true,
          false
        );
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
        highlighter?.clear("hover");
      }}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="text-md font-semibold truncate max-w-[calc(100%-2rem)]">
          {node.ifcClass}
        </div>
        <p className="text-sm text-muted-foreground truncate max-w-[calc(100%-2rem)]">
          {node.name}
        </p>
      </div>
      {hovered && (
        <button className="opacity-100" onClick={toggleVisibility}>
          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </SidebarMenuButton>
  );
}
