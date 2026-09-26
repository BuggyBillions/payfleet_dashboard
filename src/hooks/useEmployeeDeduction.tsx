import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deductSalary,
  getEmployeeDeductions,
  type DeductSalaryPayload,
  type GetEmployeeDeductionsParams,
} from "../services/employeeService";
import { getErrorMessage } from "../helpers/api";
import type { EmployeeDeductionListResponse } from "../lib/interfaces";

/**
 * Hook to fetch all salary deductions recorded for a company
 * GET /company-employee-deduction?company_id=...&page=...
 */
export const useEmployeeDeductions = (
  params: GetEmployeeDeductionsParams = {},
  enabled = true,
) => {
  return useQuery<EmployeeDeductionListResponse>({
    queryKey: [
      "employee-deductions",
      params.company_id,
      params.search,
      params.employee_id,
      params.page,
      params.per_page,
    ],
    queryFn: () => getEmployeeDeductions(params),
    enabled,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook to record a salary deduction against an employee
 * POST /deduct-salary
 */
export const useDeductSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeductSalaryPayload) => deductSalary(payload),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee-deductions"] });
      toast.success(
        `Deduction of ₦${Number(
          variables.amount,
        ).toLocaleString("en-NG")} recorded`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to record deduction"));
    },
  });
};
