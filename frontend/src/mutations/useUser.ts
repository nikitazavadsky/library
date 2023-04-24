import { type BasicError } from "@/schemas/authSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function useBlockUserMutation(handleSuccess: () => void) {
  const queryClient = useQueryClient();
  const blockUserQueryFn = (userId: number) =>
    axios.delete(`users/${userId}`).catch((err) => {
      if (axios.isAxiosError<BasicError>(err)) {
        throw Error(err.response?.data.detail);
      } else {
        throw Error("Unexpected error");
      }
    });

  return useMutation<unknown, Error, number>({
    mutationFn: (userId) => blockUserQueryFn(userId),
    onSuccess: () => {
      handleSuccess();
      void queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
    },
  });
}
