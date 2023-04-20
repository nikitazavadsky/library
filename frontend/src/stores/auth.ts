import {
  ADMIN_ROLE,
  type USER_ROLE,
  FAKE_ROLE,
  LIBRARIAN_ROLE,
} from "@/constants/roles";
import { env } from "@/env.mjs";
import router from "next/router";
import { create, type StoreApi } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

export type PossibleRoles =
  | typeof ADMIN_ROLE
  | typeof USER_ROLE
  | typeof FAKE_ROLE
  | typeof LIBRARIAN_ROLE;
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: PossibleRoles;
}

type UserWithoutRole = Omit<User, "role">;

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: UserWithoutRole, role: PossibleRoles) => void;
  signOut: () => void;
  isAdmin: () => boolean;
}

const resetAuthState = (setState: StoreApi<AuthStore>["setState"]) => {
  setState({ isAuthenticated: false, user: null });
};

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        user: null,
        token: null,
        setUser: (userInfo, role) =>
          set({
            user: {
              ...userInfo,
              role,
            },
            isAuthenticated: true,
          }),
        signOut: () => {
          localStorage.removeItem("access_token");
          void router.push("/home");
          resetAuthState(set);
        },
        isAdmin: () => {
          if (get().user) {
            return (
              get().user?.role === ADMIN_ROLE ||
              get().user?.role === FAKE_ROLE ||
              get().user?.role === LIBRARIAN_ROLE
            );
          } else {
            return false;
          }
        },
      }),
      {
        name: "auth",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { enabled: env.NEXT_PUBLIC_CLIENT_MODE === "development" }
  )
);

interface FakeAuthStore {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useFakeAuthStore = create<FakeAuthStore>(() => ({
  setIsAuthenticated: (isAuthenticated: boolean) => {
    useAuthStore.setState({ isAuthenticated });
    useAuthStore.setState({
      user: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@gmail.com",
        role: FAKE_ROLE,
      },
    });
    if (!isAuthenticated) {
      resetAuthState(useAuthStore.setState);
    }
  },
}));

export { useAuthStore, useFakeAuthStore };
