"use client";

import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { ThemeToggle } from "./themetoggle";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Loader2, MenuIcon, XIcon } from "lucide-react";
import { ProfileDropDown } from "./ProfileDropDown";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { SearchInput } from "./SearchInput";

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isMobile = useIsBreakpoint();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut(
      {},
      {
        onSuccess: () => {
          toast.success("Successfully logged out");
          router.push("/");
        },
        onError: (error) => {
          toast.error(error.error.message);
        },
      },
    );
    setLoading(false);
  };

  const renderLinks = () => (
    <div className="flex flex-col gap-2 md:flex-row md:gap-2">
      <Link
        className={buttonVariants({ variant: "ghost" })}
        href="/"
        onClick={() => setMobileMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        className={buttonVariants({ variant: "ghost" })}
        href="/blogs"
        onClick={() => setMobileMenuOpen(false)}
      >
        Blogs
      </Link>
      <div className="hidden md:block">
        <SearchInput />
      </div>

      {isLoading ? null : isAuthenticated ? (
        <>
          <ProfileDropDown setMenuClose={() => setMobileMenuOpen(false)} />
          <Button
            className={cn(buttonVariants(), "cursor-pointer")}
            disabled={loading}
            onClick={async () => {
              await handleSignOut();
              setMobileMenuOpen(false);
            }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log Out"}
          </Button>
        </>
      ) : (
        <>
          <Link
            className={buttonVariants()}
            href="/auth/sign-in"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/auth/sign-up"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      )}

      <ThemeToggle isMobile />
    </div>
  );

  return (
    <nav className="w-full py-5 flex items-center justify-between relative">
      <Link href="/">
        <h1 className="text-3xl font-bold">
          Next <span className="text-primary">Blog</span>
        </h1>
      </Link>

      {isMobile ? (
        <>
          <button
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col gap-3 z-50">
              {renderLinks()}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">{renderLinks()}</div>
      )}
    </nav>
  );
};
