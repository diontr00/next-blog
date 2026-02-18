"use server";
import z from "zod";
import { BlogMutaionSchema } from "@/app/_schemas/blog";
import { getToken } from "@/lib/auth-server";

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { updateTag } from "next/cache";

export async function uploadBlogImageAction(
  file: File,
  abortController?: AbortController,
) {
  const token = await getToken();
  if (!token) {
    throw new Error(`Unauthorize to upload ${file.name}`);
  }

  return fetchMutation(api.posts.generateImageUploadUrl, {}, { token }).then(
    async (uploadUrl) => {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
        signal: abortController?.signal,
      });
      if (!res.ok) throw new Error("Upload failed");

      const { storageId } = await res.json();
      const imgUrl = await fetchQuery(api.posts.fetchImageURL, {
        url: storageId,
      });

      return { imgUrl, storageId };
    },
  );
}

export async function removeBlogImageAction(id: Id<"_storage">) {
  const token = await getToken();
  if (!token) {
    throw new Error(`Unauthorize`);
  }
  return fetchMutation(api.posts.deleteImage, { url: id }, { token });
}

export async function fetchBlogAction(id: Id<"posts">) {
  try {
    const post = await fetchQuery(api.posts.fetchPost, { id });
    if (!post) {
      throw notFound();
    }
    return post;
  } catch {
    throw notFound();
  }
}

export async function createBlogAction(
  values: z.infer<typeof BlogMutaionSchema>,
) {
  console.log(3);
  const parsed = BlogMutaionSchema.safeParse(values);
  if (!parsed.success) {
    throw new Error(`Invalid Data Format`);
  }

  const token = await getToken();
  if (!token) {
    throw new Error(`Unauthorized`);
  }

  console.log(4);
  try {
    let storageId;
    if (parsed.data.thumbnail) {
      const imgURl = await fetchMutation(
        api.posts.generateImageUploadUrl,
        {},
        { token },
      );

      if (!imgURl) return { error: "Failed to get upload URL" };

      const uploadImgResult = await fetch(imgURl, {
        method: "POST",
        headers: {
          "Content-Type": parsed.data.thumbnail?.type || "",
        },
        body: parsed.data.thumbnail,
      });

      if (!uploadImgResult.ok) {
        return {
          error: "Failed to upload image",
        };
      }

      const data = await uploadImgResult.json();
      storageId = data.storageId;
    }

    await fetchMutation(
      api.posts.createPost,
      {
        body: parsed.data.body,
        title: parsed.data.title,
        thumbnail: storageId,
      },
      { token: token },
    );

    // reliavidatePath("/blogs") --> if we force the blogs route to be static , this help tp trigger blogs route revalidation
    updateTag("blogs");
  } catch {
    return {
      error: "Failed to create post",
    };
  }
}
