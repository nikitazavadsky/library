import { z } from "zod";


export const authorSchema = z
  .object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    origin: z.string().optional(),
  })
  .required();

export type Author = z.infer<typeof authorSchema>;
