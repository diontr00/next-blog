import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { SquarePenIcon, UserRound } from "lucide-react";

export function ProfileDropDown({
  setMenuClose,
}: {
  setMenuClose: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="cursor-pointer">
          <UserRound />
          Profile
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" onClick={setMenuClose}>
        <DropdownMenuItem asChild>
          <Link href="/create-blog">
            <SquarePenIcon />
            New Post
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
