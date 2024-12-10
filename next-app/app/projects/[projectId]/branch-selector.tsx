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

const branches = [
  {
    value: "main",
    label: "main",
    description: "Main project branch",
  },
  {
    value: "structural",
    label: "structural",
    description: "Structural engineering updates",
  },
  {
    value: "mep",
    label: "mep",
    description: "MEP systems coordination",
  },
  {
    value: "arch",
    label: "arch",
    description: "Architectural revisions",
  },
  {
    value: "site",
    label: "site",
    description: "Site and civil engineering",
  },
];

export function BranchSelector() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("main");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {value
              ? branches.find((branch) => branch.value === value)?.label
              : "Select branch..."}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search branch..." />
          <CommandEmpty>No branch found.</CommandEmpty>
          <CommandGroup>
            {branches.map((branch) => (
              <CommandItem
                key={branch.value}
                value={branch.value}
                onSelect={(currentValue) => {
                  setValue(currentValue);
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
