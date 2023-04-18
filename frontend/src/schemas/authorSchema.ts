import { z } from "zod";


export const authorSchema = z
  .object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    origin: z.string().optional(),
  })
  .required();

export type Author = z.infer<typeof authorSchema>;
