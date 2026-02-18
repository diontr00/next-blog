import z from "zod";

export const CommentSchema = z.object({
  body: z.string().min(1, "Your comment is empty"),
});
