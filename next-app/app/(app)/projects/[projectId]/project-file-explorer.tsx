import React, { useState } from "react";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";

export function ProjectFileExplorer() {
  return (
    <div className="divide-y">
      {projectFiles.map((item) => (
        <FileExplorerItem key={item.name} item={item} />
      ))}
    </div>
  );
}

function FileExplorerItem({
  item,
  depth = 0,
}: {
  item: ProjectFile;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ifc":
        return "📐";
      case "pdf":
        return "📄";
      case "xlsx":
      case "xls":
        return "📊";
      case "ttl":
        return "🔗";
      case "dwg":
        return "✏️";
      case "rvt":
        return "🏗️";
      case "md":
        return "📝";
      default:
        return null;
    }
  };

  return (
    <div>
      <div
        className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
        onClick={() => item.type === "folder" && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {item.type === "folder" ? (
            <>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Folder className="h-4 w-4 text-muted-foreground" />
            </>
          ) : (
            <>
              <span className="w-4">
                {getFileIcon(item.name) || (
                  <File className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            </>
          )}
          <span className="text-sm">{item.name}</span>
          {item.description && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {item.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {item.lastCommit}
          </span>
        </div>
      </div>
      {isOpen && item.type === "folder" && item.children && (
        <div>
          {item.children.map((child) => (
            <FileExplorerItem key={child.name} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectFile {
  name: string;
  type: "file" | "folder";
  description?: string;
  lastCommit: string;
  children?: ProjectFile[];
}

const projectFiles: ProjectFile[] = [
  {
    name: "01-Architectural",
    type: "folder",
    description: "Architectural drawings and models",
    lastCommit: "2 days ago",
    children: [
      {
        name: "drawings",
        type: "folder",
        lastCommit: "2 days ago",
        children: [
          {
            name: "A-100_FloorPlans.pdf",
            type: "file",
            lastCommit: "2 days ago",
          },
          {
            name: "A-200_Elevations.pdf",
            type: "file",
            lastCommit: "3 days ago",
          },
          {
            name: "A-300_Sections.pdf",
            type: "file",
            lastCommit: "3 days ago",
          },
          { name: "A-500_Details.dwg", type: "file", lastCommit: "1 week ago" },
        ],
      },
      {
        name: "models",
        type: "folder",
        lastCommit: "2 days ago",
        children: [
          {
            name: "architectural_model_r21.rvt",
            type: "file",
            lastCommit: "2 days ago",
          },
          { name: "export.ifc", type: "file", lastCommit: "2 days ago" },
        ],
      },
    ],
  },
  {
    name: "02-Structural",
    type: "folder",
    description: "Structural analysis and details",
    lastCommit: "yesterday",
    children: [
      {
        name: "S-100_FoundationPlan.pdf",
        type: "file",
        lastCommit: "1 week ago",
      },
      { name: "S-200_FramingPlans.pdf", type: "file", lastCommit: "yesterday" },
      { name: "S-500_Details.dwg", type: "file", lastCommit: "3 days ago" },
      { name: "structural_calcs.xlsx", type: "file", lastCommit: "5 days ago" },
      { name: "structural_model.rvt", type: "file", lastCommit: "2 days ago" },
    ],
  },
  {
    name: "03-MEP",
    type: "folder",
    description: "MEP systems documentation",
    lastCommit: "3 days ago",
    children: [
      { name: "M-100_HVAC.pdf", type: "file", lastCommit: "3 days ago" },
      { name: "E-100_Electrical.pdf", type: "file", lastCommit: "4 days ago" },
      { name: "P-100_Plumbing.pdf", type: "file", lastCommit: "5 days ago" },
      { name: "mep_model.rvt", type: "file", lastCommit: "3 days ago" },
      {
        name: "load_calculations.xlsx",
        type: "file",
        lastCommit: "1 week ago",
      },
    ],
  },
  {
    name: "04-Site",
    type: "folder",
    description: "Site and civil engineering",
    lastCommit: "1 week ago",
    children: [
      { name: "C-100_SitePlan.pdf", type: "file", lastCommit: "1 week ago" },
      { name: "C-200_Grading.pdf", type: "file", lastCommit: "1 week ago" },
      { name: "C-300_Utilities.dwg", type: "file", lastCommit: "2 weeks ago" },
      { name: "site_model.rvt", type: "file", lastCommit: "1 week ago" },
    ],
  },
  {
    name: "05-Specifications",
    type: "folder",
    description: "Project specifications",
    lastCommit: "5 days ago",
    children: [
      {
        name: "architectural_specs.pdf",
        type: "file",
        lastCommit: "5 days ago",
      },
      { name: "structural_specs.pdf", type: "file", lastCommit: "5 days ago" },
      { name: "mep_specs.pdf", type: "file", lastCommit: "5 days ago" },
    ],
  },
  {
    name: "06-BIM",
    type: "folder",
    description: "BIM coordination files",
    lastCommit: "1 day ago",
    children: [
      { name: "coordination_model.ifc", type: "file", lastCommit: "1 day ago" },
      { name: "clash_report.pdf", type: "file", lastCommit: "1 day ago" },
      {
        name: "bim_execution_plan.pdf",
        type: "file",
        lastCommit: "1 week ago",
      },
    ],
  },
  {
    name: "07-Data",
    type: "folder",
    description: "Project data and analytics",
    lastCommit: "3 days ago",
    children: [
      { name: "building_data.ttl", type: "file", lastCommit: "3 days ago" },
      { name: "energy_analysis.xlsx", type: "file", lastCommit: "4 days ago" },
      { name: "cost_estimates.xlsx", type: "file", lastCommit: "1 week ago" },
    ],
  },
  {
    name: "README.md",
    type: "file",
    description: "Project overview and documentation",
    lastCommit: "3 days ago",
  },
];

export default ProjectFileExplorer;
