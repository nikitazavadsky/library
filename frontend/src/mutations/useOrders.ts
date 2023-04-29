import { type BasicError } from "@/schemas/authSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useApproveOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) =>
      axios.post(`orders/${orderId}/approve`).catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          throw Error(err.response?.data.detail);
        } else {
          throw Error("Unexpected error");
        }
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getOrders"] });
    },
  });
}

export function useRejectOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) =>
      axios.post(`orders/${orderId}/reject`).catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          throw Error(err.response?.data.detail);
        } else {
          throw Error("Unexpected error");
        }
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getOrders"] });
    },
  });
}
