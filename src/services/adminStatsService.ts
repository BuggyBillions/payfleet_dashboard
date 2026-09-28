import api from "../helpers/api";
import type { TierItem } from "../lib/interfaces";

export interface AdminStatsResponse {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  verifiedCompanies: number;
  pendingCompanies: number;
  totalStaff: number;
  activeStaff: number;
  financeStaff: number;
  supportStaff: number;
  superAdmins: number;
  totalPlatformVolume: number;
  totalVolume: number;
  totalClearedDeposits: number;
  clearedLiquidityFormatted?: string;
  pendingDepositsCount: number;
  pendingDepositsVolume: number;
  pendingDepositsFormatted?: string;
  totalDisbursed: number;
  disbursementsFormatted?: string;
  completedPayoutsCount: number;
  pendingDisbursementsAmount: number;
  pendingDisbursementsFormatted?: string;
  pendingVerifications: number;
  pendingTierRequests: number;
  tiers: TierItem[];
  raw?: Record<string, unknown>;
}

/**
 * Fetch platform-wide administrative statistics
 * GET /admin-stats
 */
export const getAdminStatsService = async (): Promise<AdminStatsResponse> => {
  try {
    const response = await api.get("/admin-stats");
    const resData = response.data;
    const data = resData?.data ?? resData ?? {};

    // 1. Platform Volume
    const platformVolumeRaw = data.platform_volume ?? data.platformVolume ?? {};
    const totalPlatformVolume = Number(
      typeof platformVolumeRaw === "object" && platformVolumeRaw !== null
        ? platformVolumeRaw.amount ?? platformVolumeRaw.total ?? 0
        : platformVolumeRaw ||
            data.total_platform_volume ||
            data.totalPlatformVolume ||
            data.total_volume ||
            data.totalVolume ||
            0
    );

    // 2. Active Companies
    const activeCompaniesObj = data.active_companies ?? data.activeCompanies ?? {};
    const totalCompanies = Number(
      (typeof activeCompaniesObj === "object" && activeCompaniesObj !== null
        ? activeCompaniesObj.total
        : undefined) ??
        data.total_companies ??
        data.totalCompanies ??
        data.companies_count ??
        data.companies ??
        0
    );

    const activeCompanies = Number(
      (typeof activeCompaniesObj === "object" && activeCompaniesObj !== null
        ? activeCompaniesObj.active
        : undefined) ??
        data.active_companies ??
        data.activeCompanies ??
        data.active ??
        0
    );

    const verifiedCompanies = Number(
      (typeof activeCompaniesObj === "object" && activeCompaniesObj !== null
        ? activeCompaniesObj.verified
        : undefined) ??
        data.verified_companies ??
        data.verifiedCompanies ??
        data.verified ??
        0
    );

    const inactiveCompanies = Number(
      data.inactive_companies ??
        data.inactiveCompanies ??
        data.inactive ??
        Math.max(0, totalCompanies - activeCompanies)
    );

    // 3. Pending Verifications
    const pendingVerificationsObj =
      data.pending_verifications ?? data.pendingVerifications ?? {};
    const pendingVerifications = Number(
      (typeof pendingVerificationsObj === "object" &&
      pendingVerificationsObj !== null
        ? pendingVerificationsObj.pending
        : undefined) ??
        data.pending_verifications ??
        data.pendingVerifications ??
        data.pending_companies ??
        data.pendingCompanies ??
        0
    );
    const pendingCompanies = pendingVerifications;

    // 4. Cleared Liquidity
    const clearedLiquidityObj =
      data.cleared_liquidity ?? data.clearedLiquidity ?? {};
    const totalClearedDeposits = Number(
      (typeof clearedLiquidityObj === "object" && clearedLiquidityObj !== null
        ? clearedLiquidityObj.cleared
        : undefined) ??
        data.total_cleared_deposits ??
        data.totalClearedDeposits ??
        data.cleared_deposits ??
        data.successful_deposits_volume ??
        0
    );
    const clearedLiquidityFormatted =
      typeof clearedLiquidityObj === "object" && clearedLiquidityObj !== null
        ? clearedLiquidityObj.cleared_formatted
        : undefined;

    const pendingDepositsVolume = Number(
      (typeof clearedLiquidityObj === "object" && clearedLiquidityObj !== null
        ? clearedLiquidityObj.pending
        : undefined) ??
        data.pending_deposits_volume ??
        data.pendingDepositsVolume ??
        data.pending_volume ??
        0
    );
    const pendingDepositsFormatted =
      typeof clearedLiquidityObj === "object" && clearedLiquidityObj !== null
        ? clearedLiquidityObj.pending_formatted
        : undefined;

    const pendingDepositsCount = Number(
      data.pending_deposits_count ??
        data.pendingDepositsCount ??
        data.pending_deposits ??
        (pendingDepositsVolume > 0 ? 1 : 0)
    );

    // 5. Disbursements
    const disbursementsObj = data.disbursements ?? {};
    const totalDisbursed = Number(
      (typeof disbursementsObj === "object" && disbursementsObj !== null
        ? disbursementsObj.amount
        : undefined) ??
        data.total_disbursed ??
        data.totalDisbursed ??
        data.total_payouts_volume ??
        0
    );
    const disbursementsFormatted =
      typeof disbursementsObj === "object" && disbursementsObj !== null
        ? disbursementsObj.formatted
        : undefined;

    const completedPayoutsCount = Number(
      (typeof disbursementsObj === "object" && disbursementsObj !== null
        ? disbursementsObj.completed_payouts
        : undefined) ??
        data.completed_payouts_count ??
        data.completedPayoutsCount ??
        0
    );

    const pendingDisbursementsAmount = Number(
      (typeof disbursementsObj === "object" && disbursementsObj !== null
        ? disbursementsObj.pending_amount
        : undefined) ??
        data.pending_disbursements_amount ??
        0
    );
    const pendingDisbursementsFormatted =
      typeof disbursementsObj === "object" && disbursementsObj !== null
        ? disbursementsObj.pending_formatted
        : undefined;

    // 6. System Staff
    const systemStaffObj = data.system_staff ?? data.systemStaff ?? {};
    const totalStaff = Number(
      (typeof systemStaffObj === "object" && systemStaffObj !== null
        ? systemStaffObj.total
        : undefined) ??
        data.total_staff ??
        data.totalStaff ??
        data.staff_count ??
        0
    );

    const activeStaff = Number(
      (typeof systemStaffObj === "object" && systemStaffObj !== null
        ? systemStaffObj.active_officers
        : undefined) ??
        data.active_staff ??
        data.activeStaff ??
        data.active_officers ??
        totalStaff
    );

    const financeStaff = Number(
      data.finance_staff ??
        data.financeStaff ??
        data.finance_officers ??
        0
    );

    const supportStaff = Number(
      data.support_staff ??
        data.supportStaff ??
        data.support_officers ??
        0
    );

    const superAdmins = Number(
      data.super_admins ??
        data.superAdmins ??
        data.admin_staff ??
        0
    );

    const pendingTierRequests = Number(
      data.pending_tier_requests ??
        data.pendingTierRequests ??
        data.pending_upgrades ??
        0
    );

    // 7. Tiers
    const rawTiers = Array.isArray(data.tiers) ? data.tiers : [];
    const tiers: TierItem[] = rawTiers.map((t: Record<string, unknown>) => ({
      id: (t.id as number | string) || 0,
      name: String(t.name || ""),
      level: Number(t.level || 1),
      no_of_staff: (t.no_of_staff as string | number) ?? "—",
      requirements: String(t.requirements || ""),
      amount: t.amount,
      created_at: t.created_at as string | undefined,
      updated_at: t.updated_at as string | undefined,
    }));

    return {
      totalCompanies,
      activeCompanies,
      inactiveCompanies,
      verifiedCompanies,
      pendingCompanies,
      totalStaff,
      activeStaff,
      financeStaff,
      supportStaff,
      superAdmins,
      totalPlatformVolume: totalPlatformVolume || (totalClearedDeposits + totalDisbursed),
      totalVolume: totalPlatformVolume || (totalClearedDeposits + totalDisbursed),
      totalClearedDeposits,
      clearedLiquidityFormatted,
      pendingDepositsCount,
      pendingDepositsVolume,
      pendingDepositsFormatted,
      totalDisbursed,
      disbursementsFormatted,
      completedPayoutsCount,
      pendingDisbursementsAmount,
      pendingDisbursementsFormatted,
      pendingVerifications,
      pendingTierRequests,
      tiers,
      raw: data,
    };
  } catch (error) {
    console.warn("Could not fetch admin-stats:", error);
    return {
      totalCompanies: 0,
      activeCompanies: 0,
      inactiveCompanies: 0,
      verifiedCompanies: 0,
      pendingCompanies: 0,
      totalStaff: 0,
      activeStaff: 0,
      financeStaff: 0,
      supportStaff: 0,
      superAdmins: 0,
      totalPlatformVolume: 0,
      totalVolume: 0,
      totalClearedDeposits: 0,
      pendingDepositsCount: 0,
      pendingDepositsVolume: 0,
      totalDisbursed: 0,
      completedPayoutsCount: 0,
      pendingDisbursementsAmount: 0,
      pendingVerifications: 0,
      pendingTierRequests: 0,
      tiers: [],
    };
  }
};
