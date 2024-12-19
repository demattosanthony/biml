"use client";
import { Building2, GitBranch, Plus, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProjectFileExplorer } from "./project-file-explorer";
import { ProjectSidebar } from "./project-sidebar";
import { BranchSelector } from "./branch-selector";
import { ReadmeSection } from "./readme-section";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

export default function ProjectPage() {
  return (
    <div className="flex flex-col items-center max-w-5xl w-full">
      {/* Project Header */}
      <header className="border-b w-full">
        <div className="container py-6 px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/setty_favicon.png"
                alt="Setty & Associates"
                className="h-6"
              />
              <h1 className="text-2xl font-bold">Dunbar High School</h1>
              <span className="text-sm text-muted-foreground">
                Washington, DC
              </span>
              <Badge variant="secondary">Private</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <BranchSelector />
            <Button variant="outline" size="sm" className="gap-2">
              <GitBranch className="h-4 w-4" />1 Branch
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Go to file"
                className="max-w-[300px] h-9"
                type="search"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4" />
                    Add file
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => {
                        // Handle create new file
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Create new file
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => {
                        // Handle upload files
                      }}
                    >
                      <Upload className="h-4 w-4" />
                      Upload files
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>
      <div className="container py-6 px-6">
        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          <div className="space-y-6">
            <div className="border rounded-lg">
              {/* Latest Commit Info */}
              <div className="p-3 flex items-center justify-between border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-muted" />
                  <div>
                    <span className="font-medium">Sarah Chen</span>
                    <span className="text-muted-foreground mx-2">
                      Updated structural calculations for floor system
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      3206e05
                    </span>
                  </div>
                </div>
                <Link href={`/projects/1/commits`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    yesterday
                  </Button>
                </Link>
              </div>
              <ProjectFileExplorer />
            </div>
            <ReadmeSection />
          </div>
          {/* Project Sidebar - Hidden on smaller screens */}
          <div className="hidden lg:block">
            <ProjectSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
