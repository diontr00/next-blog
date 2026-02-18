"use client";

import { useConvexAuth } from "convex/react";
import { redirect, RedirectType, usePathname } from "next/navigation";
import { useEffect } from "react";
import Checking from "../../auth/_components/checking";
import { AllowRedirect } from "@/app/auth/_shared/common";

export default function PrivLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const current = usePathname();

  const redirectPath = AllowRedirect.safeParse(current).success ? current : "/";

  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams({ redirect: redirectPath });

    if (!isAuthenticated) {
      redirect(`/auth/sign-in?${params.toString()}`, RedirectType.replace);
    }
  }, [isLoading, isAuthenticated, redirectPath]);

  if (isLoading || !isAuthenticated) {
    return <Checking />;
  }

  return <>{children}</>;
}
