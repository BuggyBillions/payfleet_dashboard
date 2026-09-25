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
 * Deactivate User: POST /deactivate-users/{id} (fallback PUT/PATCH)
 */
export const deactivateUserService = async (id: number | string) => {
  // Try PUT as fallback if POST is not used by backend
  const response = await api.patch(`/deactivate-users/${id}`);
  return response.data;
};

/**
 * Activate User: POST /activate-users/{id} (fallback PUT/PATCH)
 */
export const activateUserService = async (id: number | string) => {
    const response = await api.patch(`/activate-users/${id}`);
    return response.data;
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
