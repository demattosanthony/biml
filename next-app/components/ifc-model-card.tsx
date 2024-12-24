"use client";

import { FileBox } from "lucide-react";
import * as FRAGS from "@thatopen/fragments";
import { useState } from "react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useIfcViewer } from "@/hooks/ifc-viewer/useIfcViewer";
import { TypographyH3 } from "./typography";

export default function IFCModelCard() {
  const { models, plans, hider, culler } = useIfcViewer();

  const [visibility, setVisibility] = useState<{ [key: number]: boolean }>({});

  const toggleVisibility = (model: any, index: number) => {
    const visible = model.fragmentsGroup.visible;
    const modelIdMap: FRAGS.FragmentIdMap = {};

    for (const item of model.fragmentsGroup.items) {
      modelIdMap[item.id] = item.ids;
    }

    hider?.set(!visible, modelIdMap);
    model.fragmentsGroup.visible = !visible;

    setVisibility((prev) => ({
      ...prev,
      [index]: !visible,
    }));
  };

  return (
    <div className="min-w-[280px] w-auto max-w-[375px] h-full border-r-2 flex flex-col p-2">
      <TypographyH3>Models</TypographyH3>
      <div className="flex flex-1 flex-col space-y-2">
        {models?.map((model, index) => (
          <div
            key={index}
            className="flex items-center justify-between w-full h-14 gap-2 p-2"
          >
            <div className="flex items-center flex-1 truncate gap-2">
              <FileBox className="min-w-5 min-h-5 max-h-5 max-w-5" />
              <div className="text-[0.85rem] font-medium truncate">
                {model.name}
              </div>
            </div>
            <Switch
              className="ml-auto"
              onCheckedChange={(checked) => toggleVisibility(model, index)}
              checked={visibility[index] ?? model.fragmentsGroup.visible}
            />
          </div>
        ))}
      </div>

      {/** Plans List */}
      {plans && (
        <div className="flex flex-col ">
          {plans?.list.map((plan) => (
            <div
              key={plan.id}
              className="p-4 cursor-pointer hover:bg-secondary rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                plans?.goTo(plan.id);
                if (culler) culler.needsUpdate = true;
              }}
            >
              {plan.name}
            </div>
          ))}

          <Button
            onClick={() => {
              plans?.exitPlanView();
              if (culler) culler.needsUpdate = true;
            }}
          >
            Exit Plan View
          </Button>
        </div>
      )}
    </div>
  );
}
