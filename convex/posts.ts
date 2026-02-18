import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { Doc, Id } from "./_generated/dataModel";

export const getAuthorId = query({
  args: {
    id: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await authComponent.getAnyUserById(ctx, args.id);
    return user;
  },
});

export const fetchPost = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .unique();
    if (!post) {
      return;
    }

    return (async () => {
      let thumbnail;
      if (post.thumbnail) {
        thumbnail = await ctx.storage.getUrl(post.thumbnail);
      }
      return { ...post, ...{ thumbnail: thumbnail } };
    })();
  },
});

export const fetchImageURL = query({
  args: { url: v.id("_storage") },
  handler: async (ctx, args) => {
    const imgUrl = await ctx.storage.getUrl(args.url);
    return imgUrl;
  },
});

export const fetchPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        ...(post.thumbnail
          ? {
              thumbnail: await ctx.storage.getUrl(post.thumbnail),
            }
          : {}),
      })),
    );
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.any(),
    thumbnail: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not Authenticated");
    }
    const blogArticle = await ctx.db.insert("posts", {
      title: args.title,
      body: args.body,
      thumbnail: args.thumbnail,
      authorId: user?._id.toString(),
    });
    return blogArticle;
  },
});

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not Authenticated");
    }
    return ctx.storage.generateUploadUrl();
  },
});

export const deleteImage = mutation({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not Authenticated");
    }

    return ctx.storage.delete(args.url as Id<"_storage">);
  },
});

interface searchResultTypes {
  _id: string;
  title: string;
  author: string;
}

export const searchPosts = query({
  args: { term: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    const limit = args.limit;
    const results: Array<searchResultTypes> = [];
    const seen = new Set();

    const pushDocs = async (docs: Array<Doc<"posts">>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue;

        seen.add(doc._id);
        const author = await authComponent.getAnyUserById(ctx, doc.authorId);

        results.push({
          _id: doc._id,
          title: doc.title,
          author: author?.name ?? "",
        });
        if (results.length >= limit) break;
      }
    };
    const titleMatches = await ctx.db
      .query("posts")
      .withSearchIndex("search_posts_tile", (q) => q.search("title", args.term))
      .take(limit);

    await pushDocs(titleMatches);

    if (results.length < limit) {
      let authorId;
      try {
        const user = await authComponent.getAnyUserById(ctx, args.term);
        authorId = user?._id;
      } catch {
        authorId = "";
      }
      if (authorId) {
        const authorMatches = await ctx.db
          .query("posts")
          .withSearchIndex("search_posts_author", (q) =>
            q.search("authorId", authorId),
          )
          .take(limit);

        await pushDocs(authorMatches);
      }
    }

    return results;
  },
});
