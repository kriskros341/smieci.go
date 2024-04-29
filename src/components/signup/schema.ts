import * as z from "zod";

export const schema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" }),
    emailAddress: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
