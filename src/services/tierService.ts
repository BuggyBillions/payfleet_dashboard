import api from "../helpers/api";
import type {
  TierUpgradeRequest,
  TierItem,
  TierFormData,
} from "../lib/interfaces";
import type { DocumentKey } from "../lib/companyDocuments";

export type { TierItem, TierFormData };
export type Tier = TierItem;

/**
 * Normalise the `requirements` field returned by the tiers endpoints into a
 * list of individual requirement names. The backend may send a comma separated
 * string, an array of strings, or an array of objects with a name/label key.
 */
export const getTierRequirements = (tier: unknown): string[] => {
  if (!tier || typeof tier !== "object") return [];

  const raw = (tier as { requirements?: unknown }).requirements;

  const normalizeEntry = (entry: unknown): string => {
    if (typeof entry === "string") return entry.trim();
    if (typeof entry === "number") return String(entry);
    if (entry && typeof entry === "object") {
      const obj = entry as Record<string, unknown>;
      const value = obj.name ?? obj.label ?? obj.title ?? obj.requirement;
      return typeof value === "string" ? value.trim() : "";
    }
    return "";
  };

  const split = (value: string) =>
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

  if (Array.isArray(raw)) {
    return raw.flatMap((entry) => {
      const value = normalizeEntry(entry);
      if (!value) return [];
      return typeof entry === "string" ? split(value) : [value];
    });
  }

  if (typeof raw === "string") return split(raw);

  return [];
};

/**
 * Fetch all tiers configured on the platform (Admin & Company)
 * GET /all-tiers?search=...
 *
 * `GET /all-tiers` answers with a Laravel paginator envelope, so the tier rows
 * live at `data.data` rather than directly on `data`.
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

const toPositiveNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

/**
 * The company's plan is identified by its `level`, not by tier id or name.
 * `/all-tiers` returns every tier with its own `level` (1, 2, 3 ...), and the
 * authenticated user carries a matching `level` from `GET /me`. Levels are not
 * interchangeable with ids: in the sample payload `Basic` is id 5 / level 1 and
 * `Gen 1 Tier` is id 1 / level 2.
 *
 * Returns the company's level, or `null` when `/me` does not expose one.
 */
/**
 * The company's current tier id, taken from `GET /me`
 * (`company_details.tier.id`). This is the same identifier space the
 * `/all-tiers` table uses, so it is the authoritative match for "current plan".
 */
export const getCompanyTierId = (user: unknown): number | null => {
  if (!user || typeof user !== "object") return null;

  const u = user as Record<string, unknown>;
  const company = (u.company_details ?? {}) as Record<string, unknown>;
  const rawTier = company.tier ?? u.tier;
  const tierObject =
    rawTier && typeof rawTier === "object"
      ? (rawTier as Record<string, unknown>)
      : null;

  return (
    toPositiveNumber(tierObject?.id) ??
    toPositiveNumber(company.tier_id) ??
    toPositiveNumber(u.tier_id) ??
    (typeof rawTier === "string" || typeof rawTier === "number"
      ? toPositiveNumber(rawTier)
      : null)
  );
};

export const getCompanyLevel = (user: unknown): number | null => {
  if (!user || typeof user !== "object") return null;

  const u = user as Record<string, unknown>;
  const company = (u.company_details ?? {}) as Record<string, unknown>;
  const rawTier = company.tier ?? u.tier;
  const tierObject =
    rawTier && typeof rawTier === "object"
      ? (rawTier as Record<string, unknown>)
      : null;

  const candidates: unknown[] = [
    u.level,
    company.level,
    tierObject?.level,
    // Some `/me` payloads put the level on the tier object only.
    tierObject?.id,
    rawTier,
  ];

  for (const candidate of candidates) {
    const level = toPositiveNumber(candidate);
    if (level !== null) return level;
  }

  return null;
};

/**
 * Resolve the company's current plan from the tiers returned by `/all-tiers`.
 * Matching is done on tier id first (the id `/me` reports on
 * `company_details.tier`), then falls back to level and finally tier name so
 * older `/me` payloads still resolve.
 */
export const findCompanyTier = (
  tiers: TierItem[] | null | undefined,
  user: unknown,
): TierItem | null => {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;

  const u = (user && typeof user === "object" ? user : {}) as Record<string, unknown>;
  const company = (u.company_details ?? {}) as Record<string, unknown>;
  const rawTier = company.tier ?? u.tier;
  const tierObject =
    rawTier && typeof rawTier === "object"
      ? (rawTier as Record<string, unknown>)
      : null;

  // 1. Tier id match - the id `/me` reports for the current plan.
  const currentId = getCompanyTierId(user);
  if (currentId !== null) {
    const byId = tiers.find((t) => toPositiveNumber(t?.id) === currentId);
    if (byId) return byId;
  }

  // 2. Level match.
  const level = getCompanyLevel(user);
  if (level !== null) {
    const byLevel = tiers.find((t) => toPositiveNumber(t?.level) === level);
    if (byLevel) return byLevel;
  }

  // 3. Tier name match.
  const name =
    typeof tierObject?.name === "string"
      ? tierObject.name
      : typeof rawTier === "string" && Number.isNaN(Number(rawTier))
        ? rawTier
        : null;
  if (name) {
    const byName = tiers.find(
      (t) => String(t?.name ?? "").toLowerCase() === name.toLowerCase(),
    );
    if (byName) return byName;
  }

  return null;
};

/** Sort tiers by level so the table always reads Basic -> highest plan. */
export const sortTiersByLevel = (tiers: TierItem[]): TierItem[] =>
  [...tiers].sort(
    (a, b) => (toPositiveNumber(a?.level) ?? 0) - (toPositiveNumber(b?.level) ?? 0),
  );

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
  requested_tier: number | string;
  director_name?: string;
  director_phone?: string;
  reason?: string;
  rc_number?: string;
  tin_number?: string;
  document?: File | null;
  documents?: File[];
  document_url?: string;
  [key: string]: unknown
}

/**
 * Move a company onto a different plan (Company).
 * POST /move-tier  { "requested_tier": 2 }
 *
 * The endpoint only accepts the target plan id, so this sends plain JSON and no
 * multipart body. Errors propagate so the mutation can surface a toast.
 */
export const requestTierUpgradeService = async (
  payload: RequestTierUpgradePayload,
) => {
  const response = await api.post("/move-tier", {
    requested_tier: Number(payload.requested_tier),
  });
  return response.data;
};

/**
 * Get all tier upgrade requests (SuperAdmin / Admin)
 */
export const getTierUpgradeRequestsService = async ({
  searchTerm = "",
  search = "",
  page = 1,
  per_page = 20,
}: {
  searchTerm?: string;
  search?: string;
  page?: number;
  per_page?: number;
} = {}): Promise<TierUpgradeRequest[]> => {
  const querySearch = (searchTerm || search || "").trim();
  const params: Record<string, unknown> = {
    page,
    search: querySearch || undefined,
    per_page,
  };
  try {
    const response = await api.get("/tier-requests", {
      params,
    });
    const resData = response.data;
    const rawList =
      resData?.data?.data ||
      resData?.data ||
      resData?.requests ||
      (Array.isArray(resData) ? resData : []);

    const items: TierUpgradeRequest[] = Array.isArray(rawList)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? rawList.map((item: Record<string, any>) => {
          const comp = item.company || {};
          const curTier = item.current_tier || item.currentTier;
          const reqTier = item.requested_tier || item.requestedTier;

          return {
            id: item.id,
            companyId: item.company_id || comp.id || item.companyId,
            company_id: item.company_id || comp.id || item.companyId,
            companyName: comp.name || item.company_name || item.companyName || "Company",
            companyEmail: comp.email || item.company_email || item.companyEmail || "N/A",
            companyPhone: comp.phone || item.phone || item.companyPhone || "N/A",
            companyLogo: comp.logo || item.logo || null,
            currentTier: curTier,
            requestedTier: reqTier,
            current_tier: curTier,
            requested_tier: reqTier,
            bvn: comp.bvn || item.bvn,
            nin: comp.nin || item.nin,
            cac: comp.cac || item.cac,
            mermat: comp.mermat || item.mermat,
            status_report: comp.status_report || item.status_report,
            directorName: item.director_name || item.directorName || comp.director_name,
            directorPhone: item.director_phone || item.directorPhone || comp.phone,
            documentUrl: item.document_url || item.documentUrl,
            documentName: item.document_name || item.documentName,
            reason: item.reason || item.admin_note || item.notes,
            status: item.status || "pending",
            rejectionReason: item.admin_note || item.rejection_reason || item.rejectionReason,
            admin_note: item.admin_note,
            reviewed_by: item.reviewed_by,
            reviewed_at: item.reviewed_at,
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            created_at: item.created_at || item.createdAt,
            updatedAt: item.updated_at || item.updatedAt,
            updated_at: item.updated_at || item.updatedAt,
            company: comp,
            reviewer: item.reviewer,
          };
        })
      : [];

    return items;
  } catch (error) {
    console.warn("Could not fetch tier requests:", error);
    return [];
  }
};

/**
 * The signed-in company's own tier requests.
 * `GET /my-tier-request?search=<status>`
 */
export const getMyTierRequestsService = async (
  search?: string,
): Promise<TierUpgradeRequest[]> => {
  try {
    const response = await api.get("/my-tier-request", {
      params: search ? { search } : undefined,
    });
    const resData = response.data;
    const rawList =
      resData?.data?.data ||
      resData?.data ||
      resData?.requests ||
      (Array.isArray(resData) ? resData : []);
    return Array.isArray(rawList) ? (rawList as TierUpgradeRequest[]) : [];
  } catch (error) {
    console.warn("Could not fetch my tier requests:", error);
    return [];
  }
};

const pick = (
  obj: Record<string, unknown>,
  ...keys: string[]
): unknown => {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

export interface MyTierRequest {
  id: number | string;
  status: string;
  currentTierId: number | null;
  requestedTierId: number | null;
  currentTierName: string;
  requestedTierName: string;
  createdAt: string;
  reason?: string;
}

/**
 * Flatten a `/my-tier-request` row into a display shape. The endpoint returns
 * snake_case while the app's own types are camelCase, and the tier columns hold
 * ids, so plan names are resolved against the `/all-tiers` list.
 */
export const normalizeTierRequest = (
  raw: unknown,
  tiers: TierItem[] = [],
): MyTierRequest => {
  const r = (raw ?? {}) as Record<string, unknown>;

  const currentTierId = toPositiveNumber(
    pick(r, "current_tier", "currentTier", "current_tier_id", "from_tier", "old_tier"),
  );
  const requestedTierId = toPositiveNumber(
    pick(r, "requested_tier", "requestedTier", "requested_tier_id", "tier_id", "tier"),
  );

  const nameFor = (id: number | null): string => {
    if (id === null) return "—";
    const match = tiers.find((t) => toPositiveNumber(t?.id) === id);
    if (match?.name) return String(match.name);
    const level = tiers.find((t) => toPositiveNumber(t?.level) === id);
    return level?.name ? String(level.name) : `Tier ${id}`;
  };

  const reason = pick(r, "reason", "note", "notes", "comment");

  return {
    id: (pick(r, "id") ?? "") as number | string,
    status: String(pick(r, "status", "state") ?? "pending").toLowerCase(),
    currentTierId,
    requestedTierId,
    currentTierName: nameFor(currentTierId),
    requestedTierName: nameFor(requestedTierId),
    createdAt: String(
      pick(r, "created_at", "createdAt", "requested_at", "date") ?? "",
    ),
    reason: reason === undefined ? undefined : String(reason),
  };
};

/**
 * Get company's active tier upgrade requests
 */
export const getCompanyTierRequestsService = async (companyId?: number | string): Promise<TierUpgradeRequest[]> => {
  const all = await getTierUpgradeRequestsService({});
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
  status:  "approve" | "reject" | string;
  rejectionReason?: string;
  targetTier?: number | string;
  companyId?: number | string;
}) => {
  let resData;
  try {
    const response = await api.post(`/review-tier-upgrade/${requestId}`, {
      action: status,
      admin_note: rejectionReason,
      tier: targetTier,
    });
    resData = response.data;
  } catch (err) {
    console.info("Tier review API fallback:", err);
  }

  // If approved and companyId is provided, update company tier
  if ((status === "approved") && companyId && targetTier) {
    await updateCompanyTierService({ companyId, tier: targetTier }).catch(() => { });
  }


  return resData;
};

/**
 * Move / upgrade company tier directly. Delegates to the same POST /move-tier
 * endpoint the company upgrade modal uses.
 */
export const moveTier = async (tier: number | string) => {
  return requestTierUpgradeService({ requested_tier: tier });
};

/**
 * Map a tier requirement (e.g. "CAC", "MERMAT", "status_report") onto the
 * company field that satisfies it. Tiers declare requirements as free text, so
 * matching is done on keywords.
 */
export const requirementField = (
  requirement: string,
): DocumentKey | "bvn" | "nin" | null => {
  const key = requirement.toLowerCase();
  if (key.includes("cac")) return "cac";
  if (key.includes("mermat") || key.includes("memart")) return "mermat";
  if (key.includes("status")) return "status_report";
  if (key.includes("logo")) return "logo";
  if (key.includes("bvn")) return "bvn";
  if (key.includes("nin")) return "nin";
  return null;
};

/**
 * Return the subset of a tier's requirements that the company has not
 * satisfied yet. Requirements that cannot be mapped to a company field are
 * ignored so they never block an upgrade.
 */
export const getMissingTierRequirements = (
  tier: unknown,
  companyDetails?: Record<string, unknown> | null,
): string[] => {
  const details = (companyDetails ?? {}) as Record<string, unknown>;

  return getTierRequirements(tier).filter((requirement) => {
    const field = requirementField(requirement);
    if (!field) return false;
    const value = details[field];
    return !value || String(value).trim() === "";
  });
};
