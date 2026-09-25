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
  [key: string]: unknown;
}

export interface BankAccount {
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  [key: string]: unknown;
}

export const companyFunding = async (
  payload: CompanyFundingPayload,
): Promise<CompanyFundingResponse> => {
  const res = await api.post("/company-funding", payload);
  return (res.data?.data ?? res.data) as CompanyFundingResponse;
};

export const getAccount = async (
  company_id?: number | string,
): Promise<BankAccount> => {
  const res = await api.get("/get-account", {
    params: company_id ? { company_id } : undefined,
  });
  return (res.data?.data ?? res.data ?? {}) as BankAccount;
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
  if (status && status !== "all") {
    const targetStatus = status.toLowerCase().includes("success")
      ? "successful"
      : status.toLowerCase().includes("fail")
      ? "failed"
      : "pending";

    if (querySearch && querySearch !== "pending" && querySearch !== "successfull" && querySearch !== "failed") {
      finalItems = items.filter((item) => item.status === targetStatus);
    }
  }

  let totalItems = finalItems.length;
  let currentPage = page;
  let totalPages = Math.max(1, Math.ceil(totalItems / per_page));

  if (resData?.pagination) {
    totalItems = resData.pagination.total ?? totalItems;
    totalPages = resData.pagination.last_page ?? totalPages;
    currentPage = resData.pagination.current_page ?? currentPage;
  } else if (resData?.data?.total !== undefined) {
    totalItems = resData.data.total;
    totalPages = resData.data.last_page ?? totalPages;
    currentPage = resData.data.current_page ?? currentPage;
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
 * Accepts payload: { amount, company_id, reason? }
 */
export const declineDepositService = async (
  id: number | string,
  payload?: DeclineDepositPayload | string,
) => {
  let body: Record<string, unknown> = {};
  if (typeof payload === "string") {
    body = { reason: payload, rejection_reason: payload };
  } else if (payload && typeof payload === "object") {
    body = {
      ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
      ...(payload.company_id !== undefined ? { company_id: payload.company_id } : {}),
      ...(payload.reason ? { reason: payload.reason, rejection_reason: payload.reason } : {}),
    };
  }
  const response = await api.post(`/decline-deposit/${id}`, body);
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