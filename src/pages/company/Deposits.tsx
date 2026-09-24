import React, { useMemo, useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps } from "../../lib/interfaces";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import {
  getDemoDeposits,
  type DemoDeposit,
} from "../../services/demoDepositService";
import ActionButton from "../../components/ui/ActionButton";
import { FaPlus } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import Deposit from "../../components/modal/Deposit";

const statusBadge = (status: DemoDeposit["status"]) => {
  const styles = {
    successful: "bg-green-50 text-green-700 border-green-500/30",
    pending: "bg-amber-50 text-amber-700 border-amber-500/30",
    failed: "bg-red-50 text-red-700 border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const Deposits: React.FC = () => {
  const [deposits, setDeposits] = useState<DemoDeposit[]>(() => getDemoDeposits());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [initiate, setInitiate] = useState(false);

  // Compute live statistics and available wallet balance
  const totalBalance = useMemo(() => {
    return deposits
      .filter((d) => d.status === "successful")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [deposits]);

  const pendingAmount = useMemo(() => {
    return deposits
      .filter((d) => d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [deposits]);

  const successfulCount = useMemo(() => {
    return deposits.filter((d) => d.status === "successful").length;
  }, [deposits]);

  // Filter deposits based on search and status
  const filteredDeposits = useMemo(() => {
    return deposits.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.amount.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deposits, searchTerm, statusFilter]);

  const totalItems = filteredDeposits.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDeposits.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDeposits, currentPage, itemsPerPage]);

  const handleDepositSuccess = (newDeposit: DemoDeposit) => {
    setDeposits((prev) => [newDeposit, ...prev]);
  };

  const columns: TableColumnProps<DemoDeposit>[] = [
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold uppercase tracking-wider text-xs text-gray-800">
          {item.reference}
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
      label: "Date & Time",
      render: (item) => (
        <span className="text-gray-500 text-xs">
          {formatShortDate(item.date)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900">Deposits & Wallet</h2>
          <p className="text-sm text-gray-500">
            Fund your business account and manage all incoming deposit transactions.
          </p>
        </div>
        <div>
          <ActionButton
            text="Deposit Funds"
            icon={<FaPlus />}
            onClick={() => setInitiate(true)}
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Available Account Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatterUtility(totalBalance)}</p>
            <span className="text-[11px] text-green-600 font-medium flex items-center gap-1 mt-1">
              Ready for Payroll Payouts
            </span>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Pending Deposits</p>
            <p className="text-2xl font-bold">{formatterUtility(pendingAmount)}</p>
            <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
              Awaiting Bank Confirmation
            </span>
          </div>
        </div>

        {/* Successful Deposits Count */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Successful Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{successfulCount}</p>
            <span className="text-[11px] text-gray-500 font-medium mt-1">
              Total lifetime deposits
            </span>
          </div>
        </div>
      </div>

      {/* Deposit History Table Section */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-gray-900">Deposit History</h3>
            <p className="text-xs text-gray-500">
              Complete audit log of all account funding and virtual bank transfers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 text-xs rounded-lg border border-primary/10 bg-secondary outline-none text-gray-700"
            >
              <option value="all">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search reference or channel..."
                className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs outline-none w-56 md:w-64"
              />
            </div>
          </div>
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
          hasSerialNo={true}
        />
      </div>

      {/* Payment Gateway Modal */}
      {initiate && (
        <Deposit
          onClose={() => setInitiate(false)}
          onDepositSuccess={handleDepositSuccess}
        />
      )}
    </div>
  );
};

export default Deposits;