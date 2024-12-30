"use client";

import { FileBox, Trash } from "lucide-react";

interface FileItemProps {
  name: string;
  size: number;
  onRemove: () => void;
}

export const FileItem = ({ name, size, onRemove }: FileItemProps) => {
  const formatFileSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);
  const fileName = name.split(".").slice(0, -1).join(".");
  const extension = name.split(".").pop();

  return (
    <div className="flex justify-between items-center w-full min-h-16 px-4 border border-gray-200 rounded-lg shadow-sm mb-1">
      <div className="flex items-center gap-4 h-full">
        <FileBox className="w-6 h-6" />
        <div className="flex flex-col">
          <div className="text-[0.85rem] font-medium leading-snug flex items-start">
            {fileName}
          </div>
          <div className="text-[0.7rem] text-gray-500 leading-tight flex items-start">
            .{extension} • {formatFileSize(size)} MB
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={onRemove}
      >
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
};

interface DropZoneProps {
  isDragging: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}

export const DropZone = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: DropZoneProps) => (
  <div
    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer mb-4
      ${
        isDragging
          ? "border-primary bg-primary/10"
          : "hover:border-primary hover:bg-primary/5"
      }`}
    onClick={onClick}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
  >
    <p className="text-lg font-medium">Drop IFC Files Here</p>
    <p className="text-sm text-muted-foreground mt-2">
      or click to select files
    </p>
  </div>
);

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
interface UploadSectionProps {
  onUpload: (files: File[]) => void;
}

export const UploadSection = ({ onUpload }: UploadSectionProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleFileUpload = useCallback((newFiles: FileList | null) => {
    if (newFiles) {
      // Only accept IFC files
      const validFiles = Array.from(newFiles).filter((file) =>
        file.name.endsWith(".ifc")
      );
      setFiles((prev) => [...prev, ...validFiles]);
      onUpload(validFiles);
    }
  }, []);

  const handlers = {
    dragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    dragLeave: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    },
    drop: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    removeFile: (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    },
    upload: () => {
      if (files.length > 0) {
        onUpload(files);
      }
    },
    loadSampleModel: () => {
      const sampleIfc = "/sample.ifc";
      fetch(sampleIfc)
        .then((response) => response.blob())
        .then((blob) => {
          const file = new File([blob], "sample.ifc", {
            type: "application/ifc",
          });
          onUpload([file]);
        })
        .catch((error) => {
          console.error("Error loading sample model:", error);
        });
    },
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="space-y-8 max-w-[600px] mx-auto">
          <div className="flex flex-col items-center justify-center gap-1 max-w-[600px]">
            <Image
              height={175}
              width={175}
              src={
                resolvedTheme === "dark"
                  ? "/rhombicuboctahedron-white.svg"
                  : "/rhombicuboctahedron.svg"
              }
              alt="Logo"
              className="h-[175px]"
            />
            <div className="space-y-1 text-center">
              <h1 className="text-6xl font-bold tracking-tighter">
                DaVinci Viewer
              </h1>
            </div>

            <div className="space-y-1 mt-2">
              <h2 className="text-xl text-muted-foreground font-normal sm:text-2xl">
                Next Generation BIM Software
              </h2>
              <p className="text-sm text-muted-foreground">
                View, edit, collaborate on IFC files in real-time
              </p>
            </div>
          </div>

          <div>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept=".ifc"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              aria-label="Upload IFC file"
            />

            {/* <DropZone
              isDragging={isDragging}
              onDragOver={handlers.dragOver}
              onDragLeave={handlers.dragLeave}
              onDrop={handlers.drop}
              onClick={() => document.getElementById("file-upload")?.click()}
            />  */}

            <div className="flex-1 max-h-[400px] overflow-y-auto">
              {files.map((file, index) => (
                <FileItem
                  key={index}
                  name={file.name}
                  size={file.size}
                  onRemove={() => handlers.removeFile(index)}
                />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center mt-4 gap-3">
              <Button
                size="lg"
                className="w-[175px]"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Load IFC Model
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-[175px]"
                onClick={handlers.loadSampleModel}
              >
                View Sample
              </Button>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm font-medium">
        Built with precision
      </footer>
    </div>
  );
};
