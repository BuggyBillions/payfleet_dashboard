import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPaymentSettings,
  createPaymentSettings,
  updatePaymentSettings,
  type PaymentSettings,
  type PaymentSettingsPayload,
} from "../services/paymentSettingsService";
import { getErrorMessage } from "../helpers/api";

export const PAYMENT_SETTINGS_QUERY_KEY = ["payment-settings"] as const;

/**
 * Fetch current payment settings.
 * GET /payment-settings
 */
export const usePaymentSettings = (options?: { enabled?: boolean }) => {
  return useQuery<PaymentSettings | null>({
    queryKey: PAYMENT_SETTINGS_QUERY_KEY,
    queryFn: getPaymentSettings,
    staleTime: 1000 * 60 * 5, // 5 mins
    enabled: options?.enabled ?? true,
  });
};

/**
 * Create payment settings.
 * POST /payment-settings
 */
export const useCreatePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentSettingsPayload) => createPaymentSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PAYMENT_SETTINGS_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: PAYMENT_SETTINGS_QUERY_KEY });
      toast.success("Payment fee settings created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create payment fee settings"));
    },
  });
};

/**
 * Update payment settings.
 * PUT /payment-settings
 */
export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentSettingsPayload) => updatePaymentSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PAYMENT_SETTINGS_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: PAYMENT_SETTINGS_QUERY_KEY });
      toast.success("Payment fee settings updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update payment fee settings"));
    },
  });
};
