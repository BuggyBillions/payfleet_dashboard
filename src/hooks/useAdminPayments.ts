import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAdminPaymentsService,
  getEachAdminPaymentService,
  type GetAdminPaymentsParams,
} from "../services/adminPaymentService";

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

