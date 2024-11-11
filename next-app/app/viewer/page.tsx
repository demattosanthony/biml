"use client";

import IFCFileUploadCard from "@/components/ifc-upload-card";
import IFCViewer from "@/components/ifc-viewer";
import { useState } from "react";

export default function ModelViewerUploadPage() {
  const [models, setModels] = useState<File[]>([]);

  const handleUpload = (files: File[]) => {
    setModels(files);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {models.length === 0 ? (
        <IFCFileUploadCard onUpload={handleUpload} />
      ) : (
        <IFCViewer
          blobs={models.map(
            (model) => new Blob([model], { type: "application/octet-stream" })
          )}
          modelName="test.ifc"
        />
      )}
    </div>
  );
}
