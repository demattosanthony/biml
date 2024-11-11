"use client";

import { useState } from "react";
import * as OBC from "@thatopen/components";
import { useSetup } from "@/hooks/ifc-viewer/useSetupViewer";

export default function IFCViewer({ files }: { files: File[] }) {
  useState<OBC.IfcLoader | null>(null);
  useSetup(files);

  return (
    <div className="flex flex-1 cursor-grab relative" id="ifc-viewer">
      {/** Plans List */}
      {/* <div className="absolute top-0 left-0 z-50">
        {plans?.list.map((plan) => (
          <div
            key={plan.id}
            className="p-4"
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
      </div> */}

      {/* {loadingModel && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-90 z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )} */}
    </div>
  );
}
