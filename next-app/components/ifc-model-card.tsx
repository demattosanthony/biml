"use client";

import { FileBox } from "lucide-react";
import * as FRAGS from "@thatopen/fragments";
import { useState } from "react";
import useIfcStore from "@/stores/useIfcStore";
import { Switch } from "./ui/switch";

export default function IFCModelCard() {
  const models = useIfcStore((state) => state.models);
  const hider = useIfcStore((state) => state.hider);
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
    <div className="w-[280px] max-w-[280px] h-full border-r-2 flex flex-col p-2">
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
    </div>
  );
}
