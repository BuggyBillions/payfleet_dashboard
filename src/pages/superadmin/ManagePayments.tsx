import React, { useState, useMemo } from "react";
import ReusableTable from "../../utility/ReusableTable";
import Modal from "../../components/modal/Modal";
import ActionButton from "../../components/ui/ActionButton";
import OverviewCards from "../../components/cards/OverviewCards";
import { toast } from "sonner";
import { formatShortDate, formatterUtility } from "../../helpers/formatterUtility";
import { copyToClipboard } from "../../helpers/clipboardHelper";
import type { ManagePaymentsProps, TableColumnProps } from "../../lib/interfaces";
import {
  type CompanyPaymentItem,
} from "../../services/adminPaymentService";
import {
  useAdminPayments,
  useAdminPayment,
} from "../../hooks/useAdminPayments";
import { FiSearch, FiDownload, FiRefreshCw } from "react-icons/fi";
import {
  LuClock,
  LuCopy,
  LuCheck,
  LuShieldAlert,
  LuFilter,
  LuX,
  LuRotateCcw,
  LuCalendar,
} from "react-icons/lu";
import { TbReceiptDollar } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import StatusBadge from "../../components/ui/StatusBadge";
import { BsEye } from "react-icons/bs";


const SuperAdminManagePayments: React.FC<ManagePaymentsProps> = ({
  defaultFilter = "all",
  role = "admin",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [minAmountFilter, setMinAmountFilter] = useState<string>("");
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>("");

  // Filter Modal Temporary State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>("pending");
  const [tempCompany, setTempCompany] = useState<string>("all");
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  const [tempMinAmount, setTempMinAmount] = useState<string>("");
  const [tempMaxAmount, setTempMaxAmount] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [selectedPayment, setSelectedPayment] = useState<CompanyPaymentItem | null>(null);
  const [viewReceiptModal, setViewReceiptModal] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // 1. Live Payments Data via /admin-payment
  const {
    data: paymentsResponse,
    isLoading,
    error,
    refetch,
  } = useAdminPayments({
    page: currentPage,
    per_page: itemsPerPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm.trim() || undefined,
    date_from: startDateFilter || undefined,
    date_to: endDateFilter || undefined,
  });

  const payments = useMemo(() => paymentsResponse?.items || [], [paymentsResponse]);

  // 2. Live Single Payment Data via /each-payment/{id}
  const { data: eachPaymentData, isLoading: isLoadingEachPayment } = useAdminPayment(
    viewReceiptModal && selectedPayment?.id ? selectedPayment.id : null
  );
  const activePayment = eachPaymentData || selectedPayment;



  // Distinct company names for dropdown filter
  const companyOptions = useMemo(() => {
    const names = Array.from(new Set(payments.map((p) => p.companyName).filter(Boolean)));
    return names.sort();
  }, [payments]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all" && statusFilter !== "pending") count++;
    if (companyFilter !== "all") count++;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    if (minAmountFilter || maxAmountFilter) count++;
    return count;
  }, [
    statusFilter,
    companyFilter,
    startDateFilter,
    endDateFilter,
    minAmountFilter,
    maxAmountFilter,
  ]);

  // Filtered Payments Calculation for client-specific sub-filters
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesCompany = companyFilter === "all" || item.companyName === companyFilter;

      let matchesAmount = true;
      if (minAmountFilter) {
        matchesAmount = matchesAmount && item.amount >= Number(minAmountFilter);
      }
      if (maxAmountFilter) {
        matchesAmount = matchesAmount && item.amount <= Number(maxAmountFilter);
      }

      return matchesCompany && matchesAmount;
    });
  }, [
    payments,
    companyFilter,
    minAmountFilter,
    maxAmountFilter,
  ]);

  const totalItems = paymentsResponse?.totalItems ?? filteredPayments.length;
  const totalPages = paymentsResponse?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Statistics KPI Calculations
  const stats = useMemo(() => {
    const successfulItems = payments.filter((p) => p.status === "successful");
    const totalDisbursed =
      paymentsResponse?.totalDisbursed ||
      successfulItems.reduce((sum, p) => sum + p.amount, 0);
    const successfulCount =
      paymentsResponse?.successfulCount ?? successfulItems.length;

    const pendingItems = payments.filter(
      (p) => p.status === "pending" || p.status === "processing"
    );
    const pendingCount =
      paymentsResponse?.pendingCount ?? pendingItems.length;

    const failedItems = payments.filter(
      (p) => p.status === "failed" || p.status === "cancelled"
    );
    const failedCount =
      paymentsResponse?.failedCount ?? failedItems.length;

    return {
      totalDisbursed,
      successfulCount,
      pendingCount,
      failedCount,
    };
  }, [payments, paymentsResponse]);

  // Handlers
  const handleOpenFilterModal = () => {
    setTempStatus(statusFilter);
    setTempCompany(companyFilter);
    setTempStartDate(startDateFilter);
    setTempEndDate(endDateFilter);
    setTempMinAmount(minAmountFilter);
    setTempMaxAmount(maxAmountFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setStatusFilter(tempStatus);
    setCompanyFilter(tempCompany);
    setStartDateFilter(tempStartDate);
    setEndDateFilter(tempEndDate);
    setMinAmountFilter(tempMinAmount);
    setMaxAmountFilter(tempMaxAmount);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
    toast.success("Filters applied");
  };

  const handleResetFilters = () => {
    setTempStatus("all");
    setTempCompany("all");
    setTempStartDate("");
    setTempEndDate("");
    setTempMinAmount("");
    setTempMaxAmount("");
  };

  const handleClearAllAppliedFilters = () => {
    setStatusFilter("all");
    setCompanyFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setMinAmountFilter("");
    setMaxAmountFilter("");
    setCurrentPage(1);
    toast.info("All filters reset");
  };

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text, label);
    if (success) {
      setCopiedRef(text);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };


  const handleExportCSV = () => {
    const headers = [
      "Reference",
      "Batch ID",
      "Company Name",
      "Company Email",
      "Employee Beneficiary",
      "Employee Email",
      "Department",
      "Bank",
      "Account Number",
      "Amount",
      "Fee",
      "Type",
      "Status",
      "Date",
    ];

    const rows = filteredPayments.map((p) => [
      p.reference,
      p.batchId,
      `"${p.companyName}"`,
      p.companyEmail,
      `"${p.employeeName}"`,
      p.employeeEmail,
      p.department,
      `"${p.bankName}"`,
      `'${p.accountNumber}`,
      p.amount,
      p.fee,
      p.paymentType,
      p.status,
      p.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Payfleet_Employee_Payments_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredPayments.length} payment records to CSV`);
  };


  // Table Columns
  const columns: TableColumnProps<CompanyPaymentItem>[] = [
    {
      label: "Employee Beneficiary",
      render: (item) => (
        <div className="flex flex-col min-w-40">
          <span className="font-semibold text-textBlack text-xs">{item.employeeName}</span>
          <span className="text-[11px] text-textBlack/50">{item.employeeRole}</span>
        </div>
      ),
    },
    {
      label: "Company",
      render: (item) => (
        <div className="flex items-center gap-2.5 min-w-42.5">
          <div className="flex flex-col">
            <span className="font-semibold text-textBlack text-xs truncate max-w-37.5">
              {item.companyName}
            </span>
            <span className="text-[10px] text-primary/80 font-medium">{item.department}</span>
          </div>
        </div>
      ),
    },
    {
      label: "Reference",
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-xs tracking-wider text-textBlack">
              {item.reference}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(item.reference, "Reference")}
              className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
              title="Copy Reference"
            >
              {copiedRef === item.reference ? (
                <LuCheck size={12} className="text-emerald-600" />
              ) : (
                <LuCopy size={12} />
              )}
            </button>
          </div>
          <span className="text-[10px] font-mono text-textBlack/50">{item.batchId}</span>
        </div>
      ),
    },
    {
      label: "Bank & Account",
      render: (item) => (
        <div className="flex flex-col min-w-35">
          <span className="font-mono font-bold text-[11px] text-textBlack/50">
            {item.accountName}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-textBlack">{item.bankName}</span>
            <span className="font-mono text-[11px] text-textBlack/50">
              {item.accountNumber}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(item.accountNumber, "Account Number")}
              className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
              title="Copy Account Number"
            >
              <LuCopy size={11} />
            </button>
          </div>
        </div>
      ),
    },
    {
      label: "Amount",
      render: (item) => (
        <div className="font-bold text-xs text-primary">
          {formatterUtility(item.amount)}
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
        <span className="text-xs text-textBlack/50 whitespace-nowrap">
          {formatShortDate(item.date)}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (item) => {
        return (
          <button onClick={() => {
            setSelectedPayment(item);
            setViewReceiptModal(true);
          }}>
            <BsEye size={14} />
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-textBlack">
              {role === "finance"
                ? defaultFilter === "pending"
                  ? "Pending Payments"
                  : "Payment Management"
                : defaultFilter === "pending"
                  ? "Pending Disbursements"
                  : "Payment Management"}
            </h2>
            <p className="text-xs text-textBlack/60">
              {role === "finance"
                ? "Review and monitor salary disbursements and payout requests across organizations."
                : "Review, track, and monitor company-to-employee salary disbursements."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ActionButton
            text="Refresh"
            icon={<FiRefreshCw size={13} className={isLoading ? "animate-spin" : ""} />}
            onClick={() => refetch()}
            overideBg={true}
            buttonStyle="border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1A1921] shadow-xs cursor-pointer"
          />
          <ActionButton
            text="Export CSV"
            icon={<FiDownload size={14} />}
            onClick={handleExportCSV}
            overideBg={true}
            buttonStyle="border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1A1921] shadow-xs cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          title="Total Disbursed"
          value={formatterUtility(stats.totalDisbursed)}
          icon={TbReceiptDollar}
        />
        <OverviewCards
          title="Successful Payments"
          value={stats.successfulCount}
          icon={TbReceiptDollar}
        />
        <OverviewCards
          title="Pending Payments"
          value={stats.pendingCount}
          icon={LuClock}
        />
        <OverviewCards
          title="Failed Payments"
          value={stats.failedCount}
          icon={LuShieldAlert}
        />
      </div>

  

      {/* Toolbar: Search & Filter Trigger */}
      <div className="p-4 rounded-xl bg-tertiary border border-primary/10 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <FiSearch
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textBlack/50 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, company, employee, account..."
              className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-sm text-textBlack outline-none w-full focus:border-primary/30 transition-colors placeholder:text-textBlack/40"
            />
          </div>

          {/* Filter Modal Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenFilterModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-xs ${activeFilterCount > 0
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-[#1A1921] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
            >
              <LuFilter size={14} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllAppliedFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                title="Clear all filters"
              >
                <LuRotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/50 dark:border-white/10">
            <span className="text-[11px] text-textBlack/50 font-medium mr-1">Active filters:</span>
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">
                <span>Status: <strong>{statusFilter}</strong></span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <LuX size={12} />
                </button>
              </span>
            )}
            {companyFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">
                <span>Company: <strong>{companyFilter}</strong></span>
                <button
                  type="button"
                  onClick={() => setCompanyFilter("all")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <LuX size={12} />
                </button>
              </span>
            )}
            {(startDateFilter || endDateFilter) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">
                <span>
                  Date: <strong>{startDateFilter || "..."}</strong> to <strong>{endDateFilter || "..."}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStartDateFilter("");
                    setEndDateFilter("");
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <LuX size={12} />
                </button>
              </span>
            )}
            {(minAmountFilter || maxAmountFilter) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">
                <span>
                  Amount: <strong>{minAmountFilter ? `₦${Number(minAmountFilter).toLocaleString()}` : "₦0"}</strong> -{" "}
                  <strong>{maxAmountFilter ? `₦${Number(maxAmountFilter).toLocaleString()}` : "∞"}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMinAmountFilter("");
                    setMaxAmountFilter("");
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <LuX size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Main Payment History Table */}
        <ReusableTable
          columns={columns}
          data={filteredPayments}
          isLoading={isLoading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      {/* ===================== MODAL: ADVANCED FILTERS ===================== */}
      {isFilterModalOpen && (
        <Modal onClose={() => setIsFilterModalOpen(false)} customMode>
          <div className="bg-tertiary dark:bg-[#131217] border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full mx-auto shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-base font-bold text-textBlack">Filter Payments</h3>
                  <p className="text-xs text-textBlack/50">Filter payments by status, company, date range, or amount</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
              >
                <IoMdClose size={20} />
              </button>
            </div>

            {/* Modal Body Filters */}
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 styled-scrollbar">
              {/* 1. Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textBlack">Payment Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "pending", label: "Pending" },
                    { key: "successful", label: "Successful" },
                    { key: "processing", label: "Processing" },
                    { key: "failed", label: "Failed" },
                    { key: "cancelled", label: "Cancelled" },
                  ].map((tab) => {
                    const isSelected = tempStatus === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setTempStatus(tab.key)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-medium transition cursor-pointer border ${isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-gray-50 dark:bg-[#1A1921] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
                          }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Company Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textBlack">Company</label>
                <select
                  value={tempCompany}
                  onChange={(e) => setTempCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-textBlack cursor-pointer"
                >
                  <option value="all">All Companies</option>
                  {companyOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Date Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textBlack flex items-center gap-1">
                  <LuCalendar size={13} className="text-primary" />
                  <span>Date Range</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-textBlack/50">From Date</span>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-textBlack cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-textBlack/50">To Date</span>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-textBlack cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Amount Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textBlack">Amount Range (₦)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min (₦0)"
                    value={tempMinAmount}
                    onChange={(e) => setTempMinAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-textBlack placeholder:text-textBlack/40"
                  />
                  <input
                    type="number"
                    placeholder="Max (e.g. 5000000)"
                    value={tempMaxAmount}
                    onChange={(e) => setTempMaxAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-textBlack placeholder:text-textBlack/40"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col md:flex-row md:items-center items-start gap-2 justify-between pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                <LuRotateCcw size={13} />
                <span>Reset Inputs</span>
              </button>

              <div className="flex items-center gap-2">
                <ActionButton
                  text="Cancel"
                  onClick={() => setIsFilterModalOpen(false)}
                  overideBg={true}
                  buttonStyle="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 text-xs h-9 px-4 rounded-xl cursor-pointer"
                />
                <ActionButton
                  text="Apply Filters"
                  onClick={handleApplyFilters}
                  overideBg={true}
                  buttonStyle="bg-primary hover:bg-primary/90 text-white text-xs h-9 px-5 rounded-xl shadow-xs cursor-pointer"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Payment Details (Live GET /each-payment/{id}) */}
      {viewReceiptModal && (activePayment || isLoadingEachPayment) && (
        <Modal onClose={() => setViewReceiptModal(false)}>
          {isLoadingEachPayment && !activePayment ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <FiRefreshCw size={24} className="text-primary animate-spin" />
              <p className="text-xs text-textBlack/60">Fetching payment details...</p>
            </div>
          ) : activePayment ? (
            <div className="flex flex-col gap-6 p-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-textBlack">Payment Details</h3>
                  <p className="text-xs text-textBlack/50">Employee payment and disbursement breakdown</p>
                </div>
                {isLoadingEachPayment && (
                  <FiRefreshCw size={14} className="text-primary animate-spin" title="Updating live details" />
                )}
              </div>

              {/* Top Status Header */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10">
                <div className="flex flex-col">
                  <span className="text-xs text-textBlack/50 font-medium">Payment Reference</span>
                  <span className="text-base font-bold font-mono text-textBlack tracking-wider">
                    {activePayment.reference}
                  </span>
                  <span className="text-[11px] text-textBlack/50 font-mono mt-0.5">
                    Batch ID: {activePayment.batchId}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={activePayment.status} />
                  <span className="text-[11px] text-textBlack/50">
                    {formatShortDate(activePayment.date)}
                  </span>
                </div>
              </div>

              {/* Employee & Company Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Details */}
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#131217] flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Employee Details
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-textBlack">
                      {activePayment.employeeName}
                    </span>
                    <span className="text-xs text-textBlack/50">{activePayment.employeeEmail}</span>
                    <span className="text-xs text-textBlack font-medium mt-1">
                      {activePayment.employeeRole} • {activePayment.department}
                    </span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/10 flex flex-col">
                    <span className="text-[11px] text-textBlack/50">Bank Account</span>
                    <span className="text-xs font-semibold text-textBlack">
                      {activePayment.accountName}
                    </span>
                    <span className="text-xs font-semibold text-textBlack">
                      {activePayment.bankName}
                    </span>
                    <div className="flex items-center justify-between text-xs font-mono text-textBlack mt-0.5">
                      <span>{activePayment.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(activePayment.accountNumber, "Account Number")}
                        className="text-primary text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <LuCopy size={11} /> Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#131217] flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-textBlack/50">
                    Company Details
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-textBlack">
                      {activePayment.companyName}
                    </span>
                    <span className="text-xs text-textBlack/50">{activePayment.email || activePayment.companyEmail || "—"}</span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/10 flex flex-col">
                    <span className="text-[11px] text-textBlack/50">Narration</span>
                    <span className="text-xs text-textBlack italic">
                      "{activePayment.narration || "Salary Disbursement"}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="bg-gray-50 dark:bg-[#1A1921] px-4 py-2.5 border-b border-gray-200 dark:border-white/10 font-semibold text-xs text-textBlack">
                  Payment Breakdown
                </div>
                <div className="p-4 flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between text-textBlack/50">
                    <span>Payment Amount ({activePayment.paymentType})</span>
                    <span className="font-semibold text-textBlack">
                      {formatterUtility(activePayment.amount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex justify-between text-sm font-bold text-primary">
                    <span>Net Amount</span>
                    <span>{formatterUtility(activePayment.netAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Audit & Gateway Information */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 flex flex-col gap-2 text-xs">
                <span className="font-semibold text-textBlack">Audit & Gateway Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-textBlack/50">
                  <div>
                    <span className="text-textBlack/50">Gateway Ref: </span>
                    <span className="font-mono font-medium text-textBlack">
                      {activePayment.gatewayRef || "Pending Gateway Processing"}
                    </span>
                  </div>
                  <div>
                    <span className="text-textBlack/50">Authorized By: </span>
                    <span className="font-medium text-textBlack">
                      {activePayment.approvedBy || "Pending Review"}
                    </span>
                  </div>
                  {activePayment.approvedAt && (
                    <div>
                      <span className="text-textBlack/50">Timestamp: </span>
                      <span className="text-textBlack">{formatShortDate(activePayment.approvedAt)}</span>
                    </div>
                  )}
                  {activePayment.rejectionReason && (
                    <div className="sm:col-span-2 text-rose-600">
                      <span className="font-semibold">Rejection Reason: </span>
                      <span>{activePayment.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <ActionButton
                  text="Close"
                  onClick={() => setViewReceiptModal(false)}
                  overideBg={true}
                  buttonStyle="bg-red-100 text-red-900 border border-red-400 text-xs h-9 px-3 rounded-xl cursor-pointer"
                />
              </div>
            </div>
          ) : null}
        </Modal>
      )}


    </div>
  );
};

export default SuperAdminManagePayments;
