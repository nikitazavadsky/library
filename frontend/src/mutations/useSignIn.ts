import { USER_ROLE } from "@/constants/roles";
import { type BasicError, type SignInFields } from "@/schemas/authSchema";
import { useAuthStore, type User } from "@/stores/auth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useSignInMutation(handleSuccess: () => void) {
  const { signOut, setUser } = useAuthStore();

  const fetchUserRole = async () => {
    try {
      const response = await axios.get<{ msg: "ADMIN" | "USER" }>(
        "/users/role"
      );
      return response.data.msg;
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const signInQueryFn = (signInData: SignInFields) =>
    axios
      .post<Omit<User, "role">>(`signin`, signInData)
      .then(async (res) => {
        const role = (await fetchUserRole()) || USER_ROLE;
        setUser(res.data, role);
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
