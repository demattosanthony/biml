"use client";

import IFCModelCard from "@/components/ifc-model-card";
import IFCFileUploadCard from "@/components/ifc-upload-card";
import IFCViewer from "@/components/ifc-viewer";
import { useState } from "react";

export default function ModelViewerUploadPage() {
  const [models, setModels] = useState<File[]>([]);

  const handleUpload = (files: File[]) => {
    setModels(files);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {models.length === 0 ? (
        <IFCFileUploadCard onUpload={handleUpload} />
      ) : (
        <div className="flex flex-1 h-full w-full">
          {/* <IFCModelCard /> */}

          <IFCViewer files={models} />
        </div>
      )}
    </div>
  );
}
