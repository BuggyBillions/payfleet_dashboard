import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompaniesService,
  getCompanyStatsService,
  getMyCompanyStatsService,
  getCompanyActivityLogsService,
  deleteCompanyService,
  verifyCompanyService,
  type GetCompaniesParams,
  type GetCompanyActivityLogsParams,
  type CompanyListResponse,
  type CompanyStatsResponse,
  type MyCompanyStatsResponse,
  type CompanyActivityLogListResponse,
} from "../services/companyService";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";

export const useCompanies = ({
  page = 1,
  searchTerm = "",
  per_page = 10,
  status = "all",
  enabled = true,
}: GetCompaniesParams & { enabled?: boolean } = {}) => {
  return useQuery<CompanyListResponse>({
    queryKey: ["companies", page, searchTerm, per_page, status],
    queryFn: () => getCompaniesService({ page, searchTerm, per_page, status }),
    placeholderData: (prev) => prev,
    enabled,
  });
};

/**
 * Full company stats hook for calculating KPI overview metrics (/company-stats)
 */
export const useCompanyStats = () => {
  return useQuery<CompanyStatsResponse>({
    queryKey: ["companies", "stats"],
    queryFn: () => getCompanyStatsService(),
    placeholderData: (prev) => prev,
  });
};

/**
 * Company-scoped KPI stats for the logged-in company (GET /my-company-stats)
 */
export const useMyCompanyStats = () => {
  return useQuery<MyCompanyStatsResponse>({
    queryKey: ["my-company-stats"],
    queryFn: () => getMyCompanyStatsService(),
    placeholderData: (prev) => prev,
  });
};

/**
 * Paginated company activity log (GET /company-activity-logs)
 */
export const useCompanyActivityLogs = (
  params: GetCompanyActivityLogsParams = {},
  enabled = true,
) => {
  return useQuery<CompanyActivityLogListResponse>({
    queryKey: [
      "company-activity-logs",
      params.page,
      params.per_page,
      params.search,
      params.company_id,
    ],
    queryFn: () => getCompanyActivityLogsService(params),
    enabled,
    placeholderData: (prev) => prev,
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteCompanyService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete company"));
    },
  });
};

export const useVerifyCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: number | string;
      status: string;
      rejectionReason?: string;
    }) => verifyCompanyService({ id, status, rejectionReason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      if (variables.status === "verified") {
        toast.success("Business verification approved successfully!");
      } else {
        toast.info("Verification feedback submitted successfully.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update verification status"));
    },
  });
};

export const useCompany = (searchTerm = "", per_page = 10) => {
  const queryClient = useQueryClient();
  const query = useQuery<CompanyListResponse>({
    queryKey: ["companies", 1, searchTerm, per_page],
    queryFn: () => getCompaniesService({ page: 1, searchTerm, per_page }),
  });

  return {
    getAllCompanies: query,
    queryClient,
  };
};