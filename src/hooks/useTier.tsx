import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TIER_PLANS,
  getTierConfig,
  getAllTiersService,
  getTierByIdService,
  createTierService,
  updateTierService,
  deleteTierService,
  getTierUpgradeRequestsService,
  getCompanyTierRequestsService,
  requestTierUpgradeService,
  updateCompanyTierService,
  reviewTierRequestService,
  type RequestTierUpgradePayload,
  type TierFormData,
} from "../services/tierService";
import { getErrorMessage } from "../helpers/api";

export const useTierPlans = () => {
  return {
    plans: TIER_PLANS,
    getTierConfig,
  };
};

/**
 * Hook to fetch all configured platform tiers
 * GET /all-tiers
 */
export const useAllTiers = () => {
  return useQuery({
    queryKey: ["tiers", "all"],
    queryFn: () => getAllTiersService(),
    staleTime: 60000,
  });
};

/**
 * Hook to fetch single tier details
 * GET /each-tiers/{id}
 */
export const useTierById = (id?: number | string) => {
  return useQuery({
    queryKey: ["tiers", "detail", id],
    queryFn: () => getTierByIdService(id!),
    enabled: Boolean(id),
  });
};

/**
 * Hook to create a new tier
 * POST /create-tier
 */
export const useCreateTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TierFormData) => createTierService(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
      toast.success(res?.name ? `Tier "${res.name}" created successfully!` : "Tier created successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create tier"));
    },
  });
};

/**
 * Hook to update an existing tier
 * POST /update-tier/{id}
 */
export const useUpdateTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: TierFormData }) =>
      updateTierService({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
      toast.success("Tier updated successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update tier"));
    },
  });
};

/**
 * Hook to delete a tier
 * DELETE /delete-tiers/{id}
 */
export const useDeleteTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteTierService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
      toast.success("Tier deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete tier"));
    },
  });
};

export const useTierRequests = () => {
  return useQuery({
    queryKey: ["tier", "requests"],
    queryFn: () => getTierUpgradeRequestsService(),
    refetchInterval: 30000,
  });
};

export const useCompanyTierRequests = (companyId?: number | string) => {
  return useQuery({
    queryKey: ["tier", "requests", companyId],
    queryFn: () => getCompanyTierRequestsService(companyId),
    refetchInterval: 30000,
  });
};

export const useRequestTierUpgrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestTierUpgradePayload) => requestTierUpgradeService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tier"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Tier upgrade request submitted successfully! Our compliance team will review your application.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to submit tier upgrade request"));
    },
  });
};

export const useUpdateCompanyTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      tier,
      notes,
    }: {
      companyId: number | string;
      tier: number | string;
      notes?: string;
    }) => updateCompanyTierService({ companyId, tier, notes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["tier"] });
      toast.success(`Company tier successfully updated to Tier ${variables.tier}!`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update company tier"));
    },
  });
};

export const useReviewTierRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      status,
      rejectionReason,
      targetTier,
      companyId,
    }: {
      requestId: number | string;
      status: "approved" | "rejected";
      rejectionReason?: string;
      targetTier?: number | string;
      companyId?: number | string;
    }) =>
      reviewTierRequestService({
        requestId,
        status,
        rejectionReason,
        targetTier,
        companyId,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["tier"] });
      if (variables.status === "approved") {
        toast.success("Tier upgrade application approved successfully!");
      } else {
        toast.info("Tier upgrade application rejected.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to review tier request"));
    },
  });
};
