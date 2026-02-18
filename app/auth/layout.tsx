"use client";

import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { buttonVariants } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import Checking from "./_components/checking";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <Checking />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-5 left-5">
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          <ArrowLeftIcon className="size-4" />
          Go Back
        </Link>
      </div>
      <div className="w-full mx-auto max-w-md">{children}</div>
    </div>
  );
}
