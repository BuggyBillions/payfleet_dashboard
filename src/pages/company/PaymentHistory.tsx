import React, { useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
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

const statusBadge = (status: DemoPayment["status"]) => {
  const styles = {
    successful: "bg-green-50 text-green-600 border-green-500/30",
    pending: "bg-amber-50 text-amber-600 border-amber-500/30",
    failed: "bg-red-50 text-red-600 border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
};

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
      render: (item) => statusBadge(item.status),
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
          <h2 className="text-lg font-semibold">Payment History</h2>
          <p className="text-sm text-gray-500">
            View all money paid out to staff
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <div className="flex items-center gap-3 p-3 mt-3 rounded-lg bg-secondary border border-primary/10 text-tableData">
          <FaMoneyBillWave size={18} className="text-tableHeading shrink-0" />
          <div className="flex flex-col gap-0.5 text-start">
            <p className="text-[10px] text-tableHeading">Total Paid</p>
            <p className="text-xl font-semibold">{formatterUtility(totalPaid)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 mt-3 rounded-lg bg-secondary border border-primary/10 text-tableData">
          <LuHistory size={18} className="text-tableHeading shrink-0" />
          <div className="flex flex-col gap-0.5 text-start">
            <p className="text-[10px] text-tableHeading">Payments</p>
            <p className="text-xl font-semibold">{totalItems}</p>
          </div>
        </div>
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

export default PaymentHistory;