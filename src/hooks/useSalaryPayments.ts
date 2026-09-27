import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCompanySalaryPayments,
  retryPayrollPayment,
  type GetSalaryPaymentsParams,
  type SalaryPaymentStatus,
} from "../services/salaryPaymentService";
import { getErrorMessage } from "../helpers/api";

export const useSalaryPayments = (params: GetSalaryPaymentsParams) =>
  useQuery({
    queryKey: [
      "salary-payments",
      params.company_id,
      params.search,
      params.status,
      params.month,
      params.date_from,
      params.date_to,
      params.page,
      params.per_page,
    ],
    queryFn: () => getCompanySalaryPayments(params),
    enabled: Boolean(params.company_id),
    placeholderData: keepPreviousData,
  });

export type { SalaryPaymentStatus };

/**
 * POST /retry-payroll/{id}
 */
export const useRetryPayrollPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      id: number | string;
      pin: string;
      company_id: number | string;
    }) => retryPayrollPayment(payload.id, { pin: payload.pin, company_id: payload.company_id }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(res?.message || "Payment retry submitted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to retry payment"));
    },
  });
};
