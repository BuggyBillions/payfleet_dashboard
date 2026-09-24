import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import api, { setupInterceptors } from "../helpers/api";
import axios from "axios";
import type { UserProps } from "../lib/interfaces";
import { UserContext } from "./UserContext";

interface userProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: userProviderProps) => {
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
    if (!token) throw new Error("No token");
    try {
      const response = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = response.data;
      setUser(data);
      setRole(data?.role);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", data?.role);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
      }
      throw err;
    }
  }, [logout]);

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
        await refreshUser(storedToken);
        setIsAuthenticated(true);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};