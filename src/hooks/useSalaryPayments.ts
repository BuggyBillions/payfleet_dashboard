import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCompanySalaryPayments,
  type GetSalaryPaymentsParams,
  type SalaryPaymentStatus,
} from "../services/salaryPaymentService";

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
