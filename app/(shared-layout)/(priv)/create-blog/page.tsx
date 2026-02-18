"use client";
import { BlogEditor } from "./_components/BlogEditor";

export default function CreateBlogPage() {
  return (
    <>
      <h1 className="text-center">Create New Blog</h1>
      <h2 className="text-xl text-center text-muted-foreground pt-2">
        Share your thougths with the big world
      </h2>

      <BlogEditor />
    </>
  );
}
