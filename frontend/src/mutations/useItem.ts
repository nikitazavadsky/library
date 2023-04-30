import { type BasicError } from "@/schemas/authSchema";
import {
  type ItemTransformSchema,
  type Item,
  type ItemFields,
} from "@/schemas/itemSchema";
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

export function useEditItemMutation(itemId: string) {
  const queryClient = useQueryClient();

  const editItemQueryFn = (item: ItemTransformSchema) =>
    axios.put(`books/${itemId}`, item).catch((err) => {
      if (axios.isAxiosError<BasicError>(err)) {
        throw Error(err.response?.data.detail);
      } else {
        throw Error("Unexpected error");
      }
    });

  return useMutation<unknown, Error, ItemTransformSchema>({
    mutationFn: (item) => editItemQueryFn(item),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getItem"] });
    },
  });
}

export function useDeleteItemMutation(itemId: string) {
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

export function useReturnItemMutation(itemId: string) {
  const queryClient = useQueryClient();

  const returnBookQueryFn = () =>
    axios.post(`books/${itemId}/return`).catch((err) => {
      if (axios.isAxiosError<BasicError>(err)) {
        throw Error(err.response?.data.detail);
      } else {
        throw Error("Unexpected error");
      }
    });

  return useMutation<unknown, Error>({
    mutationFn: () => returnBookQueryFn(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getUnavailableItems"] });
    },
  });
}
