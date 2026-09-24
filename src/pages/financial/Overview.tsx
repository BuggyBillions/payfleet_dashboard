import React from "react";
import ReusableTable from "../../utility/ReusableTable";
import OverviewCards from "../../components/cards/OverviewCards";
import type { TableColumnProps } from "../../lib/interfaces";
import { TbChecklist, TbClockHour4, TbCash } from "react-icons/tb";
import { FaMoneyBillWave } from "react-icons/fa6";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import {
  getDemoApprovals,
  type DemoApproval,
} from "../../services/demoApprovalService";
import { getDemoPayments } from "../../services/demoPaymentService";

const statusBadge = (status: DemoApproval["status"]) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    approved: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    declined: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const FinancialOverview: React.FC = () => {
  const approvals = getDemoApprovals();
  const payments = getDemoPayments();

  const pendingCount = approvals.filter((r) => r.status === "pending").length;
  const approvedCount = approvals.filter((r) => r.status === "approved").length;
  const approvedDepositAmount = approvals
    .filter((r) => r.type === "deposit" && r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);
  const paidOut = payments
    .filter((p) => p.status === "successful")
    .reduce((sum, p) => sum + p.amount, 0);

  const recentTransactions = approvals.slice(0, 5);

  const columns: TableColumnProps<DemoApproval>[] = [
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold uppercase text-textBlack font-mono text-xs">
          {item.reference}
        </span>
      ),
    },
    {
      label: "Company",
      render: (item) => (
        <span className="font-medium text-textBlack text-xs">{item.company}</span>
      ),
    },
    {
      label: "Type",
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium capitalize">
          {item.type}
        </span>
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
      render: (item) => statusBadge(item.status),
    },
    {
      label: "Date",
      render: (item) => (
        <span className="text-textBlack/60 text-xs">{formatShortDate(item.date)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-textBlack">Financial Overview</h2>
        <p className="text-xs text-textBlack/60">
          Track company deposits, approvals, and payroll payouts
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={TbClockHour4}
          title="Pending Approvals"
          value={pendingCount}
        />
        <OverviewCards
          icon={TbChecklist}
          title="Approved Requests"
          value={approvedCount}
        />
        <OverviewCards
          icon={TbCash}
          title="Approved Deposits"
          value={formatterUtility(approvedDepositAmount)}
        />
        <OverviewCards
          icon={FaMoneyBillWave}
          title="Total Paid Out"
          value={formatterUtility(paidOut)}
        />
      </div>

      <div className="bg-tertiary rounded-xl p-5 border border-primary/10 space-y-3">
        <div className="flex flex-col">
          <h3 className="font-semibold text-base text-textBlack">Recent Transactions</h3>
          <p className="text-xs text-textBlack/60">
            Latest approval and deposit activity
          </p>
        </div>
        <ReusableTable
          columns={columns}
          data={recentTransactions}
          isLoading={false}
          error={null}
          currentPage={1}
          totalPages={1}
          totalItems={recentTransactions.length}
          itemsPerPage={5}
          setCurrentPage={() => {}}
          setItemsPerPage={() => {}}
          hasSerialNo={true}
        />
      </div>
    </div>
  );
};

export default FinancialOverview;