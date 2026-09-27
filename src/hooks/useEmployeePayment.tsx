import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  payEmployees,
  paySingleEmployee,
  markMultiplePaying,
} from "../services/employeeService";
import { getErrorMessage } from "../helpers/api";

const EMPLOYEE_KEYS = ["employees"] as const;

const refreshEmployees = (queryClient: ReturnType<typeof useQueryClient>) => {
  EMPLOYEE_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
};

/**
 * Pay every included employee of the company, authorised by the transaction PIN.
 * POST /pay-employee { pin, company_id }
 */
export const usePayEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { pin: string; company_id: number | string }) =>
      payEmployees(payload),
    onSuccess: (res) => {
      refreshEmployees(queryClient);
      const message = (res as { message?: string } | undefined)?.message;
      toast.success(message || "Employee payments processed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to process payments"));
    },
  });
};

/**
 * Toggle a single employee's payout inclusion.
 * PUT /single-paying/{id}
 */
export const usePaySingleEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => paySingleEmployee(id),
    onSuccess: () => {
      refreshEmployees(queryClient);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update employee payout"));
    },
  });
};

/**
 * Mark a batch of employees as included (1) or excluded (0) for payout.
 * PUT /multiple-paying { ids, paying }
 */
export const useMarkMultiplePaying = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { ids: Array<number | string>; paying: number }) =>
      markMultiplePaying(payload),
    onSuccess: (_res, variables) => {
      refreshEmployees(queryClient);
      const label = variables.paying ? "included in" : "excluded from";
      toast.success(
        `${variables.ids.length} employee${variables.ids.length === 1 ? "" : "s"} ${label} the next payout`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update employee payouts"));
    },
  });
};
