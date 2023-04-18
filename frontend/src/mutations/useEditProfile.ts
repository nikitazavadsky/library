import { useAuthStore } from "@/stores/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";

// T - passed object to mutation
// K - returned object from request
export default function useEditProfileMutation<T, K>() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (variables: T) =>
      axios.put(`users/${user?.id}`, variables).then((res: AxiosResponse<K>) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getUser"] });
    },
  });
}
