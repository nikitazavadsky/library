import { z } from "zod";

export type BasicError = {
  detail: string;
};

export const signInSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(1, "Must not be empty"),
});

export type SignInFields = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    email: z.string().email("Email must be valid"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords must match",
    path: ["repeatPassword"],
  });

export type SignUpFields = z.infer<typeof signUpSchema>;
