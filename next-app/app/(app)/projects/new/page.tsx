"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewProjectPage() {
  const [projectInfo, setProjectInfo] = useState({
    projectName: "",
    client: "",
    description: "",
    visibility: "private",
    includeTemplate: true,
  });

  const handleProjectInfoChange = (field: string, value: string | boolean) => {
    setProjectInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Create a new project</h1>
        {/* <p className="text-muted-foreground mt-1">
          Set up your project information and requirements. You can add more
          detailed specifications later.
        </p> */}
        <p className="text-sm text-muted-foreground italic mb-6">
          Required fields are marked with an asterisk (*)
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="projectName">Project Name *</Label>
          <Input
            id="projectName"
            value={projectInfo.projectName}
            onChange={(e) =>
              handleProjectInfoChange("projectName", e.target.value)
            }
            placeholder="Enter project name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="client">Client Name *</Label>
          <Input
            id="client"
            value={projectInfo.client}
            onChange={(e) => handleProjectInfoChange("client", e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={projectInfo.description}
            onChange={(e) =>
              handleProjectInfoChange("description", e.target.value)
            }
            placeholder="Add a description of your project"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-4">
          <Label>Visibility</Label>
          <RadioGroup
            defaultValue={projectInfo.visibility}
            onValueChange={(value) =>
              handleProjectInfoChange("visibility", value)
            }
            className="grid gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="font-normal">
                Public
              </Label>
              <span className="text-sm text-muted-foreground ml-2">
                Anyone can view this project
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="font-normal">
                Private
              </Label>
              <span className="text-sm text-muted-foreground ml-2">
                You choose who can view and edit this project
              </span>
            </div>
          </RadioGroup>
        </div>

        {/* <div className="space-y-4">
          <Label>Initialize this project with:</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="template"
              checked={projectInfo.includeTemplate}
              onCheckedChange={(checked) =>
                handleProjectInfoChange("includeTemplate", checked)
              }
            />
            <Label htmlFor="template" className="font-normal">
              Include default BIM templates
            </Label>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            Start with pre-configured IDS templates for common building elements
          </p>
        </div> */}

        <div className="pt-6 border-t">
          <Button size="lg">Create project</Button>
        </div>
      </div>
    </div>
  );
}
