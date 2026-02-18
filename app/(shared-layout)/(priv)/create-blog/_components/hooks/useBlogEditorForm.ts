import { BlogMutaionSchema } from "@/app/_schemas/blog";
import { useForm } from "@tanstack/react-form";

export default function useBlogEditorForm(
  onSubmit: (title: string, thumbnail?: File) => Promise<void>,
) {
  const form = useForm({
    defaultValues: {
      title: "",
      body: "",
      thumbnail: undefined as File | undefined,
    },
    // validators: {
    //   onChange: ({ value }) => {
    //     return {
    //       fields: {
    //         title:
    //           value.title.length < 3
    //             ? "Make sure title is more than 3 characters"
    //             : value.title.length > 80
    //               ? "Make sure title is less than 80 characters"
    //               : undefined,
    //         body: !value.body
    //           ? "Please make sure to include post content"
    //           : undefined,
    //         image: !value.image
    //           ? "Please upload an image"
    //           : value.image &&
    //               !z.instanceof(File).safeParse(value.image).success
    //             ? "Please upload a valid image file"
    //             : value.image && !value.image.type.startsWith("image/")
    //               ? "File must be an image"
    //               : value.image && value.image.size > MAX_FILE_SIZE
    //                 ? "Image must be smaller than 5MB"
    //                 : undefined,
    //       },
    //     };
    //   },
    // },
    validators: {
      onChange: BlogMutaionSchema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit(value.title, value.thumbnail);
    },
  });
  return { form };
}
