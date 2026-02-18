import z from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(3, "name should be between 3 to 30 character")
    .max(30, "name should be between 3 to 30 character"),
  email: z.email("please enter a valid email"),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .max(30, "password must be at most 30 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/,
      "Password must include uppercase, lowercase, number, and special character",
    ),
});

export const signInSchema = z.object({
  email: z.email("please enter a valid email"),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .max(30, "password must be at most 30 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/,
      "Password must include uppercase, lowercase, number, and special character",
    ),
});
