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

/**
 * Normalizes a month string (e.g. "September 2026" or "2026-09") into "YYYY-MM" format.
 */
export const normalizeMonthKey = (monthStr: string): string => {
  if (!monthStr) return "";
  const trimmed = monthStr.trim();
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(`${trimmed} 1`);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
  return trimmed;
};

export interface DownloadMonthlyPaymentsParams {
  month: string;
  company_id?: number | string;
}

/**
 * GET /payments/download?month=2026-09
 * Downloads salary payments records for a given month as a CSV/export file.
 */
export const downloadMonthlyPaymentsService = async ({
  month,
  company_id,
}: DownloadMonthlyPaymentsParams): Promise<void> => {
  const cleanMonth = normalizeMonthKey(month);

  const res = await api.get("/payments/download", {
    params: {
      month: cleanMonth,
      company_id: company_id || undefined,
    },
    responseType: "blob",
  });

  // Handle case where backend returns JSON (e.g. { download_url: "..." } or error object)
  if (res.data instanceof Blob && res.data.type?.includes("application/json")) {
    const text = await res.data.text();
    try {
      const json = JSON.parse(text);
      const url =
        json.download_url ||
        json.url ||
        json.data?.url ||
        json.data?.download_url;
      if (url) {
        window.open(url, "_blank");
        return;
      }
      if (json.message) {
        throw new Error(json.message);
      }
      if (json.error) {
        throw new Error(json.error);
      }
    } catch (err) {
      if (err instanceof Error && err.message) throw err;
    }
  }

  // Determine file name from Content-Disposition or fallback
  const contentDisposition =
    res.headers["content-disposition"] || res.headers["Content-Disposition"];
  let filename = `payments-${cleanMonth}.csv`;

  if (contentDisposition) {
    const utf8Match = contentDisposition.match(
      /filename\*=UTF-8''([^;\r\n]*)/i,
    );
    if (utf8Match && utf8Match[1]) {
      filename = decodeURIComponent(utf8Match[1]);
    } else {
      const regularMatch = contentDisposition.match(
        /filename=["']?([^;"'\r\n]+)["']?/i,
      );
      if (regularMatch && regularMatch[1]) {
        filename = regularMatch[1].trim();
      }
    }
  }

  // Trigger browser download via object URL
  const blob = new Blob([res.data], {
    type:
      res.headers["content-type"] ||
      res.data.type ||
      "application/octet-stream",
  });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
};
