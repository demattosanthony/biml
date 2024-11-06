"use client";

import { Eye, EyeOff, FileBox } from "lucide-react";
import * as FRAGS from "@thatopen/fragments";
import { useState } from "react";
import useIfcStore from "@/stores/useIfcStore";

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
    <div className="w-[280px] max-w-[280px] h-full">
      {models?.map((model, index) => (
        <div
          key={index}
          className="flex justify-center items-center flex-row w-full h-14 gap-2 px-1"
        >
          <div className="flex items-center flex-row gap-1 h-full">
            <FileBox className="w-4 h-4" />

            <div className="flex flex-col flex-1 truncate">
              <div className="text-[0.85rem] font-medium">{model.name}</div>
            </div>
          </div>

          <div
            className="p-1 rounded-full border-solid border-[1px] border-gray-100 shadow-sm hover:bg-accent transition-all select-none cursor-pointer"
            onClick={() => toggleVisibility(model, index)}
          >
            {visibility[index] ?? (model.fragmentsGroup as any).visible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
