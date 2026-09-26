import api from "../helpers/api";
import type {
  DepositItemProps,
  DepositListResponse,
  GetDepositsParams,
} from "../lib/interfaces";

export interface CompanyFundingPayload {
  company_id: number | string;
  amount: number;
}

export interface CompanyFundingResponse {
  reference?: string;
  reference_no?: string;
  transaction_reference?: string;
  ref?: string;
  id?: number | string;
  amount?: number;
  checkout_amount?: number;
  status?: string | boolean;
  message?: string;
  data?: {
    id?: number | string;
    company_id?: number | string;
    reference?: string;
    amount?: number;
    status?: string;
    previous_balance?: string;
    current_balance?: string;
    type?: string;
    transaction_type?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const companyFunding = async (
  payload: CompanyFundingPayload,
): Promise<CompanyFundingResponse> => {
  const res = await api.post("/company-funding", payload);
  const raw = res.data;
  const dataObj =
    raw?.data && typeof raw.data === "object" && !Array.isArray(raw.data)
      ? (raw.data as Record<string, unknown>)
      : {};
  return {
    ...dataObj,
    ...raw,
    data: dataObj,
    checkout_amount: raw?.checkout_amount ?? dataObj?.checkout_amount ?? raw?.amount ?? payload.amount,
  } as CompanyFundingResponse;
};

export interface BankAccount {
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  [key: string]: unknown;
}

export const getAccount = async (
  company_id?: number | string,
): Promise<BankAccount> => {
  const res = await api.get("/get-account", {
    params: company_id ? { company_id } : undefined,
  });
  return (res.data?.data ?? res.data ?? {}) as BankAccount;
};

export interface CompanyDeposit {
  id?: number | string;
  company_id?: number | string;
  company_name?: string;
  email?: string;
  reference?: string;
  reference_no?: string;
  transaction_reference?: string;
  ref?: string;
  amount?: number | string;
  fee?: number | string;
  method?: string;
  status?: string | number | boolean;
  date?: string;
  created_at?: string;
  settled_at?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  transaction?: {
    id?: number | string;
    company_id?: number | string;
    reference?: string;
    amount?: number | string;
    previous_balance?: number | string;
    current_balance?: number | string;
    type?: string;
    transaction_type?: string;
    status?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
  company?: {
    id?: number | string;
    name?: string;
    email?: string;
    phone?: string;
    balance?: number | string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const getCompanyDeposits = async (
  companyId?: number | string,
): Promise<CompanyDeposit[]> => {
  const res = await api.get("/company-deposit", {
    params: companyId ? { company_id: companyId } : undefined,
  });
  let data = res.data?.data ?? res.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const { data: inner, deposits, transactions, items, results } = data as {
      data?: unknown;
      deposits?: unknown;
      transactions?: unknown;
      items?: unknown;
      results?: unknown;
    };
    data = inner ?? deposits ?? transactions ?? items ?? results ?? [];
  }
  return (Array.isArray(data) ? data : []) as CompanyDeposit[];
};

export const getEachCompanyDeposit = async (
  id: number | string,
): Promise<Partial<CompanyDeposit>> => {
  const res = await api.get(`/each-company-deposit/${id}`);
  let data = res.data?.data ?? res.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const inner = data as { data?: unknown };
    if (inner.data && typeof inner.data === "object" && !Array.isArray(inner.data)) {
      data = inner.data;
    }
  }
  return (data ?? {}) as Partial<CompanyDeposit>;
};

/**
 * List all deposits: GET /all-deposit?search=...
 * Supports ?search=pending | ?search=successfull | ?search=failed or custom query
 */
export const getAllDepositsService = async ({
  page = 1,
  per_page = 10,
  search = "",
  searchTerm = "",
  status = "all",
}: GetDepositsParams = {}): Promise<DepositListResponse> => {
  // Determine effective search parameter
  let querySearch = (searchTerm || search || "").trim();

  // If no text search is entered and a status filter is selected, map status to ?search=
  if (!querySearch && status && status !== "all") {
    const s = status.toLowerCase();
    if (s.includes("success")) {
      querySearch = "successfull"; // Backend specifies ?search=successfull
    } else if (s.includes("pend")) {
      querySearch = "pending";
    } else if (s.includes("fail")) {
      querySearch = "failed";
    } else {
      querySearch = status;
    }
  }

  const params: Record<string, unknown> = {
    page,
    per_page,
    search: querySearch || undefined,
  };

  const response = await api.get("/all-deposit", { params });
  const resData = response.data;

  const rawList =
    resData?.data?.data ||
    resData?.data ||
    resData?.deposits ||
    resData?.items ||
    (Array.isArray(resData) ? resData : []);

  const items: DepositItemProps[] = Array.isArray(rawList)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? rawList.map((item: Record<string, any>) => {
        const txn = item.transaction || {};
        const comp = item.company || {};

        const rawStatus = String(
          txn.status ||
          item.status ||
          item.payment_status ||
          "pending"
        ).toLowerCase();

        let normalizedStatus: "successful" | "pending" | "failed" = "pending";
        if (
          rawStatus.includes("success") ||
          rawStatus === "1" ||
          rawStatus === "approved" ||
          rawStatus === "completed" ||
          rawStatus === "settled" ||
          rawStatus === "confirmed"
        ) {
          normalizedStatus = "successful";
        } else if (
          rawStatus.includes("fail") ||
          rawStatus.includes("reject") ||
          rawStatus === "0" ||
          rawStatus === "declined" ||
          rawStatus === "cancelled"
        ) {
          normalizedStatus = "failed";
        }

        const reference =
          txn.reference ||
          item.reference ||
          item.reference_no ||
          item.transaction_reference ||
          item.trx_ref ||
          item.tx_ref ||
          item.trans_ref ||
          item.payment_reference ||
          item.reference_id ||
          item.ref_no ||
          item.deposit_reference ||
          item.ref ||
          item.code ||
          item.uuid ||
          (item.id ? `PAY-DEP-${String(item.id).padStart(5, "0")}` : "—");

        const companyName =
          comp.name ||
          item.company_name ||
          item.companyName ||
          item.user?.company_name ||
          item.user?.name ||
          item.company?.user?.name ||
          item.name ||
          "Payfleet Client";

        const email =
          comp.email ||
          item.email ||
          item.user?.email ||
          item.company?.user?.email ||
          "—";

        const amount = Number(
          item.amount ||
          txn.amount ||
          item.deposit_amount ||
          0
        );

        const rawMethod = String(
          item.method ||
          item.channel ||
          item.payment_method ||
          txn.description ||
          "Bank Transfer"
        );

        const method =
          rawMethod.toLowerCase().includes("deposit") || rawMethod.toLowerCase().includes("transfer")
            ? "Bank Transfer"
            : rawMethod;

        return {
          id: item.id || txn.id || reference,
          company_id: item.company_id || comp.id || item.companyId,
          companyId: item.company_id || comp.id || item.companyId,
          companyName,
          email,
          reference,
          amount,
          method,
          accountNumber:
            item.account_number ||
            item.accountNumber ||
            item.company_account_number ||
            comp.phone ||
            "",
          bankName:
            item.bank_name ||
            item.bankName ||
            item.bank ||
            "Clearing Bank",
          status: normalizedStatus,
          date:
            item.created_at ||
            txn.created_at ||
            item.date ||
            item.createdAt ||
            item.deposit_date ||
            item.updated_at ||
            new Date().toISOString(),
          approvedAt:
            txn.updated_at ||
            item.approved_at ||
            item.approvedAt ||
            item.updated_at,
          rejectionReason:
            item.rejection_reason || item.rejectionReason || item.reason,
        };
      })
    : [];

  // If a specific status filter is active and custom searchTerm was searched, filter items
  let finalItems = items;
  let isClientFiltered = false;
  if (status && status !== "all") {
    const targetStatus = status.toLowerCase().includes("success")
      ? "successful"
      : status.toLowerCase().includes("fail")
      ? "failed"
      : "pending";

    if (querySearch && querySearch !== "pending" && querySearch !== "successfull" && querySearch !== "failed") {
      finalItems = items.filter((item) => item.status === targetStatus);
      isClientFiltered = true;
    }
  }

  let totalItems = finalItems.length;
  let currentPage = page;
  let totalPages = Math.max(1, Math.ceil(totalItems / per_page));

  const hasServerPagination =
    !isClientFiltered &&
    (resData?.pagination != null || resData?.data?.total !== undefined);

  if (hasServerPagination) {
    if (resData?.pagination) {
      totalItems = resData.pagination.total ?? totalItems;
      totalPages = resData.pagination.last_page ?? totalPages;
      currentPage = resData.pagination.current_page ?? currentPage;
    } else if (resData?.data?.total !== undefined) {
      totalItems = resData.data.total;
      totalPages = resData.data.last_page ?? totalPages;
      currentPage = resData.data.current_page ?? currentPage;
    }
  } else {
    // Client-side slicing fallback when backend returns unpaginated array or when client filtered
    const startIndex = (page - 1) * per_page;
    finalItems = finalItems.slice(startIndex, startIndex + per_page);
  }

  return {
    items: finalItems,
    totalItems,
    currentPage,
    totalPages,
    perPage: per_page,
  };
};

export interface DeclineDepositPayload {
  amount?: number;
  company_id?: number | string;
  description?: string;
  reason?: string;
  rejection_reason?: string;
}

/**
 * Approve deposit: POST /confirm-deposit/{id}
 */
export const approveDepositService = async (id: number | string) => {
  const response = await api.post(`/confirm-deposit/${id}`);
  return response.data;
};

/**
 * Decline/Reject deposit: POST /decline-deposit/{id}
 * Accepts payload: { description: "fraudulent", amount?, company_id?, reason? }
 */
export const declineDepositService = async (
  id: number | string,
  payload?: DeclineDepositPayload | string,
) => {
  let body: Record<string, unknown> = {};
  if (typeof payload === "string") {
    body = {
      description: payload,
      reason: payload,
      rejection_reason: payload,
    };
  } else if (payload && typeof payload === "object") {
    const desc = payload.description || payload.reason || payload.rejection_reason;
    body = {
      ...(desc ? { description: desc, reason: desc, rejection_reason: desc } : {}),
      ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
      ...(payload.company_id !== undefined ? { company_id: payload.company_id } : {}),
    };
  }
  const response = await api.put(`/decline-deposit/${id}`, body);
  return response.data;
};

export const rejectDepositService = declineDepositService;

/**
 * Delete deposit: DELETE /delete-deposit/{id}
 */
export const deleteDepositService = async (id: number | string) => {
  try {
    const response = await api.delete(`/delete-deposit/${id}`);
    return response.data;
  } catch {
    const response = await api.delete(`/all-deposit/${id}`);
    return response.data;
  }
};

export interface DepositStatsResponse {
  totalDeposits: number;
  totalVolume: number;
  successfulCount: number;
  successfulVolume: number;
  pendingCount: number;
  pendingVolume: number;
  failedCount: number;
  failedVolume: number;
  items: DepositItemProps[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  raw?: Record<string, unknown>;
}

/**
 * Deposit statistics: GET /deposit-stats
 */
export const getDepositStatsService = async (): Promise<DepositStatsResponse> => {
  try {
    const response = await api.get("/deposit-stats");
    const resData = response.data;
    const data = resData?.data ?? resData ?? {};

    const totalDeposits = Number(
      data.total_deposits ??
      data.totalDeposits ??
      data.total_count ??
      data.total ??
      data.count ??
      0
    );

    const totalVolume = Number(
      data.total_volume ??
      data.totalVolume ??
      data.total_amount ??
      data.totalAmount ??
      data.volume ??
      0
    );

    const successfulCount = Number(
      data.successful_deposits ??
      data.successful_count ??
      data.successfulCount ??
      data.approved_deposits ??
      data.approved_count ??
      data.completed_deposits ??
      data.success_count ??
      0
    );

    const successfulVolume = Number(
      data.successful_volume ??
      data.successfulVolume ??
      data.successful_amount ??
      data.successfulAmount ??
      data.approved_amount ??
      data.cleared_amount ??
      0
    );

    const pendingCount = Number(
      data.pending_deposits ??
      data.pending_count ??
      data.pendingCount ??
      data.pending ??
      0
    );

    const pendingVolume = Number(
      data.pending_volume ??
      data.pendingVolume ??
      data.pending_amount ??
      data.pendingAmount ??
      0
    );

    const failedCount = Number(
      data.failed_deposits ??
      data.failed_count ??
      data.failedCount ??
      data.declined_deposits ??
      data.declined_count ??
      data.rejected_count ??
      data.failed ??
      0
    );

    const failedVolume = Number(
      data.failed_volume ??
      data.failedVolume ??
      data.failed_amount ??
      data.failedAmount ??
      0
    );

    const rawList =
      data.items ||
      data.deposits ||
      (Array.isArray(data) ? data : []);

    const items: DepositItemProps[] = Array.isArray(rawList) ? rawList : [];

    return {
      totalDeposits: totalDeposits || items.length,
      totalVolume: totalVolume || items.filter((d) => d.status === "successful").reduce((s, d) => s + (d.amount || 0), 0),
      successfulCount: successfulCount || items.filter((d) => d.status === "successful").length,
      successfulVolume: successfulVolume || items.filter((d) => d.status === "successful").reduce((s, d) => s + (d.amount || 0), 0),
      pendingCount: pendingCount || items.filter((d) => d.status === "pending").length,
      pendingVolume: pendingVolume || items.filter((d) => d.status === "pending").reduce((s, d) => s + (d.amount || 0), 0),
      failedCount: failedCount || items.filter((d) => d.status === "failed").length,
      failedVolume: failedVolume || items.filter((d) => d.status === "failed").reduce((s, d) => s + (d.amount || 0), 0),
      items,
      totalItems: totalDeposits || items.length,
      currentPage: 1,
      totalPages: 1,
      perPage: items.length || 10,
      raw: data,
    };
  } catch {
    // Graceful fallback to all deposits list aggregation
    const fallback = await getAllDepositsService({ page: 1, per_page: 1000 });
    const successfulItems = fallback.items.filter((d) => d.status === "successful");
    const pendingItems = fallback.items.filter((d) => d.status === "pending");
    const failedItems = fallback.items.filter((d) => d.status === "failed");

    return {
      totalDeposits: fallback.totalItems || fallback.items.length,
      totalVolume: successfulItems.reduce((sum, d) => sum + d.amount, 0),
      successfulCount: successfulItems.length,
      successfulVolume: successfulItems.reduce((sum, d) => sum + d.amount, 0),
      pendingCount: pendingItems.length,
      pendingVolume: pendingItems.reduce((sum, d) => sum + d.amount, 0),
      failedCount: failedItems.length,
      failedVolume: failedItems.reduce((sum, d) => sum + d.amount, 0),
      items: fallback.items,
      totalItems: fallback.totalItems,
      currentPage: fallback.currentPage,
      totalPages: fallback.totalPages,
      perPage: fallback.perPage,
    };
  }
};