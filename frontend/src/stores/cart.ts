import { env } from "@/env.mjs";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type Author = {
  id: number;
  first_name: string;
  last_name: string;
  origin: string;
};

type CartItem = {
  id: number;
  title: string;
  isbn: number;
  num_pages: number;
  authors: Author[];
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
};

const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        addItem: (item) =>
        set((state) => {
          const itemExists = state.items.some((existingItem) => existingItem.id === item.id);
          if (itemExists) {
            return state;
          } else {
            return { items: state.items.concat({ ...item }) };
          }
        }),

        removeItem: (itemId) =>
          set((state) => ({
            items: state.items.filter((item) => item.id !== itemId),
          })),

        clearCart: () => set({ items: [] }),
      }),
      {
        name: "cart",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { enabled: env.NEXT_PUBLIC_CLIENT_MODE === "development" }
  )
);

export default useCartStore;
