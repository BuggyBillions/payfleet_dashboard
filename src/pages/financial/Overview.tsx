import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../utility/ReusableTable";
import OverviewCards from "../../components/cards/OverviewCards";
import PageHeader from "../../components/navs/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import ActionButton from "../../components/ui/ActionButton";
import { useUser } from "../../hooks/useUser";
import { formatterUtility, formatShortDate } from "../../helpers/formatterUtility";
import type { DepositItemProps } from "../../lib/interfaces";
import { useDeposits, useDepositStats } from "../../hooks/useDeposit";
import { getInitialCompanyPayments, type CompanyPaymentItem } from "../../services/adminPaymentService";
import type { TableColumnProps } from "../../lib/interfaces";
import {
  TbClockHour4,
  TbCash,
  TbArrowUpRight,
  TbFileInvoice,
  TbBuildingBank,
  TbShieldCheck,
} from "react-icons/tb";
import { FaMoneyBillWave } from "react-icons/fa6";
import { LuArrowDownToLine, LuCheckCheck } from "react-icons/lu";
import { BsChatText } from "react-icons/bs";

const FinancialOverview: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: pendingData, isLoading: loadingPending } = useDeposits({
    status: "pending",
    per_page: 5,
  });
  const { data: statsData } = useDepositStats();
  const [payments] = useState<CompanyPaymentItem[]>(() => getInitialCompanyPayments());

  const deposits = statsData?.items ?? [];
  const pendingDepositsList = pendingData?.items ?? [];

  // Metrics calculations
  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const pendingDepositsCount = statsData ? pendingDeposits.length : (pendingData?.totalItems ?? pendingDepositsList.length);
  const pendingDepositsAmount = pendingDeposits.reduce((sum, d) => sum + d.amount, 0);

  const approvedDeposits = deposits.filter((d) => d.status === "successful");
  const approvedDepositsAmount = approvedDeposits.reduce((sum, d) => sum + d.amount, 0);

  const successfulPayments = payments.filter((p) => p.status === "successful");
  const totalPaidOut = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalFeesAccrued = payments.reduce((sum, p) => sum + p.fee, 0);

  // Recent disbursements (top 5)
  const recentPayments = payments.slice(0, 5);

  // Pending deposits columns
  const depositColumns: TableColumnProps<DepositItemProps>[] = [
    {
      label: "Company",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">{item.companyName}</span>
          <span className="text-[11px] text-textBlack/50 font-mono">{item.reference}</span>
        </div>
      ),
    },
    {
      label: "Bank Account",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs text-textBlack/80 font-medium">{item.bankName}</span>
          <span className="text-[11px] text-textBlack/50 font-mono">{item.accountNumber}</span>
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
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Submitted Date",
      render: (item) => (
        <span className="text-xs text-textBlack/60 whitespace-nowrap">
          {formatShortDate(item.date)}
        </span>
      ),
    },
    {
      label: "Action",
      render: () => (
        <button
          type="button"
          onClick={() => navigate("/financial/dashboard/deposit/pending")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          Verify <TbArrowUpRight size={14} />
        </button>
      ),
    },
  ];

  // Recent payouts columns
  const paymentColumns: TableColumnProps<CompanyPaymentItem>[] = [
    {
      label: "Beneficiary / Reference",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">{item.employeeName}</span>
          <span className="text-[10px] text-textBlack/50 font-mono">{item.reference}</span>
        </div>
      ),
    },
    {
      label: "Company",
      render: (item) => (
        <span className="text-xs text-textBlack/70 truncate max-w-[120px] block">
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
          <span className="text-[10px] text-textBlack/40">Fee: {formatterUtility(item.fee)}</span>
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
      {/* Page Header with Quick Navigation Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          heading={`Welcome, ${user?.first_name || "Finance Team"}`}
          value="Financial controller dashboard, treasury reconciliation, and payout disbursement audit"
        />
        <div className="flex items-center gap-2 shrink-0">
          <ActionButton
            text="Pending Deposits"
            onClick={() => navigate("/financial/dashboard/deposit/pending")}
            icon={<LuArrowDownToLine size={16} />}
          />
          <button
            type="button"
            onClick={() => navigate("/financial/dashboard/payments")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors text-xs font-semibold cursor-pointer"
          >
            <FaMoneyBillWave size={14} />
            Manage Payouts
          </button>
          <button
            type="button"
            onClick={() => navigate("/financial/dashboard/chat")}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors text-xs font-semibold cursor-pointer"
            title="Finance Chat Support"
          >
            <BsChatText size={15} />
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={TbClockHour4}
          title="Pending Deposits Queue"
          value={
            <div className="flex flex-col">
              <span>{pendingDepositsCount} pending</span>
              <span className="text-[11px] font-normal text-textBlack/60">
                {formatterUtility(pendingDepositsAmount)}
              </span>
            </div>
          }
        />
        <OverviewCards
          icon={TbCash}
          title="Cleared Deposit Liquidity"
          value={formatterUtility(approvedDepositsAmount)}
        />
        <OverviewCards
          icon={FaMoneyBillWave}
          title="Total Paid Out"
          value={formatterUtility(totalPaidOut)}
        />
        <OverviewCards
          icon={TbBuildingBank}
          title="Disbursement Volume"
          value={`${successfulPayments.length} Payouts`}
        />
      </div>

      {/* Pending Deposits Actionable Queue */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary/10 pb-3">
          <div>
            <h3 className="font-semibold text-base text-textBlack flex items-center gap-2">
              <TbFileInvoice className="text-primary" size={18} />
              Pending Deposit Verification Queue
            </h3>
            <p className="text-xs text-textBlack/60">
              Inbound bank transfers and wallet top-ups awaiting financial approval
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/financial/dashboard/deposit/pending")}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Queue ({pendingDepositsCount}) <TbArrowUpRight size={14} />
          </button>
        </div>

        <ReusableTable
          columns={depositColumns}
          data={pendingDepositsList}
          isLoading={loadingPending}
          error={null}
          currentPage={1}
          totalPages={1}
          totalItems={pendingDepositsList.length}
          itemsPerPage={5}
          setCurrentPage={() => {}}
          setItemsPerPage={() => {}}
          hasSerialNo={true}
        />
      </div>

      {/* Grid: Recent Disbursements & Treasury Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Disbursements Table (2 Columns) */}
        <div className="lg:col-span-2 bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-primary/10 pb-3">
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
              onClick={() => navigate("/financial/dashboard/payments")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <TbArrowUpRight size={14} />
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

        {/* Treasury & Settlement Health Card (1 Column) */}
        <div className="flex flex-col gap-6">
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-textBlack flex items-center gap-2">
                  <TbBuildingBank className="text-primary" size={16} />
                  Treasury Summary
                </h3>
                <p className="text-[11px] text-textBlack/60">
                  Float balance & settlement liquidity metrics
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-secondary/70 border border-primary/10">
                <span className="text-[11px] text-textBlack/60 block">
                  Total Processing Fees Collected
                </span>
                <span className="text-base font-bold text-primary mt-0.5 block font-mono">
                  {formatterUtility(totalFeesAccrued)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/70 border border-primary/10">
                <span className="text-[11px] text-textBlack/60 block">
                  Net Disbursal Throughput
                </span>
                <span className="text-base font-bold text-textBlack mt-0.5 block font-mono">
                  {formatterUtility(totalPaidOut)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-700 dark:text-green-400 font-semibold flex items-center gap-1.5">
                    <TbShieldCheck size={16} /> Settlement Rails
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                    Online (99.9%)
                  </span>
                </div>
                <p className="text-[11px] text-textBlack/60">
                  Direct NIBSS / NIP bank switches and clearing engines active.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-3">
            <h4 className="font-semibold text-xs text-textBlack flex items-center gap-1.5">
              <LuCheckCheck className="text-green-600" size={15} />
              Clearance & Settlement SLA
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-secondary/60 border border-primary/10">
                <span className="text-[10px] text-textBlack/60 block">Deposit Clearance</span>
                <span className="text-sm font-bold text-textBlack mt-0.5 block">&lt; 10 mins</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/60 border border-primary/10">
                <span className="text-[10px] text-textBlack/60 block">Disbursal Success</span>
                <span className="text-sm font-bold text-textBlack mt-0.5 block">99.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;