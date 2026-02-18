import { uploadBlogImageAction } from "@/app/api/posts/post";
import { useState } from "react";

export interface ImageState {
  file: File;
  url: string;
  tempUrl: string;
  storageId?: string;
  // status: "uploading" | "done" | "error";
}

export function useUploadImg() {
  const [uploadedImages, setUploadedImages] = useState<Map<string, ImageState>>(
    new Map(),
  );

  const startUploading = async (
    file: File,
    tempUrl: string,

    abortController?: AbortController,
  ) => {
    const id = crypto.randomUUID();

    // // set imgage to uploading state
    // setUploadedImages((prev) => {
    //   const copy = new Map(prev);
    //   copy.set(id, {
    //     file,
    //     tempUrl: tempUrl,
    //     status: "uploading",
    //   });
    //   return copy; });

    try {
      const { imgUrl, storageId } = await uploadBlogImageAction(
        file,
        abortController,
      );

      if (!imgUrl) {
        throw new Error(`Couldn't upload image : ${file.name} `);
      }

      setUploadedImages((prev) => {
        const copy = new Map(prev);

        copy.set(id, {
          file,
          tempUrl: tempUrl,
          url: imgUrl,
          // status: "done",
          storageId,
        });
        return copy;
      });
    } catch (err) {
      setUploadedImages((prev) => {
        const copy = new Map(prev);
        prev.delete(id);
        return copy;
      });
      throw err;
    }

    // return imgUrl;

    //   setUploadedImages((prev) => {
    //     const copy = new Map(prev);
    //     const prevImg = copy.get(id);
    //     if (prevImg) copy.set(id, { ...prevImg, status: "error" });
    //     return copy;
    //   });
    //
    //   throw e;
    // }
  };

  return { uploadedImages, setUploadedImages, startUploading };
}
