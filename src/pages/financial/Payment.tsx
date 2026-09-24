import React, { useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps } from "../../lib/interfaces";
import { toast } from "sonner";
import { FiCheck, FiX } from "react-icons/fi";
import { TbChecklist, TbClockHour4, TbCash } from "react-icons/tb";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import {
  getDemoApprovals,
  type DemoApproval,
} from "../../services/demoApprovalService";

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

const Payment: React.FC = () => {
  const [requests, setRequests] = useState<DemoApproval[]>(() =>
    getDemoApprovals(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const pendingAmount = requests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalItems = requests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = requests.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const handleApprove = (item: DemoApproval) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, status: "approved" } : r)),
    );
    toast.success(`${item.reference} approved`);
  };

  const handleDecline = (item: DemoApproval) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, status: "declined" } : r)),
    );
    toast.error(`${item.reference} declined`);
  };

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
      label: "Date",
      render: (item) => <span>{formatShortDate(item.date)}</span>,
    },
    {
      label: "Status",
      render: (item) =>
        item.status === "pending" ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleApprove(item)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium bg-primary text-white cursor-pointer"
            >
              <FiCheck size={11} />
              Approve
            </button>
            <button
              type="button"
              onClick={() => handleDecline(item)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium bg-red-500 text-white cursor-pointer"
            >
              <FiX size={11} />
              Decline
            </button>
          </div>
        ) : (
          statusBadge(item.status)
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">Approve Payments</h2>
        <p className="text-sm text-gray-500">
          Approve or decline payment and deposit requests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
        <Card
          icon={TbClockHour4}
          title="Pending Approvals"
          value={pendingCount}
        />
        <Card
          icon={TbChecklist}
          title="Approved Requests"
          value={approvedCount}
        />
        <Card
          icon={TbCash}
          title="Pending Amount"
          value={formatterUtility(pendingAmount)}
        />
      </div>

      <div className="bg-white rounded-xl p-4">
        <ReusableTable
          columns={columns}
          data={paginatedData}
          isLoading={false}
          error={null}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
    </div>
  );
};

export default Payment;