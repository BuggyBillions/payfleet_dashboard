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
        const rawStatus = String(item.status || "pending").toLowerCase();
        let normalizedStatus: "successful" | "pending" | "failed" = "pending";
        if (
          rawStatus.includes("success") ||
          rawStatus === "1" ||
          rawStatus === "approved"
        ) {
          normalizedStatus = "successful";
        } else if (
          rawStatus.includes("fail") ||
          rawStatus.includes("reject") ||
          rawStatus === "0"
        ) {
          normalizedStatus = "failed";
        }

        return {
          id: item.id || item.reference || Math.random(),
          companyName:
            item.company_name ||
            item.company?.name ||
            item.company?.company_name ||
            item.companyName ||
            item.user?.company_name ||
            item.user?.name ||
            "Payfleet Client",
          email:
            item.email ||
            item.company?.email ||
            item.user?.email ||
            "—",
          reference:
            item.reference ||
            item.reference_no ||
            item.transaction_reference ||
            item.ref ||
            "—",
          amount: Number(item.amount || 0),
          method:
            item.method ||
            item.channel ||
            item.payment_method ||
            "Bank Transfer",
          accountNumber: item.account_number || item.accountNumber || "",
          bankName: item.bank_name || item.bankName || "",
          status: normalizedStatus,
          date:
            item.created_at ||
            item.date ||
            item.createdAt ||
            new Date().toISOString(),
          approvedAt: item.approved_at || item.approvedAt || item.updated_at,
          rejectionReason:
            item.rejection_reason || item.rejectionReason || item.reason,
        };
      })
    : [];

  let totalItems = items.length;
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
    items,
    totalItems,
    currentPage,
    totalPages,
    perPage: per_page,
  };
};

/**
 * Approve deposit: POST /confirm-deposit/{id}
 */
export const approveDepositService = async (id: number | string) => {
  const response = await api.post(`/confirm-deposit/${id}`);
  return response.data;
};

/**
 * Reject deposit: POST /reject-deposit/{id}
 */
export const rejectDepositService = async (
  id: number | string,
  reason?: string,
) => {
  try {
    const response = await api.post(`/reject-deposit/${id}`, {
      reason,
      rejection_reason: reason,
    });
    return response.data;
  } catch {
    const response = await api.post(`/all-deposit/${id}/reject`, {
      reason,
      rejection_reason: reason,
    });
    return response.data;
  }
};

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