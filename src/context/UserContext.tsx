import { createContext } from "react";
import type { UserProps } from "../lib/interfaces";

export interface UserContextType {
  user: UserProps | null;
  token: string | null;
  role: string | null;
  login: (token: string, user: UserProps, role: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  refreshUser: (token: string) => Promise<void>;
  loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);