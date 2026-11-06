import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import {
  downloadMonthlyPaymentsService,
  normalizeMonthKey,
  type DownloadMonthlyPaymentsParams,
} from "../services/salaryPaymentService";
import { getErrorMessage } from "../helpers/api";

export interface UseDownloadMonthlyPaymentsOptions {
  company_id?: number | string;
}

/**
 * Reusable hook to download salary payment records for a given month.
 * Calls GET /payments/download?month=YYYY-MM
 */
export const useDownloadMonthlyPayments = (
  options?: UseDownloadMonthlyPaymentsOptions,
) => {
  const [downloadingMonth, setDownloadingMonth] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      month,
      company_id,
    }: DownloadMonthlyPaymentsParams) => {
      const normalized = normalizeMonthKey(month);
      setDownloadingMonth(normalized);
      return downloadMonthlyPaymentsService({
        month: normalized,
        company_id: company_id ?? options?.company_id,
      });
    },
    onSuccess: (_, variables) => {
      const label = variables.month;
      toast.success(`Payments export for ${label} downloaded successfully.`);
    },
    onError: async (error, variables) => {
      let msg = getErrorMessage(
        error,
        `Failed to download payments for ${variables.month}`,
      );

      // Handle Blob error response from axios
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json?.message) msg = json.message;
          else if (json?.error) msg = json.error;
        } catch {
          // Keep default message
        }
      }

      toast.error(msg);
    },
    onSettled: () => {
      setDownloadingMonth(null);
    },
  });

  const downloadMonth = (
    month: string,
    company_id?: number | string,
  ) => {
    return mutation.mutate({
      month,
      company_id: company_id ?? options?.company_id,
    });
  };

  const downloadMonthAsync = (
    month: string,
    company_id?: number | string,
  ) => {
    return mutation.mutateAsync({
      month,
      company_id: company_id ?? options?.company_id,
    });
  };

  return {
    downloadMonth,
    downloadMonthAsync,
    downloadingMonth,
    isDownloading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

// Alias export for flexibility
export const useDownloadPayments = useDownloadMonthlyPayments;
export default useDownloadMonthlyPayments;
