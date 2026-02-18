"use client";
import {
  Dropzone,
  DropZoneArea,
  DropzoneDescription,
  DropzoneFileList,
  DropzoneFileListItem,
  DropzoneMessage,
  DropzoneRemoveFile,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import { AnyFieldApi } from "@tanstack/react-form";
import { CloudUploadIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

interface Prop {
  field: AnyFieldApi;
}

export default function CustomDropZone({ field }: Prop) {
  const [enoughFile, setEnoughFile] = useState(false);
  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      setEnoughFile(true);
      field.handleChange(file);
      return {
        status: "success",
        result: URL.createObjectURL(file),
      };
    },

    onRemoveFile: () => {
      setEnoughFile(false);
      field.handleChange(undefined);
    },
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxSize: 5 * 1024 * 1024,
      maxFiles: 1,
    },
  });

  return (
    <div className="flex flex-col gap-4 py-2">
      <Dropzone {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>
              Please Choose Your Thumbnail Image <b>(Max 1 file) </b>
            </DropzoneDescription>

            <DropzoneMessage />
          </div>

          {!enoughFile ? (
            <DropZoneArea>
              <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
                <CloudUploadIcon className="size-8" />
                <div>
                  <p className="font-semibold">Upload listing images</p>
                  <p className="text-sm text-muted-foreground">
                    Click here or drag and drop to upload
                  </p>
                </div>
              </DropzoneTrigger>
            </DropZoneArea>
          ) : null}
        </div>

        <DropzoneFileList className="grid grid-cols-3 gap-3 p-0">
          {dropzone.fileStatuses.map((file) => (
            <DropzoneFileListItem
              className="overflow-hidden rounded-md bg-secondary p-0 shadow-sm"
              key={file.id}
              file={file}
            >
              {file.status === "pending" && (
                <div className="aspect-video animate-pulse bg-black/20" />
              )}
              {file.status === "success" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.result}
                  alt={`uploaded-${file.fileName}`}
                  className="aspect-video object-cover"
                />
              )}
              <div className="flex items-center justify-between p-2 pl-4">
                <div className="min-w-0">
                  <p className="truncate text-sm">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <DropzoneRemoveFile
                  variant="ghost"
                  className="shrink-0 hover:outline cursor-pointer"
                >
                  <Trash2Icon className="size-4" />
                </DropzoneRemoveFile>
              </div>
            </DropzoneFileListItem>
          ))}
        </DropzoneFileList>
      </Dropzone>
    </div>
  );
}
