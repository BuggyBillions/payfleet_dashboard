import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompaniesService,
  deleteCompanyService,
  verifyCompanyService,
  type GetCompaniesParams,
  type CompanyListResponse,
} from "../services/companyService";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";

export const useCompanies = ({
  page = 1,
  searchTerm = "",
  per_page = 10,
  status = "all",
}: GetCompaniesParams = {}) => {
  return useQuery<CompanyListResponse>({
    queryKey: ["companies", page, searchTerm, per_page, status],
    queryFn: () => getCompaniesService({ page, searchTerm, per_page, status }),
    placeholderData: (prev) => prev,
  });
};

export const useCompanyStats = () => {
  return useQuery<CompanyListResponse>({
    queryKey: ["companies", "stats"],
    queryFn: () => getCompaniesService({ page: 1, per_page: 1000 }),
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