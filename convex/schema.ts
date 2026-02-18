import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    body: v.string(),
    authorId: v.string(),
    thumbnail: v.optional(v.id("_storage")),
  })
    .index("by_author", ["authorId"])
    .searchIndex("search_posts_tile", {
      searchField: "title",
    })
    .searchIndex("search_posts_author", {
      searchField: "authorId",
    }),

  comments: defineTable({
    postId: v.id("posts"),
    authorName: v.string(),
    authorId: v.string(),
    body: v.string(),
  }),
});
