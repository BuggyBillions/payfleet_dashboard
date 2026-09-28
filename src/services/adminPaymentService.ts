import api from "../helpers/api";
import type {
  PaymentCategory,
  ExtendedPaymentStatus,
  CompanyPaymentItem,
} from "../lib/interfaces";

export type { PaymentCategory, ExtendedPaymentStatus, CompanyPaymentItem };

export interface GetAdminPaymentsParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  searchTerm?: string;
  company_id?: number | string;
  date_from?: string;
  date_to?: string;
}

export interface AdminPaymentsListResponse {
  items: CompanyPaymentItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalDisbursed: number;
  successfulCount: number;
  pendingCount: number;
  pendingAmount: number;
  failedCount: number;
  failedAmount: number;
  raw?: Record<string, unknown>;
}

const normalizeStatus = (rawStatus: unknown): ExtendedPaymentStatus => {
  const str = String(rawStatus ?? "").toLowerCase().trim();
  if (
    str.includes("success") ||
    str === "paid" ||
    str === "completed" ||
    str === "1" ||
    str === "approved" ||
    str === "settled"
  ) {
    return "successful";
  }
  if (
    str.includes("fail") ||
    str.includes("reject") ||
    str === "declined" ||
    str === "0"
  ) {
    return "failed";
  }
  if (str === "cancelled" || str === "canceled" || str === "reversed") {
    return "cancelled";
  }
  if (str === "processing" || str === "in_progress") {
    return "processing";
  }
  return "pending";
};

interface RawAdminPaymentItem {
  id?: string | number;
  reference?: string;
  reference_no?: string;
  transaction_reference?: string;
  trans_ref?: string;
  trx_ref?: string;
  ref?: string;
  batch_id?: string;
  batchId?: string;
  batch_no?: string;
  batch?: string;
  company_id?: string | number;
  company_name?: string;
  companyName?: string;
  company?: { id?: string | number; name?: string; email?: string; company_name?: string } | string;
  company_email?: string;
  companyEmail?: string;
  employee_id?: string | number;
  employee_name?: string;
  employeeName?: string;
  beneficiary_name?: string;
  account_name?: string;
  accountName?: string;
  employee?: {
    id?: string | number;
    name?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    job_title?: string;
    role?: string;
    department?: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };
  employee_email?: string;
  employeeEmail?: string;
  employee_role?: string;
  employeeRole?: string;
  job_title?: string;
  department?: string;
  bank_name?: string;
  bankName?: string;
  bank?: string;
  account_number?: string;
  accountNumber?: string;
  amount?: number | string;
  net_amount?: number | string;
  estimate_pay?: number | string;
  fee?: number | string;
  netAmount?: number | string;
  payment_type?: string;
  paymentType?: string;
  category?: string;
  type?: string;
  status?: string | number | boolean;
  payment_status?: string | number | boolean;
  date?: string;
  created_at?: string;
  payment_date?: string;
  updated_at?: string;
  narration?: string;
  description?: string;
  approved_by?: string;
  approvedBy?: string;
  approved_at?: string;
  approvedAt?: string;
  gateway_ref?: string;
  gatewayRef?: string;
  rejection_reason?: string;
  rejectionReason?: string;
  reason?: string;
  transaction?: {
    id?: string | number;
    reference?: string;
    amount?: number | string;
    fee?: number | string;
    status?: string | number | boolean;
    created_at?: string;
    description?: string;
    gateway_ref?: string;
  };
}

export const parsePaymentItem = (item: RawAdminPaymentItem): CompanyPaymentItem => {
  const comp = typeof item.company === "object" && item.company !== null ? item.company : {};
  const emp = typeof item.employee === "object" && item.employee !== null ? item.employee : {};
  const txn = typeof item.transaction === "object" && item.transaction !== null ? item.transaction : {};

  const companyName = String(
    comp.name ||
    comp.company_name ||
    item.company_name ||
    item.companyName ||
    (typeof item.company === "string" ? item.company : "") ||
    "Payfleet Client"
  );

  const companyEmail = String(
    comp.email ||
    item.company_email ||
    item.companyEmail ||
    "—"
  );

  const employeeName = String(
    emp.name ||
    emp.full_name ||
    (emp.first_name ? `${emp.first_name} ${emp.last_name || ""}`.trim() : "") ||
    item.employee_name ||
    item.employeeName ||
    item.beneficiary_name ||
    item.account_name ||
    "Employee Beneficiary"
  );

  const employeeEmail = String(
    emp.email ||
    item.employee_email ||
    item.employeeEmail ||
    "—"
  );

  const employeeRole = String(
    emp.job_title ||
    emp.role ||
    item.employee_role ||
    item.employeeRole ||
    item.job_title ||
    "Staff"
  );

  const department = String(
    emp.department ||
    item.department ||
    "Operations"
  );

  const bankName = String(
    emp.bank_name ||
    item.bank_name ||
    item.bankName ||
    item.bank ||
    "Commercial Bank"
  );

  const accountNumber = String(
    emp.account_number ||
    item.account_number ||
    item.accountNumber ||
    "—"
  );

  const accountName = String(
    emp.account_name ||
    item.account_name ||
    item.accountName ||
    employeeName
  );

  const rawAmount =
    item.amount ??
    txn.amount ??
    item.net_amount ??
    item.estimate_pay ??
    0;
  const amount = Number(rawAmount) || 0;

  const rawFee = item.fee ?? txn.fee ?? 0;
  const fee = Number(rawFee) || 0;

  const rawNetAmount = item.net_amount ?? item.netAmount ?? amount;
  const netAmount = Number(rawNetAmount) || amount;

  const rawCategory =
    item.payment_type ||
    item.paymentType ||
    item.category ||
    item.type ||
    "Salary";
  let paymentType: PaymentCategory = "Salary";
  const catLower = String(rawCategory).toLowerCase();
  if (catLower.includes("bonus")) paymentType = "Bonus";
  else if (catLower.includes("allowance")) paymentType = "Allowance";
  else if (catLower.includes("reimburse")) paymentType = "Reimbursement";
  else if (catLower.includes("commission")) paymentType = "Commission";

  const status = normalizeStatus(
    item.status ?? txn.status ?? item.payment_status
  );

  const reference = String(
    item.reference ||
    txn.reference ||
    item.reference_no ||
    item.transaction_reference ||
    item.trans_ref ||
    item.trx_ref ||
    item.ref ||
    (item.id ? `PF-PAY-${String(item.id).padStart(6, "0")}` : "—")
  );

  const batchId = String(
    item.batch_id ||
    item.batchId ||
    item.batch_no ||
    item.batch ||
    `BATCH-${reference.slice(-6)}`
  );

  const date = String(
    item.date ||
    item.created_at ||
    txn.created_at ||
    item.payment_date ||
    item.updated_at ||
    new Date().toISOString()
  );

  const narration = String(
    item.narration ||
    item.description ||
    txn.description ||
    `${paymentType} Disbursal`
  );

  const approvedBy =
    item.approved_by ||
    item.approvedBy ||
    (status === "successful" ? "Finance Clearance Desk" : undefined);

  const approvedAt =
    item.approved_at ||
    item.approvedAt ||
    (status === "successful" ? date : undefined);

  const gatewayRef = String(
    item.gateway_ref ||
    item.gatewayRef ||
    txn.gateway_ref ||
    reference
  );

  const rejectionReason =
    item.rejection_reason ||
    item.rejectionReason ||
    item.reason ||
    undefined;

  return {
    id: item.id || txn.id || reference,
    reference,
    batchId,
    companyId: Number(item.company_id || comp.id || 0),
    companyName,
    companyEmail,
    employeeName,
    employeeEmail,
    employeeRole,
    department,
    bankName,
    accountNumber,
    accountName,
    amount,
    fee,
    netAmount,
    paymentType,
    status,
    date,
    narration,
    approvedBy,
    approvedAt,
    gatewayRef,
    rejectionReason,
  };
};

/**
 * Fetch Admin Payments from GET /admin-payment
 * Supports ?status=pending or any other status, page, per_page, search query
 */
export const getAdminPaymentsService = async ({
  page = 1,
  per_page = 10,
  status = "all",
  search = "",
  searchTerm = "",
  company_id,
  date_from,
  date_to,
}: GetAdminPaymentsParams = {}): Promise<AdminPaymentsListResponse> => {
  const querySearch = (searchTerm || search || "").trim();

  const params: Record<string, unknown> = {
    page,
    per_page,
  };

  if (status && status !== "all") {
    params.status = status;
  }
  if (querySearch) {
    params.search = querySearch;
  }
  if (company_id) {
    params.company_id = company_id;
  }
  if (date_from) {
    params.date_from = date_from;
  }
  if (date_to) {
    params.date_to = date_to;
  }

  const response = await api.get("/admin-payment", { params });
  const resData = response.data;

  const rawList = Array.isArray(resData?.data)
    ? resData.data
    : resData?.data?.data ||
      resData?.data?.payments ||
      resData?.payments ||
      resData?.items ||
      (Array.isArray(resData) ? resData : []);

  const items: CompanyPaymentItem[] = Array.isArray(rawList)
    ? rawList.map(parsePaymentItem)
    : [];

  let totalItems = items.length;
  let currentPage = page;
  let totalPages = Math.max(1, Math.ceil(totalItems / per_page));

  if (resData?.pagination) {
    totalItems = Number(resData.pagination.total ?? totalItems);
    totalPages = Number(resData.pagination.last_page ?? totalPages);
    currentPage = Number(resData.pagination.current_page ?? currentPage);
  } else if (resData?.data?.total !== undefined) {
    totalItems = Number(resData.data.total);
    totalPages = Number(resData.data.last_page ?? totalPages);
    currentPage = Number(resData.data.current_page ?? currentPage);
  }

  // Calculate live stats
  const successfulItems = items.filter((p) => p.status === "successful");
  const totalDisbursed = successfulItems.reduce((sum, p) => sum + p.amount, 0);
  const successfulCount = successfulItems.length;

  const pendingItems = items.filter(
    (p) => p.status === "pending" || p.status === "processing"
  );
  const pendingCount = pendingItems.length;
  const pendingAmount = pendingItems.reduce((sum, p) => sum + p.amount, 0);

  const failedItems = items.filter(
    (p) => p.status === "failed" || p.status === "cancelled"
  );
  const failedCount = failedItems.length;
  const failedAmount = failedItems.reduce((sum, p) => sum + p.amount, 0);

  return {
    items,
    totalItems,
    currentPage,
    totalPages,
    perPage: per_page,
    totalDisbursed,
    successfulCount,
    pendingCount,
    pendingAmount,
    failedCount,
    failedAmount,
    raw: resData,
  };
};

/**
 * Fetch a single payment disbursement by ID
 * GET /each-payment/{id}
 */
export const getEachAdminPaymentService = async (
  id: number | string
): Promise<CompanyPaymentItem> => {
  const response = await api.get(`/each-payment/${id}`);
  const resData = response.data;
  const rawItem =
    resData?.data?.payment ||
    resData?.data?.data ||
    resData?.data ||
    resData?.payment ||
    resData;
  return parsePaymentItem(rawItem);
};

/**
 * Kept for backward compatibility if imported elsewhere
 */
export const getInitialCompanyPayments = (): CompanyPaymentItem[] => [];
