import { ChevronRight, File, Folder } from "lucide-react";

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
  return (
    <>
      <div
        className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
      >
        <div className="flex items-center gap-3">
          {item.type === "folder" ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{item.name}</span>
          {item.description && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {item.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {item.lastCommit}
          </span>
          {item.type === "folder" && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      {item.type === "folder" &&
        item.children &&
        item.children.map((child) => (
          <FileExplorerItem key={child.name} item={child} depth={depth + 1} />
        ))}
    </>
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
    name: "Architectural",
    type: "folder",
    description: "Floor plans, elevations, and sections",
    lastCommit: "2 days ago",
    children: [
      { name: "Floor Plans", type: "folder", lastCommit: "2 days ago" },
      { name: "Elevations", type: "folder", lastCommit: "3 days ago" },
      { name: "Sections", type: "folder", lastCommit: "3 days ago" },
      { name: "Details", type: "folder", lastCommit: "1 week ago" },
    ],
  },
  {
    name: "Structural",
    type: "folder",
    description: "Foundation and framing plans",
    lastCommit: "yesterday",
    children: [
      { name: "Foundation", type: "folder", lastCommit: "1 week ago" },
      { name: "Framing Plans", type: "folder", lastCommit: "yesterday" },
      { name: "Details", type: "folder", lastCommit: "3 days ago" },
    ],
  },
  {
    name: "MEP",
    type: "folder",
    description: "Mechanical, electrical, and plumbing",
    lastCommit: "3 days ago",
    children: [
      { name: "Mechanical", type: "folder", lastCommit: "3 days ago" },
      { name: "Electrical", type: "folder", lastCommit: "4 days ago" },
      { name: "Plumbing", type: "folder", lastCommit: "5 days ago" },
    ],
  },
  {
    name: "Civil",
    type: "folder",
    description: "Site plans and utilities",
    lastCommit: "1 week ago",
    children: [
      { name: "Site Plan", type: "folder", lastCommit: "1 week ago" },
      { name: "Grading", type: "folder", lastCommit: "1 week ago" },
      { name: "Utilities", type: "folder", lastCommit: "2 weeks ago" },
    ],
  },
  {
    name: "Specifications",
    type: "folder",
    description: "Technical specifications and requirements",
    lastCommit: "5 days ago",
  },
  {
    name: "General",
    type: "folder",
    description: "Project information and schedules",
    lastCommit: "2 days ago",
  },
  {
    name: "README.md",
    type: "file",
    description: "Project overview and documentation",
    lastCommit: "3 days ago",
  },
];
