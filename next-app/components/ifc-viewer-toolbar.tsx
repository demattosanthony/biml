"use client";

import { Hand, Rotate3D, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import useIfcViewerStore from "@/stores/useIfcViewerStore";

type CameraMode = {
  id: string;
  label: string;
  icon: JSX.Element;
  shortcut: string;
};

export default function Component() {
  const cameraModes: CameraMode[] = [
    {
      id: "Orbit",
      label: "Orbit",
      icon: <Rotate3D className="h-4 w-4" />,
      shortcut: "O",
    },
    {
      id: "Plan",
      label: "Hand Tool",
      icon: <Hand className="h-4 w-4" />,
      shortcut: "H",
    },
    {
      id: "FirstPerson",
      label: "First Person",
      icon: <ScanEye className="h-4 w-4" />,
      shortcut: "P",
    },
  ];
  const world = useIfcViewerStore((state) => state.world);

  const [selectedMode, setSelectedMode] = useState<CameraMode>(cameraModes[0]);

  const handleCameraModeChange = (mode: CameraMode) => {
    setSelectedMode(mode);

    let thisWorld: any = world;
    const { current } = thisWorld.camera.projection;
    const isOrtho = current === "Orthographic";
    const isFirstPerson = mode.id === "FirstPerson";

    // Change camera projection to Perspective if First Person mode is selected
    if (isOrtho && isFirstPerson) {
      thisWorld.camera.projection.set("Perspective");
    }

    thisWorld.camera.set(mode.id);

    // Change cursor to grab if Hand Tool is selected
    const viewerElement = document.getElementById("ifc-viewer");
    if (viewerElement) {
      viewerElement.style.cursor = mode.id === "Plan" ? "grab" : "default";
    }
  };

  return (
    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center gap-1 p-1.5 bg-background rounded-lg border shadow-lg">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {selectedMode.icon}
              <span className="sr-only">Select camera mode</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            <div className="bg-background rounded-lg">
              {cameraModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant="ghost"
                  className="w-full justify-between px-3 py-2 text-sm font-normal"
                  onClick={() => handleCameraModeChange(mode)}
                >
                  <div className="flex items-center gap-2">
                    {mode.icon}
                    {mode.label}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {mode.shortcut}
                  </span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
