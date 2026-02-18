import { fetchBlogAction } from "@/app/api/posts/post";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import CommentSection from "./_components/CommentSection";
import { Metadata } from "next";
import { BlogPresence } from "./_components/BlogPresence";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "sonner";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const blog = await fetchBlogAction(id as Id<"posts">);
  const user = await fetchQuery(api.posts.getAuthorId, {
    // @ts-expect-error: better auth table missing id
    id: blog.authorId as Id<"user">,
  });

  if (!blog) {
    return {
      title: "Not Found",
    };
  }
  return {
    title: blog.title,
    description: `${blog.title} by ${user?.name}`,
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SkeletonLoadingUi />}>
      <LoadBlog params={params} />
    </Suspense>
  );
}

async function LoadBlog({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(id);

  const [blog, preLoadComment] = await Promise.all([
    await fetchBlogAction(id as Id<"posts">),
    await preloadQuery(api.comments.getCommentsByPostId, {
      postId: id as Id<"posts">,
    }).catch((e) => toast.error("Could fetch blog")),
  ]);
  const user = await fetchQuery(api.posts.getAuthorId, {
    // @ts-expect-error: better auth table missing id
    id: blog.authorId as Id<"user">,
  });

  return (
    <div className="w-full min-h-screen space-y-6 md:space-y-10 my-5 md:my-10 animate-in  fade-in duration-500 relative">
      <Link className={buttonVariants({ variant: "ghost" })} href="/blogs">
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <div className="relative h-64 w-full ">
        <Image
          src={
            blog.thumbnail ??
            "https://images.unsplash.com/photo-1713374645804-6963b35da2f9?q=80&w=691&auto=format&fit=crop"
          }
          alt="img"
          className="rounded-lg object-cover hover:scale-105 duration-500 transition"
          fill
        />
      </div>

      <h1>{blog.title}</h1>
      <div>
        <div className="text-sm text-muted-foreground flex flex-row gap-3 items-center">
          <p>
            {" "}
            Posted on :{" "}
            {new Date(blog._creationTime).toLocaleDateString("de-US")}
          </p>
          {user?._id && <BlogPresence roomId={blog._id} userId={user?._id} />}
        </div>

        <p>By {user?.name}</p>
      </div>

      <Separator className="my-8" />
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.body) }}
      />
      <Separator className="my-8" />
      <CommentSection
        preloadedComments={preLoadComment}
        id={id as Id<"posts">}
      />
    </div>
  );
}

function SkeletonLoadingUi() {
  return (
    <div className="my-5 md:my-10">
      <div className="md:space-y-10 space-y-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
