import { FAKE_ROLE } from "@/constants/roles";
import { useAuthStore, type User } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UserResponse = Omit<User, "id" | "role">;

export function useUserQuery(userId?: number) {
  const user = useAuthStore((state) => state.user);
  const getUserQueryFn = (userId: number) =>
    axios.get<UserResponse>(`users/${userId}`);

  return useQuery({
    queryKey: ["getUser", userId],
    queryFn: (ctx) => getUserQueryFn(ctx.queryKey[1] as number),
    enabled: user?.role != FAKE_ROLE,
    refetchOnWindowFocus: false,
  });
}

export function useAllUsersQuery() {
  const getAllUsersQueryFn = () =>
    axios
      .get<{ data: Omit<User, "role">[]; nextCursor: number }>(`users`)
      .then((res) => res.data);

  return useQuery({
    queryKey: ["getAllUsers"],
    queryFn: () => getAllUsersQueryFn(),
    refetchOnWindowFocus: false,
  });
}
