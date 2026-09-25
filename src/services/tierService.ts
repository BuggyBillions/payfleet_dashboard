import api from "../helpers/api";

export interface Tier {
  id?: number | string;
  name?: string;
  level?: number | string;
  no_of_staff?: number | string;
  requirements?: string[] | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

const unwrapArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as { data?: unknown; tiers?: unknown; results?: unknown };
    const inner = obj.data ?? obj.tiers ?? obj.results;
    if (Array.isArray(inner)) return inner;
    if (inner && typeof inner === "object") {
      const nested = inner as { data?: unknown };
      if (Array.isArray(nested.data)) return nested.data;
    }
  }
  return [];
};

const unwrapObject = (data: unknown): Record<string, unknown> => {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const inner = obj.data;
    if (
      inner &&
      typeof inner === "object" &&
      !Array.isArray(inner) &&
      Object.keys(obj).length <= 3
    ) {
      return inner as Record<string, unknown>;
    }
    return obj;
  }
  return {};
};

export const getTiers = async (): Promise<Tier[]> => {
  const res = await api.get("/all-tiers");
  return unwrapArray(res.data?.data ?? res.data) as unknown as Tier[];
};

export const getEachTier = async (id: number | string): Promise<Tier> => {
  const res = await api.get(`/each-tiers/${id}`);
  return unwrapObject(res.data?.data ?? res.data) as unknown as Tier;
};

export const moveTier = async (requestedTier: number | string): Promise<unknown> => {
  const res = await api.post("/move-tier", {
    requested_tier: Number(requestedTier),
  });
  return res.data?.data ?? res.data;
};