import axios from "axios";
import { toast } from "sonner";
import type { SearchResult } from "../lib/interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json"
  }
});

export const setupInterceptors = (logout: () => void) => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      const url = error.config?.url || "";
      const isAuthEndpoint =
        url.includes("/login") ||
        url.includes("/register") ||
        url.includes("/verify-otp") ||
        url.includes("/resend-otp") ||
        url.includes("/forgotpassword") ||
        url.includes("/forgot-password") ||
        url.includes("/reset-password");

      const isNonCriticalEndpoint =
        url.includes("/company-notifications") ||
        url.includes("/support/unread-count") ||
        url.includes("/unread-count") ||
        url.includes("/search");

      if (error.code === "ERR_NETWORK") {
        toast.error("No internet or server down");
      } else if (
        error.response?.status === 401 &&
        !isAuthEndpoint &&
        !isNonCriticalEndpoint
      ) {
        // Only log out if token is actually rejected on core requests
        const token = localStorage.getItem("token");
        if (!token) {
          logout();
        } else {
          // Check if error message explicitly indicates unauthenticated session
          const msg = String(error.response?.data?.message || "").toLowerCase();
          if (
            msg.includes("unauthenticated") ||
            msg.includes("token expired") ||
            msg.includes("invalid token")
          ) {
            toast.error("Session expired. Please log in again.");
            logout();
          }
        }
      }
      return Promise.reject(error);
    }
  );
};


export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (data.errors && typeof data.errors === "object") {
        const errorValues = Object.values(data.errors).flat();
        if (errorValues.length > 0 && typeof errorValues[0] === "string") {
          return errorValues[0];
        }
      }
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
    }
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}


export const searchApi = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  try {
    const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data.results || res.data;
  } catch (err) {
    console.warn("Search not available, using dummy");
    console.error("Error on search", err)
    const dummy: SearchResult[] = [
      { title: "Manage Invoices", url: "/dashboard/sales/invoices", snippet: "View all invoices" },
      { title: "Create Receipt", url: "/dashboard/sales/receipts/new", snippet: "Generate new receipt" },
      { title: "Properties", url: "/dashboard/properties", snippet: "Manage estate properties" },
    ];
    await new Promise(r => setTimeout(r, 300));
    return dummy.filter(i => i.title.toLowerCase().includes(query.toLowerCase()));
  }
};

export default api;