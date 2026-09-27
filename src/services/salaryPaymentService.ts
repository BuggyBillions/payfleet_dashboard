import api from "../helpers/api";
import type {
  SalaryPayment,
  SalaryPaymentFilters,
  SalaryPaymentMonth,
  SalaryPaymentResponse,
  StatusType,
} from "../lib/interfaces";

export type SalaryPaymentStatus = "all" | StatusType;

export interface GetSalaryPaymentsParams {
  company_id?: number | string;
  search?: string;
  status?: SalaryPaymentStatus;
  month?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

const parseStatus = (value: unknown): StatusType => {
  const raw = String(value ?? "").toLowerCase().replace(/[\s_-]/g, "");
  if (["successful", "success", "paid", "completed"].includes(raw)) {
    return "successful";
  }
  if (["failed", "failure", "reversed", "declined"].includes(raw)) {
    return "failed";
  }
  return "pending";
};

const parsePayment = (raw: Record<string, unknown>): SalaryPayment => {
  const employee = raw.employee as SalaryPayment["employee"];

  return {
    id: (raw.id as number | string) ?? "",
    employee_id: (raw.employee_id as number | string) ?? "",
    employee_name: String(raw.employee_name ?? employee?.full_name ?? "—"),
    amount: Number(raw.amount ?? 0),
    payment_date: String(raw.payment_date ?? raw.created_at ?? ""),
    reference: String(raw.reference ?? "—"),
    status: parseStatus(raw.status),
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
    employee,
  };
};

const parseMonth = (raw: Record<string, unknown>): SalaryPaymentMonth => {
  const payments = Array.isArray(raw.payments)
    ? (raw.payments as Record<string, unknown>[]).map(parsePayment)
    : [];

  return {
    month: String(raw.month ?? ""),
    month_key: String(raw.month_key ?? ""),
    count: Number(raw.count ?? payments.length),
    total_amount: Number(raw.total_amount ?? 0),
    successful_amount: Number(raw.successful_amount ?? 0),
    pending_amount: Number(raw.pending_amount ?? 0),
    failed_amount: Number(raw.failed_amount ?? 0),
    payments,
  };
};

/**
 * GET /company-salary-payments
 * Returns salary payouts grouped by month, with pagination over the groups.
 */
export const getCompanySalaryPayments = async (
  params: GetSalaryPaymentsParams = {},
): Promise<SalaryPaymentResponse> => {
  const status = params.status ?? "all";

  const res = await api.get("/company-salary-payments", {
    params: {
      company_id: params.company_id || undefined,
      search: params.search?.trim() || undefined,
      status,
      month: params.month || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
      page: params.page ?? 1,
      per_page: params.per_page ?? 5,
    },
  });

  const body = res.data;
  const payload = body?.data ?? body;
  const groups = Array.isArray(payload)
    ? (payload as Record<string, unknown>[])
    : Array.isArray(payload?.data)
      ? (payload.data as Record<string, unknown>[])
      : [];

  const pagination = body?.pagination ?? {};
  const filters = (body?.filters ?? {}) as Partial<SalaryPaymentFilters>;

  return {
    company: body?.company ?? { id: params.company_id ?? "", name: "" },
    filters: {
      search: filters.search ?? null,
      status: filters.status ?? status,
      month: filters.month ?? null,
      date_from: filters.date_from ?? null,
      date_to: filters.date_to ?? null,
    },
    months: groups.map(parseMonth),
    pagination: {
      current_page: Number(pagination.current_page ?? params.page ?? 1),
      per_page: Number(pagination.per_page ?? params.per_page ?? 5),
      total_groups: Number(pagination.total_groups ?? groups.length),
      last_page: Number(pagination.last_page ?? 1),
      has_more: Boolean(pagination.has_more),
    },
  };
};

/**
 * POST /retry-payroll/{id}
 * Retries a single failed salary payment, authorised by the company's
 * 4-digit transaction PIN. The path id is the payment's own id.
 */
export const retryPayrollPayment = async (
  id: number | string,
  payload: { pin: string; company_id: number | string },
): Promise<{ message?: string }> => {
  const res = await api.post(`/retry-payroll/${id}`, {
    pin: String(payload.pin),
    company_id: payload.company_id,
  });

  return (res.data?.data ?? res.data) as { message?: string };
};
