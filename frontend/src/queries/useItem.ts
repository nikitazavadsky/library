import { type Item } from "@/schemas/itemSchema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useItemQuery(itemId: string) {
  const getItemQueryFn = (itemId: string) =>
    axios.get<Item>(`books/${itemId}`).then((res) => res.data);

  return useQuery({
    queryKey: ["getItem", itemId],
    queryFn: (ctx) => getItemQueryFn(ctx.queryKey[1] as string),
    refetchOnWindowFocus: false,
  });
}