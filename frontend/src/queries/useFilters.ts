import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Filters {
}

export default function useFiltersQuery(
  onSuccessQuery: (filters: Filters) => void
) {
  const getFiltersQueryFn = () =>
    axios.get<Filters>("books/filters").then((res) => res.data);

  return useQuery({
    queryKey: ["getFilters"],
    queryFn: () => getFiltersQueryFn(),
    refetchOnWindowFocus: false,
    onSuccess: (filters) => onSuccessQuery(filters),
  });
}
