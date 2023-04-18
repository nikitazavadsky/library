import { type BasicError } from "@/schemas/authSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useMoveOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) =>
      axios.post(`orders/${orderId}/move-status`).catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          throw Error(err.response?.data.message);
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
      axios.delete(`orders/${orderId}`).catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          throw Error(err.response?.data.message);
        } else {
          throw Error("Unexpected error");
        }
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getOrders"] });
    },
  });
}