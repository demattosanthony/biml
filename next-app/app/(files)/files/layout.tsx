"use client";

import { Worker } from "@react-pdf-viewer/core";
import FileViewerHeader from "./file-viewer-header";

export default function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col relative max-h-[-webkit-fill-available] overflow-hidden">
      <FileViewerHeader />

      <div className="flex flex-1 w-full mt-[55px] items-center justify-center overflow-y-auto">
        <Worker workerUrl="http://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          {children}
        </Worker>

        {/* {fileQuery.isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <RingLoader />
            </div>
          )} */}
        {/* {!fileQuery.data && fileQuery.isFetched && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-lg font-semibold">File not found</div>
            </div>
          )} */}
      </div>
    </div>
  );
}
