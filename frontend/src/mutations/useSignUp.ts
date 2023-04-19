import { type BasicError, type SignUpFields } from "@/schemas/authSchema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useSignUpMutation(handleSuccess: () => void) {
  const signUpQueryFn = (signUpData: SignUpFields) =>
    axios
      .post<{ user_id: number }>(`auth/signup`, {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        email: signUpData.email,
        password: signUpData.password,
      })
      .catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          throw Error(err.response?.data.message);
        } else {
          throw Error("Unexpected error");
        }
      });

  // TODO: Add return type that is not unknown
  return useMutation<unknown, Error, SignUpFields>({
    mutationFn: (user) => signUpQueryFn(user),
    onSuccess: () => {
      handleSuccess();
    },
  });
}
