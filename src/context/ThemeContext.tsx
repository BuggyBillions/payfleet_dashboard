import { createContext } from "react";
import type { ThemeContextType } from "../lib/interfaces";

export const ThemeContext = createContext<ThemeContextType | null>(null);