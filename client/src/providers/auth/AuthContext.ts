import { createContext } from "react";
import type { AuthContextType } from "../../shared/types/auth";

export const Ctx = createContext<AuthContextType | null>(null);
