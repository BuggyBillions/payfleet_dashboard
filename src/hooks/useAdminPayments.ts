import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminPaymentsService,
  getEachAdminPaymentService,
  approveAdminPaymentService,
  rejectAdminPaymentService,
  retryAdminPaymentService,
  batchApproveAdminPaymentsService,
  type GetAdminPaymentsParams,
} from "../services/adminPaymentService";
import { getErrorMessage } from "../helpers/api";

export const ADMIN_PAYMENTS_KEYS = ["admin-payments"] as const;

export const useAdminPayments = (params: GetAdminPaymentsParams = {}) =>
  useQuery({
    queryKey: [
      ...ADMIN_PAYMENTS_KEYS,
      params.status ?? "all",
      params.page ?? 1,
      params.per_page ?? 10,
      params.search ?? "",
      params.searchTerm ?? "",
      params.company_id ?? "",
      params.date_from ?? "",
      params.date_to ?? "",
    ],
    queryFn: () => getAdminPaymentsService(params),
    placeholderData: keepPreviousData,
  });

export const useAdminPayment = (id: number | string | null | undefined) =>
  useQuery({
    queryKey: [...ADMIN_PAYMENTS_KEYS, "each", id],
    queryFn: () => getEachAdminPaymentService(id!),
    enabled: Boolean(id),
  });

export const useEachAdminPayment = useAdminPayment;

export const useApproveAdminPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => approveAdminPaymentService(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_KEYS });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      const msg = (res as { message?: string })?.message || "Payment disbursement approved successfully";
      toast.success(msg);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to approve payment disbursement"));
    },
  });
};

export const useRejectAdminPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: number | string;
      reason?: string;
    }) => rejectAdminPaymentService(id, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_KEYS });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      const msg = (res as { message?: string })?.message || "Payment disbursement rejected";
      toast.info(msg);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to reject payment disbursement"));
    },
  });
};

export const useRetryAdminPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => retryAdminPaymentService(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_KEYS });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      const msg = (res as { message?: string })?.message || "Payment re-queried and updated";
      toast.success(msg);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to retry/re-query payment"));
    },
  });
};

export const useBatchApproveAdminPayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: (number | string)[]) => batchApproveAdminPaymentsService(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_KEYS });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Batch disbursements cleared successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to batch approve payments"));
    },
  });
};
