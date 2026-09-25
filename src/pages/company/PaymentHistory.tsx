import React, { useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import OverviewCards from "../../components/cards/OverviewCards";
import type { TableColumnProps } from "../../lib/interfaces";
import { LuHistory } from "react-icons/lu";
import { FaMoneyBillWave } from "react-icons/fa6";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import {
  getDemoPayments,
  type DemoPayment,
} from "../../services/demoPaymentService";
import StatusBadge from "../../components/ui/StatusBadge";

const PaymentHistory: React.FC = () => {
  const [payments] = useState<DemoPayment[]>(() => getDemoPayments());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalItems = payments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = payments.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const totalPaid = payments
    .filter((p) => p.status === "successful")
    .reduce((sum, p) => sum + p.amount, 0);

  const columns: TableColumnProps<DemoPayment>[] = [
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold uppercase">{item.reference}</span>
      ),
    },
    {
      label: "Employee",
      render: (item) => (
        <span className="font-semibold text-inherit">
          {item.employee_name}
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
    { label: "Method", key: "method" },
    {
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Date",
      render: (item) => <span>{formatShortDate(item.date)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">Payment History</h2>
          <p className="text-sm text-textBlack/50">
            View all money paid out to staff
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <OverviewCards
          title="Total Paid"
          value={formatterUtility(totalPaid)}
          icon={FaMoneyBillWave}
        />
        <OverviewCards
          title="Payments"
          value={totalItems}
          icon={LuHistory}
        />
      </div>

      <div className="bg-tertiary p-2">
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

export default PaymentHistory;