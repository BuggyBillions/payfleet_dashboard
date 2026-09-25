import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllDepositsService,
  getDepositStatsService,
  approveDepositService,
  declineDepositService,
  deleteDepositService,
  type DepositStatsResponse,
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
 * Full deposit stats hook for calculating KPI overview metrics (/deposit-stats)
 */
export const useDepositStats = () => {
  return useQuery<DepositStatsResponse>({
    queryKey: ["deposits", "stats"],
    queryFn: () => getDepositStatsService(),
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
 * Decline / Reject deposit mutation hook
 */
export const useDeclineDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      company_id,
      description,
      reason,
    }: {
      id: number | string;
      amount?: number;
      company_id?: number | string;
      description?: string;
      reason?: string;
    }) =>
      declineDepositService(id, {
        amount,
        company_id,
        description: description || reason,
        reason: reason || description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to decline deposit"));
    },
  });
};

export const useRejectDeposit = useDeclineDeposit;

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
