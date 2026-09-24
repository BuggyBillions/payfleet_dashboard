import React, { useMemo, useState, useEffect } from "react";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps, DepositsProps, DemoDeposit } from "../../lib/interfaces";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import { getDemoDeposits } from "../../services/demoDepositService";
import ActionButton from "../../components/ui/ActionButton";
import OverviewCards from "../../components/cards/OverviewCards";
import { FaPlus } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { LuWallet, LuClock, LuCheck } from "react-icons/lu";
import Deposit from "../../components/modal/Deposit";

import StatusBadge from "../../components/ui/StatusBadge";

const Deposits: React.FC<DepositsProps> = ({ defaultFilter = "all" }) => {
  const [deposits, setDeposits] = useState<DemoDeposit[]>(() => getDemoDeposits());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [initiate, setInitiate] = useState(false);

  useEffect(() => {
    setStatusFilter(defaultFilter);
    setCurrentPage(1);
  }, [defaultFilter]);

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
        <span className="font-semibold uppercase tracking-wider text-xs text-textBlack">
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
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Date & Time",
      render: (item) => (
        <span className="text-textBlack/60 text-xs">
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
          <h2 className="text-lg font-semibold text-textBlack">
            {defaultFilter === "pending" ? "Pending Deposits" : "Deposits & Wallet"}
          </h2>
          <p className="text-xs text-textBlack/60">
            {defaultFilter === "pending"
              ? "Monitor and track incoming deposits awaiting bank confirmation."
              : "Fund your business account and manage all incoming deposit transactions."}
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
        <OverviewCards
          title="Available Account Balance"
          value={formatterUtility(totalBalance)}
          icon={LuWallet}
        />
        <OverviewCards
          title="Pending Deposits"
          value={formatterUtility(pendingAmount)}
          icon={LuClock}
        />
        <OverviewCards
          title="Successful Transactions"
          value={successfulCount.toString()}
          icon={LuCheck}
        />
      </div>

      {/* Deposit History Table Section */}
      <div className="bg-tertiary rounded-xl p-5 border border-primary/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-textBlack">
              {defaultFilter === "pending" ? "Pending Deposit Transactions" : "Deposit History"}
            </h3>
            <p className="text-xs text-textBlack/60">
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
              className="h-10 px-3 text-xs rounded-lg border border-primary/10 bg-secondary outline-none text-textBlack"
            >
              <option value="all">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search reference or channel..."
                className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack placeholder:text-textBlack/40 outline-none w-56 md:w-64"
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