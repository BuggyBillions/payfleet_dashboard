import React, { useState } from "react";
import PageHeader from "../../components/navs/PageHeader";
import { useCompanyTierRequests, useAllTiers } from "../../hooks/useTier";
import { useUser } from "../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../../services/employeeService";
import UpgradeTierModal from "../../components/modal/tier/UpgradeTierModal";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatPrettyDate } from "../../helpers/formatterUtility";
import type { TierItem } from "../../lib/interfaces";
import {
  LuShieldCheck,
  LuSparkles,
  LuCheck,
  LuUsersRound,
  LuArrowUpRight,
  LuClock,
  LuLayers,
  LuFileText,
} from "react-icons/lu";
import { FiHelpCircle } from "react-icons/fi";

const Tier: React.FC = () => {
  const { user } = useUser();
  const companyId = user?.company_details?.id || user?.id;

  // Fetch all tiers dynamically from GET /all-tiers
  const { data: allTiers = [], isLoading: loadingTiers } = useAllTiers();

  // Determine current active tier
  const rawTier = user?.company_details?.tier ?? user?.tier;
  const currentTier: Partial<TierItem> | undefined = allTiers.find((t) => {
    if (typeof rawTier === "object" && rawTier !== null) {
      return String(t.id) === String((rawTier as { id?: number | string }).id);
    }
    return (
      String(t.id) === String(rawTier) ||
      String(t.level) === String(rawTier) ||
      String(t.name).toLowerCase() === String(rawTier).toLowerCase()
    );
  }) || (typeof rawTier === "object" && rawTier !== null ? (rawTier as Partial<TierItem>) : undefined);

  const currentLevel = Number(currentTier?.level ?? currentTier?.id ?? 1) || 1;
  const currentTierName = currentTier?.name || `Level ${currentLevel}`;

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTargetTier, setSelectedTargetTier] = useState<number | undefined>(undefined);

  // Fetch company employees to compute usage metrics
  const { data: employeesData } = useQuery({
    queryKey: ["employees", "tier_count", companyId],
    queryFn: () => getEmployees({ company_id: companyId, per_page: 100 }),
    enabled: Boolean(companyId),
  });

  const staffCount = employeesData?.totalItems ?? employeesData?.items?.length ?? 0;
  const rawMaxStaff = currentTier?.no_of_staff;
  const numericMaxStaff = Number(rawMaxStaff);
  const isUnlimitedStaff =
    String(rawMaxStaff).toLowerCase() === "unlimited" ||
    (!isNaN(numericMaxStaff) && numericMaxStaff <= 0);

  const staffPercentage = isUnlimitedStaff
    ? 15
    : !isNaN(numericMaxStaff) && numericMaxStaff > 0
    ? Math.min(100, Math.round((staffCount / numericMaxStaff) * 100))
    : 10;

  // Fetch upgrade requests for this company
  const { data: upgradeRequests = [] } = useCompanyTierRequests(companyId);
  const pendingRequest = upgradeRequests.find((r) => r.status === "pending");

  const handleOpenUpgrade = (targetTierId: number) => {
    setSelectedTargetTier(targetTierId);
    setUpgradeModalOpen(true);
  };

  // Find next higher tier if available
  const nextTier = allTiers
    .filter((t) => Number(t.level ?? t.id) > currentLevel)
    .sort((a, b) => Number(a.level ?? a.id) - Number(b.level ?? b.id))[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        heading="Tier & Subscription Management"
        value="View your current account limits, tier benefits, and unlock higher capabilities"
      />

      {/* Top Banner: Current Active Tier & Quick Limits */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary to-primary/85 text-white p-6 shadow-lg">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <LuShieldCheck className="text-sm" /> Current Plan: Level {currentLevel}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-medium">
                Active Tier
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {currentTierName}
            </h2>
            <p className="text-white/80 text-xs max-w-xl">
              {currentTier?.requirements
                ? `Compliance verified: ${currentTier.requirements}`
                : "Active corporate plan enabled on your account"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {pendingRequest ? (
              <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-xs text-white flex items-center gap-2">
                <LuClock className="text-sm text-amber-300 animate-spin" />
                <span>
                  Upgrade to Tier #{pendingRequest.requestedTier} Pending Review
                </span>
              </div>
            ) : nextTier ? (
              <button
                onClick={() => handleOpenUpgrade(Number(nextTier.id))}
                className="px-5 py-2.5 rounded-xl bg-white text-primary font-bold text-xs hover:bg-white/90 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LuSparkles className="text-sm" />
                <span>Upgrade to {nextTier.name} (Level {nextTier.level})</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5">
                <LuCheck className="text-sm" /> Highest Tier Active
              </div>
            )}
          </div>
        </div>

        {/* Usage Progress Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/15">
          {/* Staff usage */}
          <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <LuUsersRound className="text-sm" /> Employee Capacity
              </span>
              <span className="font-semibold text-white">
                {staffCount} / {isUnlimitedStaff ? "∞" : numericMaxStaff}
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${staffPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-white/70 mt-1 block">
              {!isUnlimitedStaff && !isNaN(numericMaxStaff)
                ? `${Math.max(0, numericMaxStaff - staffCount)} seats remaining`
                : "Unlimited employee onboarding permitted"}
            </span>
          </div>

          {/* Current Level */}
          <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-white/80 flex items-center gap-1.5">
              <LuLayers className="text-sm" /> Tier Level
            </div>
            <p className="text-base font-bold text-white mt-1">
              Level {currentLevel}
            </p>
            <span className="text-[10px] text-white/70">Assigned account hierarchy</span>
          </div>

          {/* Active Status */}
          <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-white/80 flex items-center gap-1.5">
              <LuShieldCheck className="text-sm" /> Verification Status
            </div>
            <p className="text-base font-bold text-white mt-1">
              Verified
            </p>
            <span className="text-[10px] text-white/70">Corporate payroll authorized</span>
          </div>
        </div>
      </div>

      {/* Available Tier Plans Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-textBlack">
            Available Tier Plans
          </h3>
          <p className="text-xs text-textBlack/60">
            Compare subscription levels and upgrade to unlock higher employee capacity
          </p>
        </div>

        {loadingTiers ? (
          <div className="py-12 text-center text-xs text-textBlack/50 animate-pulse">
            Loading subscription tiers from server...
          </div>
        ) : allTiers.length === 0 ? (
          <div className="py-12 text-center text-xs text-textBlack/50 bg-tertiary rounded-2xl border border-primary/10">
            No platform tiers configured currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allTiers.map((plan) => {
              const planLevel = Number(plan.level ?? plan.id);
              const isCurrent = planLevel === currentLevel || String(plan.id) === String(currentTier?.id);
              const isPendingThis =
                pendingRequest && String(pendingRequest.requestedTier) === String(plan.id);
              const canUpgrade = planLevel > currentLevel && !isCurrent;

              const reqTags = String(plan.requirements || "")
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl bg-tertiary border transition-all duration-200 flex flex-col justify-between p-6 shadow-xs ${
                    isCurrent
                      ? "border-primary ring-2 ring-primary/20 shadow-md"
                      : "border-primary/10"
                  }`}
                >
                  {/* Current Active Pill */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                      Current Active Plan
                    </div>
                  )}

                  <div>
                    {/* Plan Name & Badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-primary font-mono">
                          Level {plan.level}
                        </span>
                        <h4 className="text-lg font-bold text-textBlack mt-0.5">
                          {plan.name}
                        </h4>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="my-4 py-3 border-y border-primary/10 space-y-2 text-xs text-textBlack">
                      <div className="flex items-center justify-between">
                        <span className="text-textBlack/60">Staff Capacity:</span>
                        <span className="font-semibold text-textBlack">
                          {String(plan.no_of_staff).toLowerCase() === "unlimited"
                            ? "Unlimited Employees"
                            : `Max ${plan.no_of_staff} Employees`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-textBlack/60">Tier Level:</span>
                        <span className="font-semibold text-textBlack font-mono">
                          Level {plan.level}
                        </span>
                      </div>
                    </div>

                    {/* KYC Requirements */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-secondary border border-primary/10 text-[11px] mb-6">
                      <span className="font-semibold text-textBlack flex items-center gap-1">
                        <LuFileText className="text-primary text-xs" /> Compliance Requirements
                      </span>
                      {reqTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {reqTags.map((req, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-tertiary border border-primary/10 text-[10px] font-medium text-textBlack"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-textBlack/50">
                          Standard profile details required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plan Action CTA */}
                  <div>
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                      >
                        <LuCheck className="text-sm" /> Current Active Tier
                      </button>
                    ) : isPendingThis ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                      >
                        <LuClock className="text-sm animate-spin" /> Application Under Review
                      </button>
                    ) : canUpgrade ? (
                      <button
                        onClick={() => handleOpenUpgrade(Number(plan.id))}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Upgrade to {plan.name}</span>
                        <LuArrowUpRight className="text-sm" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-secondary text-textBlack/40 font-medium text-xs cursor-not-allowed border border-primary/10"
                      >
                        Included in Your Plan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade Applications History */}
      {upgradeRequests.length > 0 && (
        <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-textBlack">
                Tier Upgrade Applications History
              </h3>
              <p className="text-xs text-textBlack/60">
                Track status and admin reviews for your submitted upgrade requests
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {upgradeRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-secondary border border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-textBlack">
                      Application for Tier #{req.requestedTier}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-[11px] text-textBlack/60">
                    Submitted on {formatPrettyDate(req.createdAt)} • RC Number:{" "}
                    <span className="font-mono">{req.rcNumber || "N/A"}</span>
                  </p>
                  {req.rejectionReason && (
                    <p className="text-xs text-red-500 font-medium">
                      Rejection Reason: {req.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-primary">
                    {req.status === "approved"
                      ? "Upgrade Activated"
                      : req.status === "pending"
                      ? "Under Compliance Review"
                      : "Application Declined"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequently Asked Questions */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs">
          <FiHelpCircle className="text-base" />
          <span>Tier Upgrade FAQ</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-secondary border border-primary/10">
            <h5 className="text-xs font-semibold text-textBlack">
              How long does tier verification take?
            </h5>
            <p className="text-[11px] text-textBlack/70 mt-1">
              Applications are reviewed once CAC registration and compliance documents are submitted.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-secondary border border-primary/10">
            <h5 className="text-xs font-semibold text-textBlack">
              What happens when I hit my employee cap?
            </h5>
            <p className="text-[11px] text-textBlack/70 mt-1">
              You will be prompted to upgrade to a higher tier before adding additional employees beyond your plan's active limit.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Tier Modal */}
      {upgradeModalOpen && (
        <UpgradeTierModal
          defaultTier={selectedTargetTier}
          onClose={() => setUpgradeModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Tier;