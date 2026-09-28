import { useQuery } from "@tanstack/react-query";
import {
  getAdminStatsService,
  type AdminStatsResponse,
} from "../services/adminStatsService";

/**
 * Hook to fetch platform-wide administrative statistics
 * GET /admin-stats
 */
export const useAdminStats = () => {
  return useQuery<AdminStatsResponse>({
    queryKey: ["admin", "stats"],
    queryFn: () => getAdminStatsService(),
    staleTime: 30000,
    refetchInterval: 30000,
    placeholderData: (prev) => prev,
  });
};
