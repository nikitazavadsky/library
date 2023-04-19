import { USER_ROLE } from "@/constants/roles";
import { type BasicError, type SignInFields } from "@/schemas/authSchema";
import { type PossibleRoles, useAuthStore, type User } from "@/stores/auth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useSignInMutation(handleSuccess: () => void) {
  const { signOut, setUser } = useAuthStore();

  const fetchUserRole = async () => {
    try {
      const response = await axios.get<
        Omit<User, "id" | "role"> & { role?: PossibleRoles }
      >("/users/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const signInQueryFn = (signInData: SignInFields) =>
    axios
      .post<{ refresh: string; access: string }>(`auth/login`, signInData)
      .then(async (res) => {
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
        const user = await fetchUserRole();
        if (user) {
          setUser(user, user?.role ?? USER_ROLE);
        }
      })
      .catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          signOut();
          throw Error(err.response?.data.message);
        } else {
          throw Error("Unexpected error");
        }
      });

  return useMutation<void, Error, SignInFields>({
    mutationFn: (user) => signInQueryFn(user),
    onSuccess: () => {
      handleSuccess();
    },
  });
}
