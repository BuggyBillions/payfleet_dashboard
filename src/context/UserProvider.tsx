import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { setupInterceptors } from "../helpers/api";
import type { UserProps, UserProviderProps } from "../lib/interfaces";
import { UserContext } from "./UserContext";
import { getUserService } from "../services/authService";

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async (token: string) => {
    if (!token) return;
    try {
      const data = await getUserService();
      if (data) {
        setUser(data);
        if (data.role) {
          setRole(data.role);
          localStorage.setItem("role", data.role);
        }
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch {
      // Keep session intact based on stored credentials
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setRole(parsedUser?.role);
        setIsAuthenticated(true);
        refreshUser(storedToken).catch(() => undefined);
      } catch {
        logout();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [refreshUser, logout]);

  const login = (token: string, userData: UserProps, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    setRole(role);
    setIsAuthenticated(true);
  };

  const saveVerificationToken = (token: string) => {
    localStorage.setItem("verification_token", JSON.stringify(token))
  }

  const getVerificationToken = () => {
    const V_TOKEN = localStorage.getItem("verification_token") ?? "";
    return JSON.parse(V_TOKEN);
  }

  useEffect(() => {
    setupInterceptors(logout);
  }, [logout]);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        role,
        login,
        logout,
        isLoggedIn: isAuthenticated,
        refreshUser,
        loading,
        saveVerificationToken,
        getVerificationToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};