import { z } from "zod";

export const profileEditSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Email must be valid"),
});

export type ProfileEditSchema = z.infer<typeof profileEditSchema>;
