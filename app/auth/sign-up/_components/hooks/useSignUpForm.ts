import { signUpSchema } from "@/app/_schemas/auth";
import { AllowRedirect } from "@/app/auth/_shared/common";
import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function useSignUpForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const redirect = AllowRedirect.safeParse(redirectParam).success
    ? redirectParam!
    : "/";

  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onChangeAsync: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            toast.success("New user have been created!");
            form.reset();
            router.push(redirect);
          },
          onError: (error) => {
            toast.error(
              error.error.message ?? "Sign Up Failed , Please Try Again",
            );
          },
        },
      );
    },
  });

  return { form };
}
