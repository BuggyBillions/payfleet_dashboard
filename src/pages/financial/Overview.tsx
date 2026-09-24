import React from "react";
import ReusableTable from "../../utility/ReusableTable";
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
    pending: "bg-amber-50 text-amber-600 border-amber-500/30",
    approved: "bg-green-50 text-green-600 border-green-500/30",
    declined: "bg-red-50 text-red-600 border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
};

type CardProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string | number;
};

const Card: React.FC<CardProps> = ({ icon: Icon, title, value }) => (
  <div className="flex items-center gap-3 p-3 mt-3 rounded-lg bg-secondary border border-primary/10 text-tableData">
    <Icon size={18} className="text-tableHeading shrink-0" />
    <div className="flex flex-col gap-0.5 text-start">
      <p className="text-[10px] text-tableHeading">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const FinancialOverview: React.FC = () => {
  const approvals = getDemoApprovals();
  const payments = getDemoPayments();

  const pendingCount = approvals.filter(
    (r) => r.status === "pending",
  ).length;
  const approvedCount = approvals.filter(
    (r) => r.status === "approved",
  ).length;
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
        <span className="font-semibold uppercase">{item.reference}</span>
      ),
    },
    { label: "Company", key: "company" },
    {
      label: "Type",
      render: (item) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#2A5D56]/10 text-[#2A5D56] text-[10px] font-medium capitalize">
          {item.type}
        </span>
      ),
    },
    {
      label: "Amount",
      render: (item) => (
        <span className="font-semibold text-primary">
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
      render: (item) => <span>{formatShortDate(item.date)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">Financial Overview</h2>
        <p className="text-sm text-gray-500">
          Track company deposits, approvals and payouts
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <Card
          icon={TbClockHour4}
          title="Pending Approvals"
          value={pendingCount}
        />
        <Card icon={TbChecklist} title="Approved Requests" value={approvedCount} />
        <Card
          icon={TbCash}
          title="Approved Deposits"
          value={formatterUtility(approvedDepositAmount)}
        />
        <Card
          icon={FaMoneyBillWave}
          title="Paid Out"
          value={formatterUtility(paidOut)}
        />
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold">Recent Transactions</h3>
          <p className="text-xs text-gray-500">
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
        />
      </div>
    </div>
  );
};

export default FinancialOverview;