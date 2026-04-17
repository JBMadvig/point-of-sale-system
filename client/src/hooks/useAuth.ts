import { useContext } from "react";
import { Ctx } from "../providers/auth/AuthContext";

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
