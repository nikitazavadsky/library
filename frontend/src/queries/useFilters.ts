import { Author } from "@/schemas/authorSchema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface PageNumRange {
  min: number,
  max: number
}

export interface Filters {
  authors: Author[]
  num_pages: PageNumRange
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
