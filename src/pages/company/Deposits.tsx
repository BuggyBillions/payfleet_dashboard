import React, { useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps } from "../../lib/interfaces";
import { TbReceiptDollar } from "react-icons/tb";
import { LuWallet } from "react-icons/lu";
import { toast } from "sonner";
import { FiCopy } from "react-icons/fi";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import {
  getDemoDeposits,
  type DemoDeposit,
} from "../../services/demoDepositService";

const statusBadge = (status: DemoDeposit["status"]) => {
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

const Deposits: React.FC = () => {
  const [deposits] = useState<DemoDeposit[]>(() => getDemoDeposits());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalItems = deposits.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = deposits.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText("9817625028");
      toast.success("Account number copied");
    } catch {
      toast.error("Failed to copy account number");
    }
  };

  const columns: TableColumnProps<DemoDeposit>[] = [
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold uppercase">{item.reference}</span>
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
          <h2 className="text-lg font-semibold">Deposits</h2>
          <p className="text-sm text-gray-500">
            Fund your account and view your available balance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <div className="flex items-center justify-start gap-3 p-3 mt-3 rounded-lg bg-secondary border border-primary/10 text-tableData">
          <TbReceiptDollar size={18} className="text-tableHeading shrink-0" />
          <div className="flex flex-col gap-0.5 text-start">
            <p className="text-[10px] text-tableHeading">Account Balance</p>
            <p className="text-xl font-semibold">{formatterUtility(0)}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 p-3 mt-3 rounded-lg bg-secondary border border-primary/10 text-tableData">
          <div className="flex items-center justify-start gap-2">
            <LuWallet size={18} className="text-tableHeading shrink-0" />
            <span className="font-semibold tracking-widest text-sm">
              9817625028
            </span>
            <button
              type="button"
              title="Copy account number"
              onClick={copyAccountNumber}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-primary/15 text-primary hover:bg-primary/10 transition cursor-pointer"
            >
              <FiCopy size={11} />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-start">
            <div className="flex items-center justify-start gap-2">
              <span className="text-tableHeading">Bank:</span>
              <span className="font-semibold">Wema Bank</span>
            </div>
            <div className="flex items-center justify-start gap-2">
              <span className="text-tableHeading">Account Name:</span>
              <span className="font-semibold">
                WELLTHRIXINTE/COMPANY TICKETPENTY
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold">Deposit History</h3>
          <p className="text-xs text-gray-500">
            View all deposits made into your account
          </p>
        </div>
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

export default Deposits;