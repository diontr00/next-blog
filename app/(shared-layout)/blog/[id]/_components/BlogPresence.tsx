"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import usePresence from "@convex-dev/presence/react";
import FacePile from "@convex-dev/presence/facepile";

interface IAppProps {
  roomId: Id<"posts">;
  userId: string;
}

export function BlogPresence({ roomId, userId }: IAppProps) {
  const presenceState = usePresence(api.presence, roomId, userId);

  if (!presenceState || presenceState.length === 0) {
    return null;
  }
  return (
    <div className="flex items-center gap-2 flex-1">
      <p className="text-sm uppercase tracking-wide w-30 text-muted-foreground">
        Viewing now
      </p>
      <FacePile presenceState={presenceState} />
    </div>
  );
}
