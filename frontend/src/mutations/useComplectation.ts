// Add and remove complectation mutations of react-query

import { type ItemComplectation } from "@/schemas/itemSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAddComplectation = (itemId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (complectation: Omit<ItemComplectation, "id">) =>
      axios.post(`items/${itemId}/complectation`, complectation),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getItem"] });
    },
    onError: () => {
      console.error("Error adding complectation");
    },
  });
};

export const useRemoveComplectation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (complectationId: number) =>
      axios.delete(`complectations/${complectationId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getItem"] });
    },
    onError: () => {
      console.error("Error removing complectation");
    },
  });
};
