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
      if (error.code === "ERR_NETWORK") {
        toast.error("No internet or server down");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Logging out...");
        logout();
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
    return error.response?.data?.message || error.message || fallback;
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