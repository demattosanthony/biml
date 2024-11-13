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
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import useIfcViewerStore, { EntityNode } from "@/stores/useIfcViewerStore";
import { FragmentsGroup } from "@thatopen/fragments";

export function IFCViewerSidebar() {
  const models = useIfcViewerStore((state) => state.models);
  const plans = useIfcViewerStore((state) => state.plans);

  return (
    <Sidebar side="left">
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
        {plans && plans?.list.length > 0 && (
          <SidebarGroup key={"plans"}>
            <SidebarGroupLabel>Plans</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {plans?.list.map((plan) => (
                  <SidebarMenuItem
                    key={plan.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      plans?.goTo(plan.id);
                      // if (culler) culler.needsUpdate = true;
                    }}
                  >
                    <SidebarMenuButton asChild>
                      <div>{plan.name}</div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem
                  onClick={(e) => {
                    plans?.exitPlanView();
                    // if (culler) culler.needsUpdate = true;
                  }}
                >
                  <SidebarMenuButton asChild>
                    <div>Exit plan view</div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
      className={`text-xs pl-4 relative flex items-center justify-between h-auto ${
        isHidden ? "opacity-50" : ""
      } hover:bg-secondary`}
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
      {/* <File className="mr-2 flex-shrink-0" /> */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="text-md font-semibold truncate max-w-[calc(100%-2rem)]">
          {ifcClass}
        </div>
        <p className="text-sm text-muted-foreground truncate max-w-[calc(100%-2rem)]">
          {name}
        </p>
      </div>

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
  const highlighter = useIfcViewerStore((state) => state.highlighter);
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
    e.preventDefault();
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
    <SidebarMenuItem className={`pl-3 ${isHidden ? "opacity-50" : ""}`}>
      <Collapsible
        defaultOpen={false}
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="text-xs relative flex items-center justify-between hover:bg-secondary h-auto"
            onMouseEnter={(e) => {
              e.stopPropagation(); // Prevent event bubble up
              setHovered(true);
              const ids = getAllExpressIDs(node);
              highlighter?.highlightByID(
                "hover",
                model.getFragmentMap(ids),
                true,
                false
              );
            }}
            onMouseLeave={(e) => {
              e.stopPropagation(); // Prevent event bubble up
              setHovered(false);
              highlighter?.clear("hover");
            }}
          >
            <ChevronRight className="transition-transform mr-1 flex-shrink-0" />
            {/* <Folder className="mr-2 flex-shrink-0" /> */}
            <div className="flex flex-col flex-1">
              <div className="text-md font-semibold">{ifcClass}</div>
              <p className="text-sm text-muted-foreground truncate">{name}</p>
            </div>

            {hovered && (
              <button className="opacity-100" onClick={handleToggleVisibility}>
                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!isHidden && (
          <CollapsibleContent>
            <div className="pl-3">
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
