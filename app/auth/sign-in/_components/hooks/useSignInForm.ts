import { signInSchema } from "@/app/_schemas/auth";
import { AllowRedirect } from "@/app/auth/_shared/common";
import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function useSignInForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const redirect = AllowRedirect.safeParse(redirectParam).success
    ? redirectParam!
    : "/";

  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            toast.success("Successfully login");
            form.reset();
            router.push(redirect);
          },
          onError: (error) => {
            toast.error(error?.error?.message ?? "Login failed");
          },
        },
      );
    },
  });

  return { form };
}
