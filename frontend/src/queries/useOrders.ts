import { type ORDER_STATUS_MAP } from "@/constants/orderStatusMap";
import { type Item } from "@/schemas/itemSchema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface OrdersData {
  id: number;
  status: keyof typeof ORDER_STATUS_MAP;
  first_name: string;
  last_name: string;
  createdAt: string;
  requested_books: Omit<Item, "authors">[];
}

export function useOrdersQuery() {
  const getAllOrdersQueryFn = () =>
    axios.get<OrdersData[]>("orders").then((res) => res);

  return useQuery({
    queryKey: ["getOrders"],
    queryFn: () => getAllOrdersQueryFn(),
    refetchOnWindowFocus: false,
  });
}

export function useMyOrdersQuery() {
  const getMyOrdersQueryFn = () =>
    axios
      .get<{ data: OrdersData[]; nextCursor: number }>(`orders/`)
      .then((res) => res.data);

  return useQuery({
    queryKey: ["getMyOrders"],
    queryFn: () => getMyOrdersQueryFn(),
    refetchOnWindowFocus: false,
  });
}
