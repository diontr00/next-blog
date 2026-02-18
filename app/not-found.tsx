"use client";
import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-1 ring-border shadow-sm">
          <span className="text-xs font-bold text-primary">404</span>
        </div>
      </div>

      <div className="max-w-[420px] space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn’t find the page you’re looking for. It might have
          been moved or deleted.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="default" size="lg" className="h-11 px-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-11 px-8"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>

      <div className="absolute -z-10 h-full w-full overflow-hidden opacity-10">
        <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[10%] bottom-[20%] h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </div>
    </div>
  );
}
