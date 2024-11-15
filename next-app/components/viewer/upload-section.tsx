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

// components/upload/UploadSection.tsx
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
  const { theme, systemTheme } = useTheme();
  const realTheme = theme === "system" ? systemTheme : theme;

  const handleFileUpload = useCallback((newFiles: FileList | null) => {
    if (newFiles) {
      setFiles((prev) => [...prev, ...Array.from(newFiles)]);
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
        });
    },
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="space-y-7 max-w-[600px] mx-auto">
          <Badge variant="secondary" className="font-bold text-lg bg-secondary">
            Introducing
          </Badge>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              height={75}
              width={75}
              src={
                realTheme === "dark"
                  ? "/rhombicuboctahedron-white.svg"
                  : "/rhombicuboctahedron.svg"
              }
              alt="Logo"
              className="h-[75px]"
            />
            <h1 className="text-6xl font-bold tracking-tighter">
              DaVinci Viewer
            </h1>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl text-muted-foreground font-normal sm:text-2xl">
              Next Generation BIM Platform
            </h2>
            <p className="text-sm text-muted-foreground">
              View and analyze your BIM files in seconds
            </p>
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

            <DropZone
              isDragging={isDragging}
              onDragOver={handlers.dragOver}
              onDragLeave={handlers.dragLeave}
              onDrop={handlers.drop}
              onClick={() => document.getElementById("file-upload")?.click()}
            />

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
              <Button size="lg" className="w-[175px]" onClick={handlers.upload}>
                Launch Viewer
              </Button>
              <Button
                size="lg"
                variant={"ghost"}
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
