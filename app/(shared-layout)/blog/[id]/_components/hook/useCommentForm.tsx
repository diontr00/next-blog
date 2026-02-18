import { CommentSchema } from "@/app/_schemas/comments";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export default function useCommentForm(id: Id<"posts">) {
  const createComment = useMutation(api.comments.createComment);

  const form = useForm({
    defaultValues: {
      body: "",
    },
    validators: {
      onChange: CommentSchema,
    },
    onSubmit: async (data) => {
      await new Promise(() =>
        toast.promise(
          async () => {
            await createComment({
              body: data.value.body,
              postId: id,
            });
            form.reset();
          },
          {
            loading: "Uploading comment",
            success: "Comment have been uploaded",
            error: "Unable to upload comment!",
          },
        ),
      );
    },
  });
  return { form };
}
