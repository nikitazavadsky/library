import { type ORDER_STATUS_MAP } from "@/constants/orderStatusMap";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface OrdersData {
  id: number;
  firstName: string;
  lastName: string;
  status: keyof typeof ORDER_STATUS_MAP;
  userId: string;
  total: number;
  createdAt: string;
}

export function useOrdersQuery() {
  const getAllOrdersQueryFn = () =>
    axios
      .get<{ data: OrdersData[]; nextCursor: number }>("orders")
      .then((res) => res.data);

  return useQuery({
    queryKey: ["getOrders"],
    queryFn: () => getAllOrdersQueryFn(),
    refetchOnWindowFocus: false,
  });
}

export function useMyOrdersQuery() {
  const userId = useAuthStore((state) => state.user?.id)
  const getMyOrdersQueryFn = () =>
    axios
      .get<{ data: OrdersData[]; nextCursor: number }>(`user/${userId}/orders`)
      .then((res) => res.data);

  return useQuery({
    queryKey: ["getMyOrders"],
    queryFn: () => getMyOrdersQueryFn(),
    refetchOnWindowFocus: false,
  });
}