import { z } from "zod";
import { authorSchema } from "./authorSchema";

export const itemSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    isbn: z.string(),
    num_pages: z.number(),
    image_url: z.string(),
    authors: z.array(authorSchema),
    description: z.string(),
  })
  .required();

export const itemMutateSchema = itemSchema
  .omit({
    id: true,
  })
  .extend({ authors: z.array(z.string()) });

export const transformItemSchema = itemMutateSchema.transform((data) => ({
  ...data,
  authors: data.authors.map(Number),
}));

export type Item = z.infer<typeof itemSchema>;
export type ItemFields = Omit<Item, "id">;
export type ItemMutateSchema = z.infer<typeof itemMutateSchema>;
export type ItemTransformSchema = z.infer<typeof transformItemSchema>;
