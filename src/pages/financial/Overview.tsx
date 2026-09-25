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
} from "react-icons/tb";
import { FaMoneyBillWave } from "react-icons/fa6";
import { LuArrowDownToLine } from "react-icons/lu";
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
  const pendingDepositsCount = statsData?.pendingCount ?? (pendingData?.totalItems ?? pendingDepositsList.length);
  const pendingDepositsAmount = statsData?.pendingVolume ?? pendingDeposits.reduce((sum, d) => sum + d.amount, 0);

  const approvedDeposits = deposits.filter((d) => d.status === "successful");
  const approvedDepositsAmount = statsData?.successfulVolume ?? approvedDeposits.reduce((sum, d) => sum + d.amount, 0);

  const successfulPayments = payments.filter((p) => p.status === "successful");
  const totalPaidOut = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

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
    }
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
        <span className="text-xs text-textBlack/70 truncate max-w-30 block">
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
        <div className="flex items-center justify-end gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <ActionButton
              text="Pending Deposits"
              onClick={() => navigate("/financial/dashboard/deposit/pending")}
              icon={<LuArrowDownToLine size={16} />}
            />
            <ActionButton
              onClick={() => navigate("/financial/dashboard/payments")}
              overideBg={true}
              buttonStyle=" border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              icon={<FaMoneyBillWave size={14} />}
              text="Manage Payouts"
            />
          </div>
          <ActionButton
            onClick={() => navigate("/financial/dashboard/chat")}
            buttonStyle=" border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            title="Finance Chat Support"
            icon={<BsChatText size={15} />}
            overideBg={true}
          />
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
        <div className="flex items-center flex-wrap lg:justify-between justify-end border-b border-primary/10 pb-3">
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
          setCurrentPage={() => { }}
          setItemsPerPage={() => { }}
          hasSerialNo={true}
        />
      </div>

      {/* Recent Disbursements & Treasury Summary */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
          <div className="flex items-center flex-wrap lg:justify-between justify-end border-b border-primary/10 pb-3">
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
            setCurrentPage={() => { }}
            setItemsPerPage={() => { }}
            hasSerialNo={true}
          />
      </div>
    </div>
  );
};

export default FinancialOverview;