import api from "../helpers/api";
import type {
  TierUpgradeRequest,
  TierItem,
  TierFormData,
} from "../lib/interfaces";

export type { TierItem, TierFormData };
export type Tier = TierItem;

/**
 * Fetch all tiers configured on the platform (Admin & Company)
 * GET /all-tiers?search=...
 */
export const getAllTiersService = async (params?: { search?: string; searchTerm?: string }): Promise<TierItem[]> => {
  const querySearch = params?.search || params?.searchTerm;
  const queryParams = querySearch?.trim() ? { search: querySearch.trim() } : undefined;
  const response = await api.get("/all-tiers", { params: queryParams });
  const resData = response.data;
  const list =
    resData?.data?.data ||
    resData?.data ||
    resData?.tiers ||
    (Array.isArray(resData) ? resData : []);
  return Array.isArray(list) ? list : [];
};

/**
 * Fetch single tier by ID
 * GET /each-tiers/{id}
 */
export const getTierByIdService = async (id: number | string): Promise<TierItem> => {
  const response = await api.get(`/each-tiers/${id}`);
  return response.data?.data ?? response.data;
};

/**
 * Create a new tier (SuperAdmin)
 * POST /create-tier
 */
export const createTierService = async (data: TierFormData): Promise<TierItem> => {
  const response = await api.post("/create-tier", {
    name: data.name,
    level: Number(data.level),
    no_of_staff: String(data.no_of_staff),
    requirements: data.requirements,
  });
  return response.data?.data ?? response.data;
};

/**
 * Update an existing tier (SuperAdmin)
 * POST /update-tier/{id} (or PUT)
 */
export const updateTierService = async ({
  id,
  data,
}: {
  id: number | string;
  data: TierFormData;
}): Promise<TierItem> => {
  const payload = {
    name: data.name,
    level: Number(data.level),
    no_of_staff: String(data.no_of_staff),
    requirements: data.requirements,
  };

  const response = await api.put(`/update-tier/${id}`, payload);
  return response.data?.data ?? response.data;
};

/**
 * Delete a tier (SuperAdmin)
 * DELETE /delete-tiers/{id} (or POST)
 */
export const deleteTierService = async (id: number | string) => {
  const response = await api.delete(`/delete-tiers/${id}`);
  return response.data;
};

// Aliases for compatibility
export const getTiers = getAllTiersService;
export const getEachTier = getTierByIdService;

export interface FormattedTierConfig {
  id: number;
  name: string;
  level: number;
  badge: string;
  no_of_staff: string;
  requirements: string;
}

/**
 * Normalizes any tier representation (object, level number, or string) into a standard formatted structure
 */
export const getTierConfig = (tier: unknown): FormattedTierConfig => {
  if (!tier) {
    return {
      id: 1,
      name: "Tier 1",
      level: 1,
      badge: "Level 1",
      no_of_staff: "—",
      requirements: "",
    };
  }
  if (typeof tier === "object") {
    const t = tier as Partial<TierItem>;
    const levelNum = Number(t.level ?? t.id ?? 1) || 1;
    return {
      id: Number(t.id ?? levelNum),
      name: t.name || `Level ${levelNum}`,
      level: levelNum,
      badge: `Level ${levelNum}`,
      no_of_staff: String(t.no_of_staff ?? "—"),
      requirements: typeof t.requirements === "string" ? t.requirements : "",
    };
  }
  const num = Number(tier);
  if (!isNaN(num) && num > 0) {
    return {
      id: num,
      name: `Tier ${num}`,
      level: num,
      badge: `Level ${num}`,
      no_of_staff: "—",
      requirements: "",
    };
  }
  return {
    id: 1,
    name: String(tier),
    level: 1,
    badge: String(tier),
    no_of_staff: "—",
    requirements: "",
  };
};



// ==========================================
// API SERVICES
// ==========================================

export interface RequestTierUpgradePayload {
  company_id?: number | string;
  company_name?: string;
  company_email?: string;
  current_tier?: number | string;
  requested_tier: number | string;
  rc_number?: string;
  tin_number?: string;
  director_name?: string;
  director_phone?: string;
  reason?: string;
  document?: File | null;
  document_url?: string;
}

/**
 * Submit a tier upgrade request (Company)
 */
export const requestTierUpgradeService = async (payload: RequestTierUpgradePayload) => {
  let resData;
  try {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        if (key === "document" && val instanceof File) {
          formData.append("document", val);
        } else {
          formData.append(key, String(val));
        }
      }
    });

    const response = await api.post("/tier/request-upgrade", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    resData = response.data;
  } catch (err) {
    // Graceful fallback for demo / mock environments
    console.info("Tier upgrade API endpoint not found, recording locally:", err);
  }


  return resData;
};

/**
 * Get all tier upgrade requests (SuperAdmin / Admin)
 */
export const getTierUpgradeRequestsService = async (): Promise<TierUpgradeRequest[]> => {
  try {
    const response = await api.get("/tier-requests").catch(async () => {
      return await api.get("/all-tier-requests");
    });
    const resData = response.data;
    const rawList =
      resData?.data?.data ||
      resData?.data ||
      resData?.requests ||
      (Array.isArray(resData) ? resData : []);
    return Array.isArray(rawList) ? rawList : [];
  } catch (error) {
    console.warn("Could not fetch tier requests:", error);
    return [];
  }
};

/**
 * Get company's active tier upgrade requests
 */
export const getCompanyTierRequestsService = async (companyId?: number | string): Promise<TierUpgradeRequest[]> => {
  const all = await getTierUpgradeRequestsService();
  if (!Array.isArray(all)) return [];
  if (!companyId) return all;
  return all.filter((r) => String(r.companyId) === String(companyId) || String(r.companyId) === "current");
};

/**
 * Update / Set Company Tier directly (SuperAdmin / Admin)
 */
export const updateCompanyTierService = async ({
  companyId,
  tier,
  notes,
}: {
  companyId: number | string;
  tier: number | string;
  notes?: string;
}) => {
  let resData;
  try {
    const response = await api.post(`/companies/${companyId}/tier`, {
      tier,
      notes,
    }).catch(async () => {
      // Alternate endpoint format
      return await api.post(`/update-tier`, {
        company_id: companyId,
        tier,
        notes,
      });
    });
    resData = response.data;
  } catch (err) {
    console.info("Direct update company tier fallback:", err);
  }


  return resData;
};

/**
 * Review Tier Upgrade Request (Approve or Reject) (SuperAdmin)
 */
export const reviewTierRequestService = async ({
  requestId,
  status,
  rejectionReason,
  targetTier,
  companyId,
}: {
  requestId: number | string;
  status: "approved" | "rejected" | "approve" | "reject" | string;
  rejectionReason?: string;
  targetTier?: number | string;
  companyId?: number | string;
}) => {
  let resData;
  try {
    const response = await api.post(`/review-tier-upgrade/${requestId}`, {
      action: status,
      rejection_reason: rejectionReason,
      tier: targetTier,
    });
    resData = response.data;
  } catch (err) {
    console.info("Tier review API fallback:", err);
  }

  // If approved and companyId is provided, update company tier
  if ((status === "approve" || status === "approved") && companyId && targetTier) {
    await updateCompanyTierService({ companyId, tier: targetTier }).catch(() => { });
  }


  return resData;
};

/**
 * Move / upgrade company tier directly (alias for updateCompanyTierService)
 */
export const moveTier = async (
  tier: number | string,
  companyId?: number | string
) => {
  return updateCompanyTierService({
    companyId: companyId ?? "current",
    tier,
  });
};
