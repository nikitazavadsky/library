import { USER_ROLE } from "@/constants/roles";
import { type ProfileEditSchema } from "@/schemas/profileSchema";
import { useAuthStore } from "@/stores/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";

// T - passed object to mutation
// K - returned object from request
export default function useEditProfileMutation<
  T extends ProfileEditSchema,
  K
>() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation<K, Error, T>({
    mutationFn: (variables: T) =>
      axios
        .put(`users/${String(user?.id)}`, variables)
        .then((res: AxiosResponse<K>) => res.data),
    onSuccess: (_data: K, variables: T) => {
      void queryClient.invalidateQueries({ queryKey: ["getUser"] });
      if (user)
        setUser(
          {
            ...variables,
            id: user?.id,
          },
          user?.role ?? USER_ROLE
        );
    },
  });
}
