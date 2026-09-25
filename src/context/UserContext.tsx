import { createContext } from "react";
import type { UserContextType } from "../lib/interfaces";

export type { UserContextType };

export const UserContext = createContext<UserContextType | undefined>(undefined);