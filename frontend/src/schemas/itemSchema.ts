import { z } from "zod";
import { authorSchema } from "./authorSchema";

export const itemSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    isbn: z.string(),
    num_pages: z.number(),
    authors:  z.array(authorSchema),
  })
  .required();

export const itemMutateSchema = itemSchema
  .omit({
    id: true
  });

export type Item = z.infer<typeof itemSchema>;
export type ItemFields = Omit<Item, "id">;
export type ItemMutateSchema = z.infer<typeof itemMutateSchema>;
