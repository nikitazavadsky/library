import { type BasicError } from "@/schemas/authSchema";
import { type PreparedCart } from "@/schemas/cartSchema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useCheckoutMutation(handleSuccess: () => void) {
  const checkoutQueryFn = (checkoutData: PreparedCart) =>
    axios
      .post(`orders`, checkoutData)
      .then((res) => res.data as string)
      .catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          throw Error(err.response?.data.message);
        } else {
          throw Error("Unexpected error");
        }
      });

  return useMutation<string, Error, PreparedCart>({
    mutationFn: (checkoutData) => checkoutQueryFn(checkoutData),
    onSuccess: () => {
      handleSuccess();
    },
  });
}
