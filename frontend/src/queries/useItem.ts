import { type Item } from "@/schemas/itemSchema";
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";

type DataType = Item;

type CustomQueryOptions = UseQueryOptions<DataType> & {
  initialData?: undefined;
};

export default function useItemQuery(
  options: CustomQueryOptions
): UseQueryResult<DataType> {
  const getItemQueryFn = (itemId: string) =>
    axios.get<DataType>(`books/${itemId}`).then((res) => res.data);

  // TODO: Might need to raise an issue with @tanstack/react-query
  return useQuery<DataType, Error, DataType>({
    queryFn: (ctx) => getItemQueryFn(ctx.queryKey[1] as string),
    ...options,
  });
}
