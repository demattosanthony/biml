"use client";

import { ChevronDown, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { commitsByDate } from "@/data/sampleData";
import { CommitCard } from "@/components/commits/commit-card";

const commitDates = Object.keys(commitsByDate);

export default function CommitHistory() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="flex justify-between items-center mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <GitBranch className="h-4 w-4" />
              main
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>main</DropdownMenuItem>
            <DropdownMenuItem>develop</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                All users
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All users</DropdownMenuItem>
              <DropdownMenuItem>Emily Chen</DropdownMenuItem>
              <DropdownMenuItem>Marcus Johnson</DropdownMenuItem>
              <DropdownMenuItem>Sophia Lee</DropdownMenuItem>
              <DropdownMenuItem>Alex Rodriguez</DropdownMenuItem>
              <DropdownMenuItem>Olivia Taylor</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                All time
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All time</DropdownMenuItem>
              <DropdownMenuItem>Past 24 hours</DropdownMenuItem>
              <DropdownMenuItem>Past week</DropdownMenuItem>
              <DropdownMenuItem>Past month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-lg divide-y">
        {commitDates.map((date) => (
          <div key={date} className="bg-background">
            <div className="p-4 bg-muted/50">
              <h2 className="text-sm font-medium text-muted-foreground">
                Commits on {date}
              </h2>
            </div>
            <div className="divide-y">
              {commitsByDate[date].map((commit) => (
                <CommitCard key={commit.id} commit={commit} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
