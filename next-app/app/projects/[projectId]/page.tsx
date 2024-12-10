"use client";

import {
  Building2,
  GitBranch,
  Plus,
  Search,
  Code,
  Tag,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProjectFileExplorer } from "./project-file-explorer";
import { ProjectSidebar } from "./project-sidebar";
import { BranchSelector } from "./branch-selector";
import { ReadmeSection } from "./readme-section";
import { Separator } from "@/components/ui/separator";

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-background flex items-center flex-col">
      <div className="flex flex-col items-center max-w-6xl w-full">
        {/* Project Header */}
        <header className="border-b w-full">
          <div className="container py-6 px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6" />
                <h1 className="text-xl font-semibold">Dunbar High School</h1>
                <span className="text-sm text-muted-foreground">
                  Washington, DC
                </span>
                <Badge variant="secondary">Public</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <BranchSelector />
              <Button variant="outline" size="sm" className="gap-2">
                <GitBranch className="h-4 w-4" />1 Branch
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder="Go to file"
                  className="max-w-[300px]"
                  type="search"
                />
                <Button variant="outline" size="sm">
                  Add file
                </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    yesterday
                  </Button>
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
    </div>
  );
}
