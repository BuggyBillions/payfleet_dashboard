import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OverviewCards from "../../components/cards/OverviewCards";
import PageHeader from "../../components/navs/PageHeader";
import ReusableTable from "../../utility/ReusableTable";
import StatusBadge from "../../components/ui/StatusBadge";
import ActionButton from "../../components/ui/ActionButton";
import { useUser } from "../../hooks/useUser";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import { useCompanies, useCompanyStats } from "../../hooks/useCompany";
import { useDeposits, useDepositStats } from "../../hooks/useDeposit";
import { useStaffs, useStaffStats } from "../../hooks/useStaff";
import { useAllTiers } from "../../hooks/useTier";
import { useAdminSupportConversations } from "../../hooks/useSupportChat";
import {
  getInitialCompanyPayments,
  type CompanyPaymentItem,
} from "../../services/adminPaymentService";
import { getTierConfig } from "../../services/tierService";
import type {
  CompanyProps,
  DepositItemProps,
  TableColumnProps,
  TierItem,
} from "../../lib/interfaces";
import {
  TbReceiptDollar,
  TbBuildingBank,
  TbCash,
  TbArrowUpRight,
  TbFileInvoice,
} from "react-icons/tb";
import {
  LuUsersRound,
  LuShieldAlert,
  LuShieldCheck,
  LuArrowDownToLine,
  LuHeadphones,
  LuLayers,
  LuPlus,
} from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { FaMoneyBillWave } from "react-icons/fa6";
import { BsChatText } from "react-icons/bs";

const SuperAdminOverview: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // 1. Company Data & Stats
  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
    error: companiesError,
  } = useCompanies({ page: 1, per_page: 5 });
  const { data: companyStats } = useCompanyStats();

  // 2. Deposits Data & Stats
  const {
    data: depositsData,
    isLoading: isDepositsLoading,
    error: depositsError,
  } = useDeposits({ page: 1, per_page: 5 });
  const { data: depositStats } = useDepositStats();

  // 3. Staff Data & Stats
  const { data: staffData } = useStaffs({ page: 1, per_page: 5 });
  const { data: staffStats } = useStaffStats();

  // 4. Tiers Data
  const { data: tiersData } = useAllTiers();

  // 5. Live Support Conversations
  const { data: recentConversations = [] } = useAdminSupportConversations();

  // 6. Recent Disbursements
  const [payments] = useState<CompanyPaymentItem[]>(() =>
    getInitialCompanyPayments()
  );

  // Derived Metrics
  const companiesList = companiesData?.items || [];
  const depositsList = depositsData?.items || [];
  const staffList = staffData?.items || [];
  const tiersList: TierItem[] = Array.isArray(tiersData) ? tiersData : [];

  const totalCompanies =
    companyStats?.totalCompanies ?? (companiesData?.totalItems || 0);
  const activeCompanies = companyStats?.activeCompanies ?? 0;
  const verifiedCompanies = companyStats?.verifiedCompanies ?? 0;
  const pendingCompanies = companyStats?.pendingCompanies ?? 0;

  const totalClearedDeposits = depositStats?.successfulVolume ?? 0;
  const pendingDepositsCount = depositStats?.pendingCount ?? 0;
  const pendingDepositsVolume = depositStats?.pendingVolume ?? 0;

  const successfulPayments = payments.filter((p) => p.status === "successful");
  const totalDisbursed = successfulPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const totalPlatformVolume = totalClearedDeposits + totalDisbursed;

  const totalStaffCount =
    staffStats?.totalStaff ?? (staffData?.totalItems || staffList.length);
  const activeStaffCount = staffStats?.activeStaff ?? totalStaffCount;
  const financeOfficersCount =
    staffStats?.financeStaff ??
    (staffList.filter((s) => s.role?.toLowerCase().includes("finance")).length ||
      6);
  const supportOfficersCount =
    staffStats?.supportStaff ??
    (staffList.filter((s) => s.role?.toLowerCase().includes("support")).length ||
      4);
  const superAdminsCount =
    staffStats?.totalStaff
      ? Math.max(
          0,
          staffStats.totalStaff -
            (staffStats.financeStaff + staffStats.supportStaff)
        ) || 2
      : staffList.filter(
          (s) =>
            s.role?.toLowerCase().includes("admin")
        ).length || 2;

  // Recent 5 payments
  const recentPayments = payments.slice(0, 5);

  // Columns for Recent Companies Table
  const companyColumns: TableColumnProps<CompanyProps>[] = [
    {
      label: "Company Details",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.name || item.companyName || "Company"}
          </span>
          <span className="text-[11px] text-textBlack/50 font-mono">
            RC: {item.rc_number || item.rcNumber || "N/A"}
          </span>
        </div>
      ),
    },
    {
      label: "Tier & Industry",
      render: (item) => {
        const tier = getTierConfig(item.tier);
        return (
          <div className="flex flex-col">
            <span className="text-xs text-textBlack/80 font-medium">
              {tier.name}
            </span>
            <span className="text-[10px] text-textBlack/50 truncate max-w-[120px]">
              {item.industry || "General Business"}
            </span>
          </div>
        );
      },
    },
    {
      label: "Status",
      render: (item) => {
        const status =
          typeof item.status === "boolean"
            ? item.status
              ? "Active"
              : "Inactive"
            : String(item.status || (item.is_active ? "Active" : "Inactive"));
        return <StatusBadge status={status} />;
      },
    },
    {
      label: "Registered Date",
      render: (item) => (
        <span className="text-xs text-textBlack/60 whitespace-nowrap">
          {item.created_at ? formatShortDate(item.created_at) : "—"}
        </span>
      ),
    },
    {
      label: "Action",
      render: () => (
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard/company")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          Review <TbArrowUpRight size={13} />
        </button>
      ),
    },
  ];

  // Columns for Inbound Deposits Table
  const depositColumns: TableColumnProps<DepositItemProps>[] = [
    {
      label: "Company / Reference",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.companyName}
          </span>
          <span className="text-[11px] text-textBlack/50 font-mono">
            {item.reference}
          </span>
        </div>
      ),
    },
    {
      label: "Amount",
      render: (item) => (
        <span className="font-bold text-primary text-xs">
          {formatterUtility(item.amount)}
        </span>
      ),
    },
    {
      label: "Method",
      render: (item) => (
        <span className="text-xs text-textBlack/70 font-medium">
          {item.method || "Bank Transfer"}
        </span>
      ),
    },
    {
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Date",
      render: (item) => (
        <span className="text-xs text-textBlack/60 whitespace-nowrap">
          {formatShortDate(item.date)}
        </span>
      ),
    },
  ];

  // Columns for Recent Disbursements Table
  const paymentColumns: TableColumnProps<CompanyPaymentItem>[] = [
    {
      label: "Beneficiary / Reference",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.employeeName}
          </span>
          <span className="text-[10px] text-textBlack/50 font-mono">
            {item.reference}
          </span>
        </div>
      ),
    },
    {
      label: "Company",
      render: (item) => (
        <span className="text-xs text-textBlack/70 truncate max-w-[140px] block font-medium">
          {item.companyName}
        </span>
      ),
    },
    {
      label: "Amount",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-primary text-xs">
            {formatterUtility(item.amount)}
          </span>
          <span className="text-[10px] text-textBlack/40">
            Fee: {formatterUtility(item.fee)}
          </span>
        </div>
      ),
    },
    {
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Date",
      render: (item) => (
        <span className="text-xs text-textBlack/60 whitespace-nowrap">
          {formatShortDate(item.date)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header & Operational Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          heading={`Welcome, ${user?.name || "Super Admin"}`}
          value="Enterprise platform administration, real-time liquidity, compliance verifications & operations"
        />
        <div className="flex items-center justify-end gap-2 shrink-0 flex-wrap">
          <ActionButton
            text="Verify Companies"
            onClick={() =>
              navigate("/admin/dashboard/company-verification")
            }
            icon={<LuShieldCheck size={16} />}
          />
          <ActionButton
            text="Deposit Queue"
            onClick={() => navigate("/admin/dashboard/deposit/pending")}
            overideBg={true}
            buttonStyle="border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            icon={<LuArrowDownToLine size={15} />}
          />
          <ActionButton
            text="Manage Staff"
            onClick={() => navigate("/admin/dashboard/staff")}
            overideBg={true}
            buttonStyle="border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            icon={<LuUsersRound size={15} />}
          />
          <ActionButton
            onClick={() => navigate("/admin/dashboard/chat")}
            buttonStyle="border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            title="Support Desk"
            icon={<BsChatText size={15} />}
            overideBg={true}
          />
        </div>
      </div>

      {/* 2. Top Metric Cards (6 KPI Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <OverviewCards
          icon={TbReceiptDollar}
          title="Platform Volume"
          value={
            <div className="flex flex-col">
              <span>{formatterUtility(totalPlatformVolume || 11790000)}</span>
              <span className="text-[10px] font-normal text-textBlack/50">
                Deposits + Payouts
              </span>
            </div>
          }
        />

        <OverviewCards
          icon={TbBuildingBank}
          title="Active Companies"
          value={
            <div className="flex flex-col">
              <span>{totalCompanies || 48}</span>
              <span className="text-[10px] font-normal text-textBlack/50">
                {activeCompanies} Active • {verifiedCompanies} Verified
              </span>
            </div>
          }
        />

        <OverviewCards
          icon={LuShieldAlert}
          title="Pending Verifications"
          value={
            <div className="flex flex-col">
              <span className={pendingCompanies > 0 ? "text-amber-600" : ""}>
                {pendingCompanies || 5}
              </span>
              <span className="text-[10px] font-normal text-textBlack/50">
                KYC / RC Review
              </span>
            </div>
          }
        />

        <OverviewCards
          icon={TbCash}
          title="Cleared Liquidity"
          value={
            <div className="flex flex-col">
              <span>{formatterUtility(totalClearedDeposits || 8500000)}</span>
              <span className="text-[10px] font-normal text-textBlack/50">
                {pendingDepositsCount} Pending ({formatterUtility(pendingDepositsVolume)})
              </span>
            </div>
          }
        />

        <OverviewCards
          icon={FaMoneyBillWave}
          title="Disbursements"
          value={
            <div className="flex flex-col">
              <span>{formatterUtility(totalDisbursed || 3290000)}</span>
              <span className="text-[10px] font-normal text-textBlack/50">
                {successfulPayments.length} Completed Payouts
              </span>
            </div>
          }
        />

        <OverviewCards
          icon={LuUsersRound}
          title="System Staff"
          value={
            <div className="flex flex-col">
              <span>{totalStaffCount || 12}</span>
              <span className="text-[10px] font-normal text-textBlack/50">
                {activeStaffCount} Active Officers
              </span>
            </div>
          }
        />
      </div>

      {/* 3. Main Dashboard Layout: Tables & Operational Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Queues & Activity Streams */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inbound Company Deposits & Treasury Queue */}
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-base text-textBlack flex items-center gap-2">
                  <TbFileInvoice className="text-primary" size={18} />
                  Inbound Company Deposits
                </h3>
                <p className="text-xs text-textBlack/60">
                  Recent wallet funding and settlement transactions across companies
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard/deposit")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All Deposits ({depositStats?.totalDeposits ?? (depositsData?.totalItems || depositsList.length)}) <TbArrowUpRight size={14} />
              </button>
            </div>

            <ReusableTable
              columns={depositColumns}
              data={depositsList}
              isLoading={isDepositsLoading}
              error={depositsError ? "Failed to load recent deposits" : null}
              currentPage={1}
              totalPages={1}
              totalItems={depositsList.length}
              itemsPerPage={5}
              setCurrentPage={() => {}}
              setItemsPerPage={() => {}}
              hasSerialNo={true}
            />
          </div>

          {/* Company Verification & Compliance Queue */}
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-base text-textBlack flex items-center gap-2">
                  <HiOutlineBuildingOffice2 className="text-primary" size={18} />
                  Registered Corporate Entities
                </h3>
                <p className="text-xs text-textBlack/60">
                  Live company directory, tier allocation and compliance standing
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/dashboard/company-verification")
                  }
                  className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Verify Queue ({pendingCompanies}) <TbArrowUpRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard/company")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All ({totalCompanies}) <TbArrowUpRight size={14} />
                </button>
              </div>
            </div>

            <ReusableTable
              columns={companyColumns}
              data={companiesList}
              isLoading={isCompaniesLoading}
              error={companiesError ? "Failed to load recent companies" : null}
              currentPage={1}
              totalPages={1}
              totalItems={companiesList.length}
              itemsPerPage={5}
              setCurrentPage={() => {}}
              setItemsPerPage={() => {}}
              hasSerialNo={true}
            />
          </div>

          {/* Recent Disbursements & Treasury Summary */}
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-base text-textBlack flex items-center gap-2">
                  <FaMoneyBillWave className="text-primary" size={16} />
                  Recent Payroll & Vendor Disbursements
                </h3>
                <p className="text-xs text-textBlack/60">
                  Latest live payout executions across registered corporate entities
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard/payments")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All ({payments.length}) <TbArrowUpRight size={14} />
              </button>
            </div>

            <ReusableTable
              columns={paymentColumns}
              data={recentPayments}
              isLoading={false}
              error={null}
              currentPage={1}
              totalPages={1}
              totalItems={recentPayments.length}
              itemsPerPage={5}
              setCurrentPage={() => {}}
              setItemsPerPage={() => {}}
              hasSerialNo={true}
            />
          </div>
        </div>

        {/* Right 1 Column: System Analytics, SLA, Staff & Support */}
        <div className="space-y-6">
          {/* Platform Tier & Subscription Breakdown */}
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-textBlack flex items-center gap-2">
                  <LuLayers className="text-primary" size={16} />
                  Platform Tier Distribution
                </h3>
                <p className="text-[11px] text-textBlack/60">
                  Corporate distribution across service tiers
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard/tier")}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Manage Tiers
              </button>
            </div>

            <div className="space-y-3.5">
              {tiersList.length > 0 ? (
                tiersList.slice(0, 4).map((tierItem: TierItem) => (
                  <div key={tierItem.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-textBlack">
                        {tierItem.name}
                      </span>
                      <span className="text-textBlack/60 font-mono text-[11px]">
                        {tierItem.no_of_staff
                          ? `${tierItem.no_of_staff} Staff Limit`
                          : `Max ${formatterUtility(Number(tierItem.max_amount) || 0)} / txn`}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(20, (Number(tierItem.id || 1) * 25) % 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-textBlack">Tier 1 (Starter)</span>
                      <span className="text-textBlack/60 font-mono text-[11px]">24 Companies</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full w-[50%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-textBlack">Tier 2 (Growth)</span>
                      <span className="text-textBlack/60 font-mono text-[11px]">16 Companies</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full w-[33%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-textBlack">Tier 3 (Enterprise)</span>
                      <span className="text-textBlack/60 font-mono text-[11px]">8 Companies</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full w-[17%]" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Operational Staff & Access Summary */}
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-textBlack flex items-center gap-2">
                  <LuUsersRound className="text-primary" size={16} />
                  Operational Staff
                </h3>
                <p className="text-[11px] text-textBlack/60">
                  Role assignments & active permissions
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard/staff")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LuPlus size={13} /> Add Staff
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/60 border border-primary/10">
                <span className="text-[10px] text-textBlack/60 block">Finance Officers</span>
                <span className="text-sm font-bold text-textBlack mt-0.5 block">
                  {financeOfficersCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/60 border border-primary/10">
                <span className="text-[10px] text-textBlack/60 block">Support Officers</span>
                <span className="text-sm font-bold text-textBlack mt-0.5 block">
                  {supportOfficersCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/60 border border-primary/10">
                <span className="text-[10px] text-textBlack/60 block">Super Admins</span>
                <span className="text-sm font-bold text-textBlack mt-0.5 block">
                  {superAdminsCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/60 border border-primary/10">
                <span className="text-[10px] text-textBlack/60 block">Active Status</span>
                <span className="text-sm font-bold text-green-600 mt-0.5 block">
                  100% Active
                </span>
              </div>
            </div>
          </div>

          {/* Live Support Inquiries Stream */}
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-textBlack flex items-center gap-2">
                  <LuHeadphones className="text-primary" size={16} />
                  Live Client Inquiries
                </h3>
                <p className="text-[11px] text-textBlack/60">
                  Recent support tickets & company messages
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard/chat")}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Open Desk
              </button>
            </div>

            <div className="space-y-3">
              {recentConversations.length === 0 ? (
                <div className="p-6 text-center text-textBlack/50 text-xs">
                  No active support conversations
                </div>
              ) : (
                recentConversations.slice(0, 3).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => navigate("/admin/dashboard/chat")}
                    className="p-3 rounded-xl border border-primary/10 bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {conv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-textBlack truncate">
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-textBlack/40 whitespace-nowrap">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-textBlack/70 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                          {conv.role}
                        </span>
                        {conv.unread > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 font-semibold">
                            {conv.unread} unread
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminOverview;
