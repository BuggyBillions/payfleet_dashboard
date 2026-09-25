import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStaffsService,
  getStaffByIdService,
  createStaffService,
  createFinanceOfficerService,
  createSupportOfficerService,
  activateUserService,
  deactivateUserService,
  deleteUserService,
  type GetStaffsParams,
  type StaffListResponse,
  type CreateStaffPayload,
} from "../services/staffService";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";
import type { StaffProps } from "../lib/interfaces";

/**
 * Main paginated/filtered staff query hook
 */
export const useStaffs = ({
  page = 1,
  searchTerm = "",
  per_page = 10,
  role = "",
  status = "",
}: GetStaffsParams = {}) => {
  return useQuery<StaffListResponse>({
    queryKey: ["staffs", page, searchTerm, per_page, role, status],
    queryFn: () =>
      getStaffsService({ page, searchTerm, per_page, role, status }),
    placeholderData: (prev) => prev,
  });
};

/**
 * Full staff stats query for calculating accurate aggregate cards
 */
export const useStaffStats = () => {
  return useQuery<StaffListResponse>({
    queryKey: ["staffs", "stats"],
    queryFn: () => getStaffsService({ page: 1, per_page: 1000, role: "" }),
    placeholderData: (prev) => prev,
  });
};

/**
 * Get individual staff details hook (/each-staffs/{id})
 */
export const useStaffById = (id: number | string | null | undefined, enabled = true) => {
  return useQuery<StaffProps>({
    queryKey: ["staff", id],
    queryFn: () => getStaffByIdService(id!),
    enabled: Boolean(id) && enabled,
  });
};

/**
 * Create Staff (Finance or Support) mutation
 */
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaffService(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      const roleName = variables.role || "Staff member";
      toast.success(`${roleName} created successfully!`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create staff member"));
    },
  });
};

/**
 * Create Finance Officer explicitly
 */
export const useCreateFinanceOfficer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) =>
      createFinanceOfficerService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      toast.success("Financial Officer created successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create Financial Officer"));
    },
  });
};

/**
 * Create Support Officer explicitly
 */
export const useCreateSupportOfficer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) =>
      createSupportOfficerService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      toast.success("Support Officer created successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create Support Officer"));
    },
  });
};

/**
 * Activate User mutation (/activate-users/{id})
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => activateUserService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("User account activated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to activate user account"));
    },
  });
};

/**
 * Deactivate User mutation (/deactivate-users/{id})
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deactivateUserService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("User account deactivated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to deactivate user account"));
    },
  });
};

/**
 * Delete User mutation (/delete-users/{id})
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteUserService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      toast.success("User account deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    },
  });
};
