import { type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthContextType, User } from "../../shared/types/auth";
import { authApi } from "../../endpoints/auth/api";
import { ApiError } from "../../lib/api";
import { Ctx } from "./AuthContext";
const ME_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.me,
    retry: (failCount, err) => !(err instanceof ApiError && err.status === 401) && failCount < 2,
    staleTime: 5 * 60_000,
  });

  const loginMut = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: ({ user }) => qc.setQueryData(ME_KEY, user),
  });

  const logoutMut = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      qc.setQueryData(ME_KEY, null);
      qc.clear(); // drop any cached protected data
    },
  });

  const value: AuthContextType = {
    user: (meQuery.data as User | undefined) ?? null,
    isLoading: meQuery.isLoading,
    login: async (email, password) => { await loginMut.mutateAsync({ email, password }); },
    logout: async () => { await logoutMut.mutateAsync(); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

