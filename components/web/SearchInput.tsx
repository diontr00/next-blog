import { Link2, Loader2, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Separator } from "../ui/separator";

export function SearchInput() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const results = useQuery(
    api.posts.searchPosts,
    term.length >= 2 ? { limit: 5, term: term } : "skip",
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTerm(e.target.value);
    setOpen(true);
  }

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={term}
          onChange={handleInputChange}
          type="search"
          placeholder="Search Posts..."
          className="w-full bg-background pl-8"
        />
      </div>
      {open && term.length >= 2 && (
        <div className="absolute top-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 p-2 z-10">
          {results === undefined ? (
            <div>
              <Loader2> Searching...</Loader2>
            </div>
          ) : results?.length === 0 ? (
            <p className="px-4">No results found!</p>
          ) : (
            <div className=" flex flex-col gap-2">
              {results?.map((post) => (
                <Link
                  href={`/blog/${post._id}`}
                  key={post._id}
                  className="flex flex-col px-4 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setOpen(false);
                    setTerm("");
                  }}
                >
                  <>
                    <p className="font-medium truncate"> {post.title}</p>
                    {post.author && (
                      <p className="text-muted-foreground">By {post.author}</p>
                    )}
                  </>
                  <Separator />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
