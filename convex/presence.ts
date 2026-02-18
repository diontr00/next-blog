import { Presence } from "@convex-dev/presence";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

export const presence = new Presence(components.presence);

// notify that i am still in the room
export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user || user._id != userId) {
      throw new ConvexError("Unauthorized");
    }
    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

// list all the user that in a specific room
export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    const entries = await presence.list(ctx, roomToken);
    return await Promise.all(
      entries.map(async (entry) => {
        const user = await authComponent.getAnyUserById(ctx, entry.userId);
        if (!user) {
          return entry;
        }
        return {
          ...entry,
          name: user.name,
          image: `https://avatar.vercel.sh/${user.name}`,
        };
      }),
    );
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  // can't check auth here because its called over http from sendBeacon
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken);
  },
});
