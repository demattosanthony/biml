import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { File, FileBox, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function IFCFileUploadCard({
  onUpload,
}: {
  onUpload: (file: File[]) => void;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  // const setIfcFiles = useIfcStore((state) => state.actions.setIFCFiles);

  // const uploadIfcModelMutation = useMutation({
  //   mutationFn: async (file: File) => {
  //     const facility = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/facilities/create`,
  //       {
  //         method: "POST",
  //       }
  //     );

  //     const data = await facility.json();

  //     const id = data.id;

  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append("facilityId", id);

  //     const ifc_model = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/ifc/upload`,
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );

  //     return await ifc_model.json();
  //   },
  // });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Add to the existing files
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/octet-stream": [".ifc"] },
  });

  function uploadIFCFiles() {
    onUpload(files);
    setFiles([]); // Clear the files
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-[450px]">
        <CardHeader>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Import IFC Models
          </h3>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`flex justify-center items-center w-full h-32 border-dashed border-2 border-gray-200 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all select-none cursor-pointer gap-1 ${
              isDragActive && "bg-accemt text-accent-foreground"
            }`}
          >
            <input {...getInputProps()} />

            <File />

            <div className="text-lg font-semibold">Drop Files Here</div>
          </div>

          <div className="flex flex-col w-full items-center">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center flex-row w-full h-16 mt-2 px-4 border-solid border-2 border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center flex-row gap-4 h-full">
                  <FileBox className=" w-6 h-6" />

                  <div className="flex flex-col gap-0">
                    <div className="text-[0.85rem] font-medium leading-snug">
                      {file.name.split(".").slice(0, -1).join(".")}
                    </div>
                    <div className="text-[0.7rem] text-gray-500 leading-tight">
                      .{file.name.split(".").pop()} •{" "}
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div
                  className="p-2 rounded-full border-solid border-2 border-gray-100 shadow-sm hover:bg-accent transition-all select-none cursor-pointer"
                  onClick={() => {
                    setFiles((prev) => prev.filter((_, i) => i !== index));
                  }}
                >
                  <Trash className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={files.length === 0} onClick={uploadIFCFiles}>
            Upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
