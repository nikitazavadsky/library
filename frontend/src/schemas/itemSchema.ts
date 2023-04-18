import { z } from "zod";
import { authorSchema } from "./authorSchema";

export const itemSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    isbn: z.string(),
    numPages: z.number(),
    authors:  z.array(authorSchema),
  })
  .required();

export const itemMutateSchema = itemSchema
  .omit({
    id: true
  });

export type Item = z.infer<typeof itemSchema>;
export type ItemMutateSchema = z.infer<typeof itemMutateSchema>;
