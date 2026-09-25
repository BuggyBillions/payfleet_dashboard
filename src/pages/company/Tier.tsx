import React, { useState } from "react";
import PageHeader from "../../components/navs/PageHeader";
import { TIER_PLANS, getTierConfig } from "../../services/tierService";
import { useCompanyTierRequests } from "../../hooks/useTier";
import { useUser } from "../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../../services/employeeService";
import UpgradeTierModal from "../../components/modal/tier/UpgradeTierModal";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatterUtility, formatPrettyDate } from "../../helpers/formatterUtility";
import {
  LuShieldCheck,
  LuSparkles,
  LuCheck,
  LuUsersRound,
  LuBuilding2,
  LuArrowUpRight,
  LuClock,
} from "react-icons/lu";
import { FiHelpCircle } from "react-icons/fi";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";

const Tier: React.FC = () => {
  const { user } = useUser();
  const companyId = user?.company_details?.id || user?.id;
  const currentTierConfig = getTierConfig(user?.company_details?.tier ?? user?.tier);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTargetTier, setSelectedTargetTier] = useState<number>(
    Math.min(3, currentTierConfig.id + 1)
  );

  // Fetch company employees to compute usage metrics
  const { data: employeesData } = useQuery({
    queryKey: ["employees", "tier_count", companyId],
    queryFn: () => getEmployees({ company_id: companyId, per_page: 100 }),
    enabled: Boolean(companyId),
  });

  const staffCount = employeesData?.totalItems ?? employeesData?.items?.length ?? 0;
  const maxStaff = currentTierConfig.maxEmployees;
  const staffPercentage =
    typeof maxStaff === "number"
      ? Math.min(100, Math.round((staffCount / maxStaff) * 100))
      : 15;

  // Fetch upgrade requests for this company
  const { data: upgradeRequests = [] } = useCompanyTierRequests(companyId);
  const pendingRequest = upgradeRequests.find((r) => r.status === "pending");

  const handleOpenUpgrade = (tierId: number) => {
    setSelectedTargetTier(tierId);
    setUpgradeModalOpen(true);
  };

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
                <LuShieldCheck className="text-sm" /> Current Plan: {currentTierConfig.badge}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-medium">
                Active & Verified
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {currentTierConfig.name} Package
            </h2>
            <p className="text-white/80 text-xs max-w-xl">
              {currentTierConfig.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {pendingRequest ? (
              <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-xs text-white flex items-center gap-2">
                <LuClock className="text-sm text-amber-300 animate-spin" />
                <span>
                  Upgrade to {getTierConfig(pendingRequest.requestedTier).badge} Pending Review
                </span>
              </div>
            ) : currentTierConfig.id < 3 ? (
              <button
                onClick={() => handleOpenUpgrade(currentTierConfig.id + 1)}
                className="px-5 py-2.5 rounded-xl bg-white text-primary font-bold text-xs hover:bg-white/90 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LuSparkles className="text-sm" />
                Upgrade to {getTierConfig(currentTierConfig.id + 1).badge}
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5">
                <LuCheck className="text-sm" /> Top Tier Active
              </div>
            )}
          </div>
        </div>

        {/* Usage Progress Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
          {/* Staff usage */}
          <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <LuUsersRound className="text-sm" /> Employee Capacity
              </span>
              <span className="font-semibold text-white">
                {staffCount} / {maxStaff === "Unlimited" ? "∞" : maxStaff}
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${staffPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-white/70 mt-1 block">
              {typeof maxStaff === "number"
                ? `${Math.max(0, maxStaff - staffCount)} seats available`
                : "Unlimited employee onboarding"}
            </span>
          </div>

          {/* Monthly Volume */}
          <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-white/80 flex items-center gap-1.5">
              <HiOutlineArrowTrendingUp className="text-sm" /> Monthly Payroll Limit
            </div>
            <p className="text-base font-bold text-white mt-1">
              {currentTierConfig.id === 3
                ? "Custom / Unlimited"
                : formatterUtility(currentTierConfig.monthlyVolumeLimit)}
            </p>
            <span className="text-[10px] text-white/70">Per calendar month cap</span>
          </div>

          {/* Single Transaction Cap */}
          <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-white/80 flex items-center gap-1.5">
              <LuBuilding2 className="text-sm" /> Single Transaction Limit
            </div>
            <p className="text-base font-bold text-white mt-1">
              {currentTierConfig.id === 3
                ? "Custom (₦25M+)"
                : formatterUtility(currentTierConfig.singleTransactionLimit)}
            </p>
            <span className="text-[10px] text-white/70">Max single payout limit</span>
          </div>

          {/* Bank Accounts */}
          <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-white/80 flex items-center gap-1.5">
              <LuShieldCheck className="text-sm" /> Settlement Banks
            </div>
            <p className="text-base font-bold text-white mt-1">
              {currentTierConfig.maxBankAccounts === "Unlimited"
                ? "Unlimited Banks"
                : `Up to ${currentTierConfig.maxBankAccounts} Account${currentTierConfig.maxBankAccounts > 1 ? "s" : ""}`}
            </p>
            <span className="text-[10px] text-white/70">Corporate payout routing</span>
          </div>
        </div>
      </div>

      {/* Tier Plans Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-textBlack">
            Available Tier Plans & Benefits
          </h3>
          <p className="text-xs text-textBlack/60">
            Compare plans to choose the best payroll capacity and features for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIER_PLANS.map((plan) => {
            const isCurrent = currentTierConfig.id === plan.id;
            const isPendingThis = pendingRequest && Number(pendingRequest.requestedTier) === plan.id;
            const canUpgrade = plan.id > currentTierConfig.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl bg-tertiary border transition-all duration-200 flex flex-col justify-between p-6 shadow-sm ${
                  isCurrent
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : plan.isPopular
                    ? "border-primary/40"
                    : "border-primary/10"
                }`}
              >
                {/* Popular / Current Pill */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                    Current Active Plan
                  </div>
                )}
                {plan.isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Plan Name & Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-primary">
                        {plan.badge}
                      </span>
                      <h4 className="text-lg font-bold text-textBlack mt-0.5">
                        {plan.name}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary text-textBlack border border-primary/10">
                      {plan.pricing}
                    </span>
                  </div>

                  <p className="text-xs text-textBlack/70 mt-2 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Highlights */}
                  <div className="my-4 py-3 border-y border-primary/10 space-y-1.5 text-xs text-textBlack">
                    <div className="flex items-center justify-between">
                      <span className="text-textBlack/60">Staff Cap:</span>
                      <span className="font-semibold text-textBlack">
                        {plan.maxEmployees === "Unlimited"
                          ? "Unlimited"
                          : `Max ${plan.maxEmployees} Employees`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textBlack/60">Monthly Limit:</span>
                      <span className="font-semibold text-textBlack">
                        {plan.id === 3 ? "Unlimited" : formatterUtility(plan.monthlyVolumeLimit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textBlack/60">Bank Accounts:</span>
                      <span className="font-semibold text-textBlack">
                        {plan.maxBankAccounts === "Unlimited"
                          ? "Unlimited"
                          : `${plan.maxBankAccounts} Account`}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-[11px] font-semibold text-textBlack/50 uppercase tracking-wider block">
                      Included Capabilities
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-textBlack/80">
                        <div className="rounded-full p-0.5 bg-primary/10 text-primary shrink-0 mt-0.5">
                          <LuCheck className="text-xs" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* KYC Requirements */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-secondary border border-primary/10 text-[11px] mb-6">
                    <span className="font-semibold text-textBlack flex items-center gap-1">
                      <LuShieldCheck className="text-primary text-xs" /> Required Verification
                    </span>
                    <ul className="space-y-1 text-textBlack/70">
                      {plan.kycRequirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
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
                      onClick={() => handleOpenUpgrade(plan.id)}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
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
      </div>

      {/* Upgrade Applications History */}
      {upgradeRequests.length > 0 && (
        <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
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
            {upgradeRequests.map((req) => {
              const reqTarget = getTierConfig(req.requestedTier);
              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-secondary border border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-textBlack">
                        Application for {reqTarget.name} ({reqTarget.badge})
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
              );
            })}
          </div>
        </div>
      )}

      {/* Frequently Asked Questions */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-3">
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
              Most Tier 2 applications are verified within 2 to 4 business hours once CAC registration and Tax ID numbers are confirmed.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-secondary border border-primary/10">
            <h5 className="text-xs font-semibold text-textBlack">
              What happens when I hit my employee cap?
            </h5>
            <p className="text-[11px] text-textBlack/70 mt-1">
              You will be prompted to upgrade to Tier 2 or Enterprise before adding additional employees beyond your plan's active limit.
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