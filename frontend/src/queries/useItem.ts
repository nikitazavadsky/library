import { type Item } from "@/schemas/itemSchema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useItemQuery(
  itemId: string,
  onSuccessFn?: (item: Item) => void
) {
  const getItemQueryFn = (itemId: string) =>
    axios.get<Item>(`books/${itemId}`).then((res) => res.data);

  return useQuery({
    queryKey: ["getItem", itemId],
    queryFn: (ctx) => getItemQueryFn(ctx.queryKey[1] as string),
    onSuccess: (data) => {
      if (onSuccessFn) onSuccessFn(data);
    },
    refetchOnWindowFocus: false,
  });
}
