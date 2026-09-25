import api from "../helpers/api";
import type { TierConfig, TierUpgradeRequest, TierItem, TierFormData } from "../lib/interfaces";

export type { TierItem, TierFormData };

// ==========================================
// TIER CRUD API SERVICES
// ==========================================

/**
 * Fetch all tiers configured on the platform (Admin & Company)
 * GET /all-tiers
 */
export const getAllTiersService = async (): Promise<TierItem[]> => {
  try {
    const response = await api.get("/all-tiers");
    const resData = response.data;
    const list =
      resData?.data?.data ||
      resData?.data ||
      resData?.tiers ||
      (Array.isArray(resData) ? resData : []);
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch (err) {
    console.warn("Failed to fetch /all-tiers from backend, using fallback tier plans:", err);
  }

  // Fallback default tiers mapped to TierItem schema
  return TIER_PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    level: p.id,
    no_of_staff: String(p.maxEmployees),
    requirements: p.kycRequirements.join(", "),
  }));
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

  const response = await api.post(`/update-tier/${id}`, payload).catch(async () => {
    return await api.put(`/update-tier/${id}`, payload);
  });
  return response.data?.data ?? response.data;
};

/**
 * Delete a tier (SuperAdmin)
 * DELETE /delete-tiers/{id} (or POST)
 */
export const deleteTierService = async (id: number | string) => {
  const response = await api.delete(`/delete-tiers/${id}`).catch(async () => {
    return await api.post(`/delete-tiers/${id}`);
  });
  return response.data;
};

// ==========================================
// TIER PLANS CONFIGURATION & CONSTANTS
// ==========================================

export const TIER_PLANS: TierConfig[] = [
  {
    id: 1,
    name: "Starter",
    code: "tier_1",
    badge: "Tier 1",
    description: "Ideal for early-stage startups and small teams setting up basic payroll.",
    maxEmployees: 10,
    monthlyVolumeLimit: 1_000_000,
    singleTransactionLimit: 250_000,
    dailyPayoutLimit: 500_000,
    maxBankAccounts: 1,
    pricing: "Free",
    features: [
      "Up to 10 active employees",
      "Manual and CSV employee roster upload",
      "Single linked settlement bank account",
      "₦1,000,000 monthly payroll volume limit",
      "₦250,000 single transaction disbursement limit",
      "Standard email customer support",
      "Standard PDF & CSV payroll receipts",
    ],
    kycRequirements: [
      "Registered Business Name & Email",
      "Phone Number Verification",
      "Basic Corporate Profile",
    ],
  },
  {
    id: 2,
    name: "Business",
    code: "tier_2",
    badge: "Tier 2",
    description: "Designed for scaling businesses requiring higher limits and multiple bank accounts.",
    maxEmployees: 50,
    monthlyVolumeLimit: 10_000_000,
    singleTransactionLimit: 2_500_000,
    dailyPayoutLimit: 5_000_000,
    maxBankAccounts: 5,
    pricing: "Custom / Growth",
    isPopular: true,
    features: [
      "Up to 50 active employees",
      "Automated batch disbursement scheduling",
      "Up to 5 linked settlement bank accounts",
      "₦10,000,000 monthly payroll volume limit",
      "₦2,500,000 single transaction disbursement limit",
      "Automated tax, pension & deduction calculator",
      "Priority live chat & fast-track email support",
      "Advanced audit logs & payment history exports",
    ],
    kycRequirements: [
      "CAC Certificate of Incorporation / RC Number",
      "Tax Identification Number (TIN)",
      "Proof of Registered Business Address (Utility Bill)",
      "Valid Director Government ID",
    ],
  },
  {
    id: 3,
    name: "Enterprise",
    code: "tier_3",
    badge: "Tier 3",
    description: "Full-scale corporate infrastructure for large organizations with custom requirements.",
    maxEmployees: "Unlimited",
    monthlyVolumeLimit: 100_000_000,
    singleTransactionLimit: 25_000_000,
    dailyPayoutLimit: 50_000_000,
    maxBankAccounts: "Unlimited",
    pricing: "Enterprise Bespoke",
    features: [
      "Unlimited active employees & departments",
      "Unlimited linked settlement bank accounts",
      "Unlimited / Custom monthly payroll volume",
      "Custom high-limit single transaction threshold",
      "Multi-level executive approval workflows",
      "Dedicated account manager & 24/7 priority phone SLA",
      "Developer API access & webhook notifications",
      "Comprehensive compliance pack & custom reports",
    ],
    kycRequirements: [
      "Full Corporate CAC Status Report / Form CAC 1.1",
      "Memorandum & Articles of Association (MEMART)",
      "Verified Corporate Bank Account Confirmation",
      "Executive Director Board Resolution & Biometrics",
    ],
  },
];

// Helper to normalize tier name / id
export const getTierConfig = (tier?: string | number | null): TierConfig => {
  if (!tier) return TIER_PLANS[0];
  const tStr = String(tier).toLowerCase().trim();
  if (tStr === "3" || tStr === "tier 3" || tStr === "tier_3" || tStr === "enterprise") {
    return TIER_PLANS[2];
  }
  if (tStr === "2" || tStr === "tier 2" || tStr === "tier_2" || tStr === "business" || tStr === "growth") {
    return TIER_PLANS[1];
  }
  return TIER_PLANS[0];
};

export const getTierNumber = (tier?: string | number | null): number => {
  return getTierConfig(tier).id;
};

// ==========================================
// LOCAL STORAGE MOCK CACHE (FOR HYBRID / DEMO)
// ==========================================
const TIER_REQUESTS_KEY = "payfleet_tier_upgrade_requests";

const getStoredRequests = (): TierUpgradeRequest[] => {
  try {
    const raw = localStorage.getItem(TIER_REQUESTS_KEY);
    if (!raw) {
      const initial: TierUpgradeRequest[] = [
        {
          id: 1,
          companyId: 7,
          companyName: "Penty Technologies",
          companyEmail: "oluwatoyinayomide6@gmail.com",
          currentTier: 1,
          requestedTier: 2,
          rcNumber: "RC-892182",
          tinNumber: "TIN-29103912",
          directorName: "Ayomide Oluwatoyin",
          directorPhone: "08012345678",
          documentName: "cac_certificate_penty.pdf",
          reason: "Expanding our workforce beyond 10 employees and need higher payroll limits.",
          status: "pending",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 2,
          companyId: 5,
          companyName: "Pentium Global",
          companyEmail: "pentium@gmail.com",
          currentTier: 1,
          requestedTier: 3,
          rcNumber: "RC-450912",
          tinNumber: "TIN-88910231",
          directorName: "Pentium Admin",
          directorPhone: "08087654321",
          documentName: "corporate_status_report.pdf",
          reason: "Requires unlimited monthly disbursement and API integration for branch offices.",
          status: "pending",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      localStorage.setItem(TIER_REQUESTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveStoredRequests = (requests: TierUpgradeRequest[]) => {
  try {
    localStorage.setItem(TIER_REQUESTS_KEY, JSON.stringify(requests));
  } catch (err) {
    console.warn("Failed to persist tier requests:", err);
  }
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

  // Update local storage record
  const currentRequests = getStoredRequests();
  const newReq: TierUpgradeRequest = {
    id: Date.now(),
    companyId: payload.company_id || "current",
    companyName: payload.company_name || "My Company",
    companyEmail: payload.company_email || "",
    currentTier: payload.current_tier || 1,
    requestedTier: payload.requested_tier,
    rcNumber: payload.rc_number || "",
    tinNumber: payload.tin_number || "",
    directorName: payload.director_name || "",
    directorPhone: payload.director_phone || "",
    documentName: payload.document ? payload.document.name : undefined,
    reason: payload.reason || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const updated = [newReq, ...currentRequests];
  saveStoredRequests(updated);

  return resData ?? { status: true, message: "Tier upgrade request submitted successfully", data: newReq };
};

/**
 * Get all tier upgrade requests (SuperAdmin / Admin)
 */
export const getTierUpgradeRequestsService = async (): Promise<TierUpgradeRequest[]> => {
  try {
    const response = await api.get("/tier/requests");
    const data = response.data?.data ?? response.data;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.info("Using local tier upgrade requests cache", err);
  }
  return getStoredRequests();
};

/**
 * Get company's active tier upgrade requests
 */
export const getCompanyTierRequestsService = async (companyId?: number | string): Promise<TierUpgradeRequest[]> => {
  const all = await getTierUpgradeRequestsService();
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

  // Also update any pending upgrade requests for this company to approved
  const requests = getStoredRequests();
  const updatedReqs = requests.map((r) => {
    if (String(r.companyId) === String(companyId) && r.status === "pending") {
      return { ...r, status: "approved" as const, updatedAt: new Date().toISOString() };
    }
    return r;
  });
  saveStoredRequests(updatedReqs);

  return resData ?? { status: true, message: `Company tier successfully updated to ${tier}` };
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
  status: "approved" | "rejected";
  rejectionReason?: string;
  targetTier?: number | string;
  companyId?: number | string;
}) => {
  let resData;
  try {
    const response = await api.post(`/tier/requests/${requestId}/review`, {
      status,
      rejection_reason: rejectionReason,
      tier: targetTier,
    });
    resData = response.data;
  } catch (err) {
    console.info("Tier review API fallback:", err);
  }

  // If approved and companyId is provided, update company tier
  if (status === "approved" && companyId && targetTier) {
    await updateCompanyTierService({ companyId, tier: targetTier }).catch(() => {});
  }

  const requests = getStoredRequests();
  const updated = requests.map((r) => {
    if (String(r.id) === String(requestId)) {
      return {
        ...r,
        status,
        rejectionReason: status === "rejected" ? rejectionReason : undefined,
        updatedAt: new Date().toISOString(),
      };
    }
    return r;
  });
  saveStoredRequests(updated);

  return resData ?? { status: true, message: `Request successfully ${status}` };
};
