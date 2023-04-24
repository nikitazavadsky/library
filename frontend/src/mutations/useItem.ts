import { type BasicError } from "@/schemas/authSchema";
import { type Item, type ItemFields } from "@/schemas/itemSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";

export function useCreateItemMutation() {
  const router = useRouter();

  const createItemQueryFn = (item: ItemFields) =>
    axios
      .post("items", item)
      .then((res) => res.data as Item)
      .catch((err) => {
        if (axios.isAxiosError<BasicError>(err)) {
          throw Error(err.response?.data.detail);
        } else {
          throw Error("Unexpected error");
        }
      });

  return useMutation<Item, Error, ItemFields>({
    mutationFn: (item) => createItemQueryFn(item),
    onSuccess: (createdItem) => {
      void router.push(`/item/${createdItem.id}`);
    },
  });
}

export function useEditItemMutation(itemId: number) {
  const queryClient = useQueryClient();

  const editItemQueryFn = (item: ItemFields) =>
    axios.put(`books/${itemId}`, item).catch((err) => {
      if (axios.isAxiosError<BasicError>(err)) {
        throw Error(err.response?.data.detail);
      } else {
        throw Error("Unexpected error");
      }
    });

  return useMutation<unknown, Error, ItemFields>({
    mutationFn: (item) => editItemQueryFn(item),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getItem"] });
    },
  });
}

export function useDeleteItemMutation(itemId: number) {
  const router = useRouter();

  const deleteItemQueryFn = () =>
    axios.delete(`items/${itemId}`).catch((err) => {
      if (axios.isAxiosError<BasicError>(err)) {
        throw Error(err.response?.data.detail);
      } else {
        throw Error("Unexpected error");
      }
    });

  return useMutation<unknown, Error>({
    mutationFn: () => deleteItemQueryFn(),
    onSuccess: async () => {
      await router.push("/home");
    },
  });
}
