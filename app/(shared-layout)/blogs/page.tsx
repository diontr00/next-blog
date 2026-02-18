import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

// export const dynamic = "force-static";
// export const revalidate = 30;
// flase | 0 | number
// "auto" | "force-dynamic" | "error" | "force-static"

export const metadata: Metadata = {
  title: "Blogs | Next Blog",
  description: "Read our latest articles and insight",
  category: "Web development",
  authors: [{ name: "Dion Trinh" }],
};

export default function BlogPage() {
  // by using fetchQuery , there is no way to create a connection between client and convex (limited
  // live update)
  // that's where fetchQueryReload
  // and pass the reloading  to child with usePreloadQuery
  // the usePreloadQuery will internally create a web socket connection
  // const blogs = await fetchQuery(api.posts.fetchPosts);

  return (
    <div className="py-12">
      <div className="text-center pb-12">
        <h1>Any Blog</h1>
        <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto py-2">
          Insights, thoughts , and trends from anyone
        </h2>
      </div>

      <Suspense fallback={<SkeletonLoadingUi />}>
        <LoadBlogList />
      </Suspense>
    </div>
  );
}

async function LoadBlogList() {
  // await connection(); // this is the runtime api , that mean we generate this at runtime
  "use cache"; // this is at build , cache level
  // by default revalidate by 15 mins
  // timebase revalidation
  cacheLife("hours"); // every
  cacheTag("blogs");
  const blogs = await fetchQuery(api.posts.fetchPosts);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <Card key={blog._id} className="justify-between pt-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={`${blog.thumbnail || "https://images.unsplash.com/photo-1713374645804-6963b35da2f9?q=80&w=691&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}`}
              alt="img"
              className="rounded-lg"
              fill
            />
          </div>
          <CardContent className="flex-1">
            <Link href={`/blog/${blog._id}`}>
              <h1 className="text-2xl font-bold hover:text-primary line-clamp-2">
                {blog.title}
              </h1>
              <p className="text-muted-foreground line-clamp-3">
                {blog.body.replace(/<[^>]*>/g, " ")}
              </p>
            </Link>
          </CardContent>
          <CardFooter>
            <Link href={`/blog/${blog._id}`} className="w-full">
              <Button className="w-full cursor-pointer" variant="outline">
                Read More
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function SkeletonLoadingUi() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div className="flex flex-col space-y-3" key={i}>
          <Skeleton className=" h-48 w-full rounded-xl" />
          <div className="space-y-2 flex-col">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
