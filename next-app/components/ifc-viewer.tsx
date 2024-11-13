"use client";

import { useSetup } from "@/hooks/ifc-viewer/useSetupViewer";
import IFCViewerToolbar from "./ifc-viewer-toolbar";
import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { Loader2 } from "lucide-react";
import * as THREE from "three";

export default function IFCViewer({ files }: { files: File[] }) {
  const loadingModels = useIfcViewerStore((state) => state.loadingModels);
  const camera = useIfcViewerStore((state) => state.camera);
  useSetup(files);

  const handleAxisSelected = (event: {
    axis: string;
    direction: THREE.Vector3;
  }) => {
    console.log("Selected axis:", event.axis);
    console.log("Direction:", event.direction);
  };

  return (
    <div className="flex flex-1 cursor-default relative" id="ifc-viewer">
      <IFCViewerToolbar />
      {loadingModels && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-90 z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {/* 
      {camera && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <OrientationGizmo camera={camera as any} />
        </div>
      )} */}
    </div>
  );
}
