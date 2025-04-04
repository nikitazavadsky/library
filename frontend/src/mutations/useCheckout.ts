import { type BasicError } from "@/schemas/authSchema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useCheckoutMutation(handleSuccess: () => void) {
  const checkoutQueryFn = (checkoutData: number[]) =>
    axios
      .post(`orders`, checkoutData)
      .then((res) => res.data as string)
      .catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          console.log(err);
          throw Error(err.response?.data?.detail);
        } else {
          throw Error("Unexpected error");
        }
      });

  return useMutation<string, Error, number[]>({
    mutationFn: (checkoutData) => checkoutQueryFn(checkoutData),
    onSuccess: () => {
      handleSuccess();
    },
  });
}
