import { createContext } from "react";
import type { WebSocketContextType } from "../../shared/types/websocket";

export const Ctx = createContext<WebSocketContextType | null>(null);
