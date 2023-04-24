import { type Item } from "@/schemas/itemSchema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useItemsQuery() {
  const getItemQueryFn = () =>
    axios
      .get<Item[]>("books/")
      .then((res) => res.data);

  return useQuery({
    queryKey: ["getItems"],
    queryFn: () => getItemQueryFn(),
    refetchOnWindowFocus: false,
  });
}

export function useUnavailableItemsQuery() {
  const getItemQueryFn = () =>
    axios
      .get<Item[]>("books/?availability=false")
      .then((res) => res.data);

  return useQuery({
    queryKey: ["getUnavailableItems"],
    queryFn: () => getItemQueryFn(),
    refetchOnWindowFocus: false,
  });
}

export function useApplyFiltersQuery(params?: URLSearchParams) {
  const getApplyFiltersQueryFn = () =>
    axios
      .get<Item[]>("books/", {
        params,
      })
      .then((res) => res.data);

  return useQuery({
    queryKey: ["getApplyFilters", params?.toString()],
    queryFn: () => getApplyFiltersQueryFn(),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
}
