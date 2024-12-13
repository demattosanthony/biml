"use client";

import * as React from "react";
import { Check, ChevronDown, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const BRANCHES = [
  {
    value: "concept",
    label: "concept",
    description: "Conceptual design phase",
  },
  {
    value: "schematic",
    label: "schematic",
    description: "Schematic design phase",
  },
  {
    value: "design-dev",
    label: "design-dev",
    description: "Design development phase",
  },
  {
    value: "construction",
    label: "construction",
    description: "Construction documentation phase",
  },
];

export function BranchSelector() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("concept");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          onClick={() => setOpen(!open)}
          className="w-[200px] justify-between"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {(value &&
              BRANCHES.find((branch) => branch.value === value)?.label) ||
              "Select branch..."}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search branch..." />
          <CommandEmpty>No branch found.</CommandEmpty>
          <CommandGroup>
            {BRANCHES.map((branch) => (
              <CommandItem
                key={branch.value}
                onSelect={() => {
                  setValue(branch.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === branch.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <div>{branch.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {branch.description}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
