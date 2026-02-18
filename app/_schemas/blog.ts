import z from "zod";

export const BlogMutaionSchema = z.object({
  title: z
    .string()
    .min(30, "Make sure your title is more than 30 characters")
    .max(80, "Make sure your title is less than 80 characters"),
  body: z.string().min(100, "Your Blog need to be more than 100 chacracters"),
  thumbnail: z.instanceof(File).or(z.undefined()),
});
