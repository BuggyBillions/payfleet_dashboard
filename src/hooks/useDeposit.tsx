import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllDepositsService,
  approveDepositService,
  rejectDepositService,
  deleteDepositService,
} from "../services/depositService";
import type { GetDepositsParams, DepositListResponse } from "../lib/interfaces";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";

/**
 * Main paginated & filtered deposits hook (/all-deposit?search=...)
 */
export const useDeposits = ({
  page = 1,
  per_page = 10,
  searchTerm = "",
  search = "",
  status = "all",
}: GetDepositsParams = {}) => {
  return useQuery<DepositListResponse>({
    queryKey: ["deposits", page, per_page, searchTerm, search, status],
    queryFn: () =>
      getAllDepositsService({ page, per_page, searchTerm, search, status }),
    placeholderData: (prev) => prev,
  });
};

/**
 * Full deposit stats hook for calculating KPI overview metrics
 */
export const useDepositStats = () => {
  return useQuery<DepositListResponse>({
    queryKey: ["deposits", "stats"],
    queryFn: () => getAllDepositsService({ page: 1, per_page: 1000 }),
    placeholderData: (prev) => prev,
  });
};

/**
 * Approve deposit mutation hook
 */
export const useApproveDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => approveDepositService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve deposit"));
    },
  });
};

/**
 * Reject deposit mutation hook
 */
export const useRejectDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason?: string }) =>
      rejectDepositService(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reject deposit"));
    },
  });
};

/**
 * Delete deposit mutation hook
 */
export const useDeleteDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteDepositService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      toast.success("Deposit record removed successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete deposit"));
    },
  });
};
