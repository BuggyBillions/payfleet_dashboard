import api from "../helpers/api";
import type {
  StaffProps,
  StaffListResponse,
  GetStaffsParams,
  CreateStaffPayload,
} from "../lib/interfaces";

export type { GetStaffsParams, StaffListResponse, CreateStaffPayload };

/**
 * List all staff: GET /all-staffs
 */
export const getStaffsService = async ({
  page = 1,
  searchTerm = "",
  search = "",
  per_page = 10,
  role = "all",
  status,
}: GetStaffsParams = {}): Promise<StaffListResponse> => {
  const querySearch = (searchTerm || search || "").trim();

  // Backend strictly requires role to be "finance", "support", or "all"
  const rawRole = String(role || "").toLowerCase().trim();
  const validRole = ["finance", "support", "all"].includes(rawRole)
    ? rawRole
    : "all";

  const params: Record<string, unknown> = {
    page,
    search: querySearch || undefined,
    per_page,
    role: validRole,
  };

  if (status && status !== "all") {
    params.status = status;
  }

  const response = await api.get("/all-staffs", { params });
  const resData = response.data;

  const rawList =
    resData?.data?.data ||
    resData?.data ||
    resData?.staffs ||
    resData?.users ||
    resData?.items ||
    (Array.isArray(resData) ? resData : []);

  const items: StaffProps[] = Array.isArray(rawList) ? rawList : [];

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
 * Get each staff: GET /each-staffs/{id}
 */
export const getStaffByIdService = async (
  id: number | string
): Promise<StaffProps> => {
  const response = await api.get(`/each-staffs/${id}`);
  const resData = response.data;
  return resData?.data || resData?.staff || resData;
};

/**
 * Create Financial Officer: POST /create-finance
 */
export const createFinanceOfficerService = async (
  payload: CreateStaffPayload
) => {
  const nameParts = (payload.name || "").trim().split(/\s+/);
  const firstName = payload.first_name || nameParts[0] || "";
  const lastName = payload.last_name || nameParts.slice(1).join(" ") || "";

  const dataToSend = {
    ...payload,
    name: payload.name?.trim(),
    first_name: firstName,
    last_name: lastName,
    email: payload.email?.trim(),
    phone: payload.phoneNumber?.trim() || payload.phone?.trim(),
    phoneNumber: payload.phoneNumber?.trim() || payload.phone?.trim(),
    password: payload.password,
    role: "finance",
  };

  const response = await api.post("/create-finance", dataToSend);
  return response.data;
};

/**
 * Create Support Officer: POST /create-support
 */
export const createSupportOfficerService = async (
  payload: CreateStaffPayload
) => {
  const nameParts = (payload.name || "").trim().split(/\s+/);
  const firstName = payload.first_name || nameParts[0] || "";
  const lastName = payload.last_name || nameParts.slice(1).join(" ") || "";

  const dataToSend = {
    ...payload,
    name: payload.name?.trim(),
    first_name: firstName,
    last_name: lastName,
    email: payload.email?.trim(),
    phone: payload.phoneNumber?.trim() || payload.phone?.trim(),
    phoneNumber: payload.phoneNumber?.trim() || payload.phone?.trim(),
    password: payload.password,
    role: "support",
  };

  const response = await api.post("/create-support", dataToSend);
  return response.data;
};

/**
 * Universal Create Staff helper (dispatches based on selected role)
 */
export const createStaffService = async (payload: CreateStaffPayload) => {
  const roleLower = String(payload.role || "").toLowerCase();
  if (roleLower.includes("finance")) {
    return createFinanceOfficerService(payload);
  }
  return createSupportOfficerService(payload);
};

/**
 * Deactivate User: POST /deactivate-users/{id} (fallback PATCH/PUT)
 */
export const deactivateUserService = async (id: number | string) => {
  try {
    const response = await api.post(`/deactivate-users/${id}`);
    return response.data;
  } catch (err: unknown) {
    try {
      const response = await api.patch(`/deactivate-users/${id}`);
      return response.data;
    } catch {
      try {
        const response = await api.put(`/deactivate-users/${id}`);
        return response.data;
      } catch {
        throw err;
      }
    }
  }
};

/**
 * Activate User: POST /activate-users/{id} (fallback PATCH/PUT)
 */
export const activateUserService = async (id: number | string) => {
  try {
    const response = await api.post(`/activate-users/${id}`);
    return response.data;
  } catch (err: unknown) {
    try {
      const response = await api.patch(`/activate-users/${id}`);
      return response.data;
    } catch {
      try {
        const response = await api.put(`/activate-users/${id}`);
        return response.data;
      } catch {
        throw err;
      }
    }
  }
};

/**
 * Delete User: DELETE /delete-users/{id} (fallback POST)
 */
export const deleteUserService = async (id: number | string) => {
  try {
    const response = await api.delete(`/delete-users/${id}`);
    return response.data;
  } catch {
    // Try POST as fallback if DELETE is method-constrained
    const response = await api.post(`/delete-users/${id}`);
    return response.data;
  }
};

export interface StaffStatsResponse {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  financeStaff: number;
  supportStaff: number;
  items: StaffProps[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  raw?: Record<string, unknown>;
}

/**
 * Staff statistics: GET /staff-stats
 */
export const getStaffStatsService = async (): Promise<StaffStatsResponse> => {
  try {
    const response = await api.get("/staff-stats");
    const resData = response.data;
    const data = resData?.data ?? resData ?? {};

    const totalStaff = Number(
      data.total_staff ??
      data.totalStaff ??
      data.total_users ??
      data.totalUsers ??
      data.total ??
      data.count ??
      0
    );

    const activeStaff = Number(
      data.active_staff ??
      data.activeStaff ??
      data.active_users ??
      data.activeUsers ??
      data.active ??
      0
    );

    const inactiveStaff = Number(
      data.inactive_staff ??
      data.inactiveStaff ??
      data.inactive_users ??
      data.inactiveUsers ??
      data.inactive ??
      0
    );

    const financeStaff = Number(
      data.finance_staff ??
      data.financeStaff ??
      data.financial_officers ??
      data.financialOfficers ??
      data.finance ??
      data.finance_count ??
      0
    );

    const supportStaff = Number(
      data.support_staff ??
      data.supportStaff ??
      data.support_officers ??
      data.supportOfficers ??
      data.support ??
      data.support_count ??
      0
    );

    const rawList =
      data.items ||
      data.staffs ||
      data.users ||
      (Array.isArray(data) ? data : []);

    const items: StaffProps[] = Array.isArray(rawList) ? rawList : [];

    const isStaffActive = (s: StaffProps) => {
      const st = String(s.status ?? s.is_active ?? s.enabled ?? "").toLowerCase();
      return st === "active" || st === "1" || st === "true" || st === "successful";
    };

    return {
      totalStaff: totalStaff || items.length,
      activeStaff:
        activeStaff ||
        (items.length > 0 ? items.filter(isStaffActive).length : 0),
      inactiveStaff:
        inactiveStaff ||
        (items.length > 0
          ? items.filter((s) => !isStaffActive(s)).length
          : Math.max(0, (totalStaff || items.length) - (activeStaff || 0))),
      financeStaff:
        financeStaff ||
        (items.length > 0
          ? items.filter((s) =>
              String(s.role || "").toLowerCase().includes("finance")
            ).length
          : 0),
      supportStaff:
        supportStaff ||
        (items.length > 0
          ? items.filter((s) =>
              String(s.role || "").toLowerCase().includes("support")
            ).length
          : 0),
      items,
      totalItems: totalStaff || items.length,
      currentPage: 1,
      totalPages: 1,
      perPage: items.length || 10,
      raw: data,
    };
  } catch {
    // Fallback to fetching all staff
    const fallback = await getStaffsService({ page: 1, per_page: 1000, role: "all" });
    const items = fallback.items;
    const isStaffActive = (s: StaffProps) => {
      const st = String(s.status ?? s.is_active ?? s.enabled ?? "").toLowerCase();
      return st === "active" || st === "1" || st === "true" || st === "successful";
    };

    const activeStaff = items.filter(isStaffActive).length;
    const financeStaff = items.filter((s) =>
      String(s.role || "").toLowerCase().includes("finance")
    ).length;
    const supportStaff = items.filter((s) =>
      String(s.role || "").toLowerCase().includes("support")
    ).length;

    return {
      totalStaff: fallback.totalItems || items.length,
      activeStaff,
      inactiveStaff: Math.max(0, (fallback.totalItems || items.length) - activeStaff),
      financeStaff,
      supportStaff,
      items,
      totalItems: fallback.totalItems,
      currentPage: fallback.currentPage,
      totalPages: fallback.totalPages,
      perPage: fallback.perPage,
    };
  }
};
