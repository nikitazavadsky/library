import { z } from "zod";

export type BasicError = {
  message: string;
};

export const signInSchema = z.object({
  phone: z.string(),
  email: z.string().email("Email must be valid"),
  password: z.string().min(1, "Must not be empty"),
});

export const signInSchemaWithPhone = signInSchema.omit({ email: true });
export type SignInFieldsWithPhone = z.infer<typeof signInSchemaWithPhone>;
export const signInSchemaWithEmail = signInSchema.omit({ phone: true });
export type SignInFieldsWithEmail = z.infer<typeof signInSchemaWithEmail>;
export type SignInFields = SignInFieldsWithEmail | Record<string, never>;

export const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
    email: z.string().email("Email must be valid"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords must match",
    path: ["repeatPassword"],
  });

export type SignUpFields = z.infer<typeof signUpSchema> | Record<string, never>;
