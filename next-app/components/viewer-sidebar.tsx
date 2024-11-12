"use client";

import { useState } from "react";
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
import { ChevronRight, File, Folder, Eye, EyeOff } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import useIfcViewerStore, { EntityNode } from "@/stores/useIfcViewerStore";
import { FragmentsGroup } from "@thatopen/fragments";

export function IFCViewerSidebar() {
  const models = useIfcViewerStore((state) => state.models);

  return (
    <Sidebar side="left" className="w-auto">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Model Browser</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {models.map(
                (model, index) =>
                  model.tree && (
                    <Tree
                      key={index}
                      node={model.tree}
                      model={model.fragmentsGroup}
                    />
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}

function Node({ node, model }: { node: EntityNode; model: FragmentsGroup }) {
  const { ifcClass, name } = node;
  const highlighter = useIfcViewerStore((state) => state.highlighter);
  const hider = useIfcViewerStore((state) => state.hider);
  const [isHidden, setIsHidden] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(!isHidden);
    const fragMap = model.getFragmentMap([node.expressID]);
    hider?.set(isHidden, fragMap);
  };

  return (
    <SidebarMenuButton
      className={`text-xs pl-2 relative flex items-center justify-between ${
        isHidden ? "opacity-50" : ""
      } hover:bg-gray-100`}
      onClick={async () => {
        if (!isHidden) {
          const fragMap = model.getFragmentMap([node.expressID]);
          await highlighter?.highlightByID("select", fragMap, true, true);
        }
      }}
      onMouseEnter={(e) => {
        e.stopPropagation(); // Prevent event bubble up to parent
        setHovered(true);
        highlighter?.highlightByID(
          "hover",
          model.getFragmentMap([node.expressID]),
          true,
          false
        );
      }}
      onMouseLeave={(e) => {
        e.stopPropagation(); // Prevent event bubble up to parent
        setHovered(false);
        highlighter?.clear("hover");
      }}
    >
      <File className="mr-2 flex-shrink-0" />
      <span className="leading-tight flex flex-1">{`${ifcClass} - ${name}`}</span>
      {hovered && (
        <button className="opacity-100" onClick={handleToggleVisibility}>
          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </SidebarMenuButton>
  );
}

function Tree({ node, model }: { node: EntityNode; model: FragmentsGroup }) {
  const { ifcClass, name, children } = node;
  const hider = useIfcViewerStore((state) => state.hider);
  const [isHidden, setIsHidden] = useState(false);
  const [hovered, setHovered] = useState(false);

  function getAllExpressIDs(node: EntityNode): number[] {
    let ids = [node.expressID];
    if (node.children) {
      node.children.forEach((child) => {
        ids = ids.concat(getAllExpressIDs(child));
      });
    }
    return ids;
  }

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(!isHidden);
    const ids = getAllExpressIDs(node);
    const fragMap = model.getFragmentMap(ids);
    hider?.set(isHidden, fragMap);
  };

  // For leaf nodes (files)
  if (!children || children.length === 0) {
    return <Node node={node} model={model} />;
  }

  // For nodes with children (folders)
  return (
    <SidebarMenuItem className={`pl-2 ${isHidden ? "opacity-50" : ""}`}>
      <Collapsible
        defaultOpen={false}
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="text-xs relative flex items-center justify-between hover:bg-gray-100"
            onMouseEnter={(e) => {
              e.stopPropagation(); // Prevent event bubble up
              setHovered(true);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation(); // Prevent event bubble up
              setHovered(false);
            }}
          >
            <ChevronRight className="transition-transform mr-1 flex-shrink-0" />
            <Folder className="mr-2 flex-shrink-0" />
            <span className="leading-tight flex-1 flex">{`${ifcClass} - ${name}`}</span>
            {hovered && (
              <button className="opacity-100" onClick={handleToggleVisibility}>
                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!isHidden && (
          <CollapsibleContent>
            <div className="pl-4">
              {children.map((childNode, index) => (
                <Tree key={index} node={childNode} model={model} />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  );
}
