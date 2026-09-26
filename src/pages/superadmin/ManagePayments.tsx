import React, { useState, useMemo } from "react";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import Modal from "../../components/modal/Modal";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionButton from "../../components/ui/ActionButton";
import OverviewCards from "../../components/cards/OverviewCards";
import { toast } from "sonner";
import { formatShortDate, formatterUtility } from "../../helpers/formatterUtility";
import { copyToClipboard } from "../../helpers/clipboardHelper";
import type { TableColumnProps } from "../../lib/interfaces";
import {
  getInitialCompanyPayments,
  type CompanyPaymentItem,
  type PaymentCategory,
} from "../../services/adminPaymentService";
import { FiSearch, FiDownload, FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";
import {
  LuClock,
  LuCopy,
  LuCheck,
  LuShieldAlert,
  LuReceipt,
  LuPrinter,
  LuFilter,
  LuX,
  LuRotateCcw,
  LuCalendar,
} from "react-icons/lu";
import { TbReceiptDollar } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";

import StatusBadge from "../../components/ui/StatusBadge";

const categoryBadge = (category: PaymentCategory) => {
  const colors: Record<PaymentCategory, string> = {
    Salary: "bg-primary/10 text-primary border-primary/20",
    Bonus: "bg-purple-50 text-purple-700 border-purple-200",
    Allowance: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Reimbursement: "bg-teal-50 text-teal-700 border-teal-200",
    Commission: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold tracking-wide ${colors[category] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
    >
      {category}
    </span>
  );
};

const REJECTION_REASONS = [
  "Beneficiary Account Name Mismatch with Bank Records",
  "Invalid BVN / KYC Verification Failure",
  "Suspected Duplicate Employee Disbursement",
  "Company Requested Immediate Payout Reversal",
  "Destination Bank Offline / Account Temporarily Restricted",
  "Compliance & Anti-Fraud Clearance Hold",
  "Other Reason (Specify below)",
];

const SuperAdminManagePayments: React.FC = () => {
  const [payments, setPayments] = useState<CompanyPaymentItem[]>(() =>
    getInitialCompanyPayments()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [minAmountFilter, setMinAmountFilter] = useState<string>("");
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>("");
  const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>([]);

  // Filter Modal Temporary State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>("all");
  const [tempCompany, setTempCompany] = useState<string>("all");
  const [tempCategory, setTempCategory] = useState<string>("all");
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  const [tempMinAmount, setTempMinAmount] = useState<string>("");
  const [tempMaxAmount, setTempMaxAmount] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [selectedPayment, setSelectedPayment] = useState<CompanyPaymentItem | null>(null);
  const [viewReceiptModal, setViewReceiptModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [retryModal, setRetryModal] = useState(false);
  const [rejectionReasonSelect, setRejectionReasonSelect] = useState(REJECTION_REASONS[0]);
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Distinct company names for dropdown filter
  const companyOptions = useMemo(() => {
    const names = Array.from(new Set(payments.map((p) => p.companyName)));
    return names.sort();
  }, [payments]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (companyFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    if (minAmountFilter || maxAmountFilter) count++;
    return count;
  }, [
    statusFilter,
    companyFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter,
    minAmountFilter,
    maxAmountFilter,
  ]);

  // Filtered Payments Calculation
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.reference.toLowerCase().includes(term) ||
        item.batchId.toLowerCase().includes(term) ||
        item.companyName.toLowerCase().includes(term) ||
        item.employeeName.toLowerCase().includes(term) ||
        item.employeeEmail.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term) ||
        item.bankName.toLowerCase().includes(term) ||
        item.accountNumber.includes(term) ||
        item.amount.toString().includes(term);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCompany = companyFilter === "all" || item.companyName === companyFilter;
      const matchesCategory = categoryFilter === "all" || item.paymentType === categoryFilter;

      let matchesDate = true;
      if (startDateFilter) {
        matchesDate = matchesDate && new Date(item.date) >= new Date(startDateFilter);
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(item.date) <= end;
      }

      let matchesAmount = true;
      if (minAmountFilter) {
        matchesAmount = matchesAmount && item.amount >= Number(minAmountFilter);
      }
      if (maxAmountFilter) {
        matchesAmount = matchesAmount && item.amount <= Number(maxAmountFilter);
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCompany &&
        matchesCategory &&
        matchesDate &&
        matchesAmount
      );
    });
  }, [
    payments,
    searchTerm,
    statusFilter,
    companyFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter,
    minAmountFilter,
    maxAmountFilter,
  ]);

  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  // Statistics KPI Calculations
  const stats = useMemo(() => {
    const successfulItems = payments.filter((p) => p.status === "successful");
    const totalDisbursed = successfulItems.reduce((sum, p) => sum + p.amount, 0);
    const successfulCount = successfulItems.length;

    const pendingItems = payments.filter(
      (p) => p.status === "pending" || p.status === "processing"
    );
    const pendingCount = pendingItems.length;
    const pendingAmount = pendingItems.reduce((sum, p) => sum + p.amount, 0);

    const failedItems = payments.filter(
      (p) => p.status === "failed" || p.status === "cancelled"
    );
    const failedCount = failedItems.length;
    const failedAmount = failedItems.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalDisbursed,
      successfulCount,
      pendingCount,
      pendingAmount,
      failedCount,
      failedAmount,
    };
  }, [payments]);

  // Handlers
  const handleOpenFilterModal = () => {
    setTempStatus(statusFilter);
    setTempCompany(companyFilter);
    setTempCategory(categoryFilter);
    setTempStartDate(startDateFilter);
    setTempEndDate(endDateFilter);
    setTempMinAmount(minAmountFilter);
    setTempMaxAmount(maxAmountFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setStatusFilter(tempStatus);
    setCompanyFilter(tempCompany);
    setCategoryFilter(tempCategory);
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
    setTempCategory("all");
    setTempStartDate("");
    setTempEndDate("");
    setTempMinAmount("");
    setTempMaxAmount("");
  };

  const handleClearAllAppliedFilters = () => {
    setStatusFilter("all");
    setCompanyFilter("all");
    setCategoryFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setMinAmountFilter("");
    setMaxAmountFilter("");
    setCurrentPage(1);
    toast.info("All filters cleared");
  };

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text, label);
    if (success) {
      setCopiedRef(text);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  const handleApprovePayment = async (paymentToApprove?: CompanyPaymentItem) => {
    const target = paymentToApprove || selectedPayment;
    if (!target) return;

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      setPayments((prev) =>
        prev.map((item) =>
          item.id === target.id
            ? {
              ...item,
              status: "successful",
              approvedBy: "Super Admin Clearance Desk",
              approvedAt: new Date().toISOString(),
              gatewayRef: `ADMIN-DISB-${Math.floor(100000000 + Math.random() * 900000000)}`,
            }
            : item
        )
      );

      toast.success(
        `Disbursement of ${formatterUtility(target.amount)} to ${target.employeeName} approved successfully!`
      );
      setApproveModal(false);
      setViewReceiptModal(false);
      setSelectedPayment(null);
    } catch {
      toast.error("An error occurred while approving payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      const reason =
        rejectionReasonSelect === "Other Reason (Specify below)"
          ? customRejectionReason || "Disbursement rejected by Super Admin"
          : rejectionReasonSelect;

      setPayments((prev) =>
        prev.map((item) =>
          item.id === selectedPayment.id
            ? {
              ...item,
              status: "cancelled",
              rejectionReason: reason,
            }
            : item
        )
      );

      toast.info(
        `Payment ${selectedPayment.reference} cancelled. ${formatterUtility(
          selectedPayment.amount
        )} has been refunded to ${selectedPayment.companyName}'s balance.`
      );
      setRejectModal(false);
      setViewReceiptModal(false);
      setSelectedPayment(null);
      setCustomRejectionReason("");
    } catch {
      toast.error("Failed to reject disbursement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!selectedPayment) return;

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));

      setPayments((prev) =>
        prev.map((item) =>
          item.id === selectedPayment.id
            ? {
              ...item,
              status: "successful",
              rejectionReason: undefined,
              approvedBy: "Gateway Re-query Auto Recovery",
              approvedAt: new Date().toISOString(),
              gatewayRef: `RETRY-NIBSS-${Math.floor(100000000 + Math.random() * 900000000)}`,
            }
            : item
        )
      );

      toast.success(
        `Payment ${selectedPayment.reference} re-queried and completed successfully!`
      );
      setRetryModal(false);
      setViewReceiptModal(false);
      setSelectedPayment(null);
    } catch {
      toast.error("Re-query retry failed. Bank institution is unreachable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedRowIds.length === 0) return;

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));

      setPayments((prev) =>
        prev.map((item) =>
          selectedRowIds.includes(item.id) &&
            (item.status === "pending" || item.status === "processing")
            ? {
              ...item,
              status: "successful",
              approvedBy: "Batch Super Admin Clearance",
              approvedAt: new Date().toISOString(),
              gatewayRef: `BATCH-APPR-${Math.floor(100000000 + Math.random() * 900000000)}`,
            }
            : item
        )
      );

      toast.success(`Successfully cleared ${selectedRowIds.length} employee disbursements!`);
      setSelectedRowIds([]);
    } catch {
      toast.error("Failed to batch approve payments");
    } finally {
      setIsSubmitting(false);
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

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payfleet_Employee_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredPayments.length} payment records to CSV`);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Row Selection logic
  const handleToggleRowSelection = (id: string | number) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAllRows = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map((item) => item.id);
      setSelectedRowIds(Array.from(new Set([...selectedRowIds, ...allIds])));
    } else {
      const pageIds = new Set(paginatedData.map((item) => item.id));
      setSelectedRowIds(selectedRowIds.filter((id) => !pageIds.has(Number(id))));
    }
  };

  // Table Columns
  const columns: TableColumnProps<CompanyPaymentItem>[] = [
    {
      label: "Company",
      render: (item) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="flex flex-col">
            <span className="font-semibold text-textBlack text-xs truncate max-w-37.5">
              {item.companyName}
            </span>
            <span className="text-[11px] text-textBlack/50 lowercase truncate max-w-[150px]">
              {item.companyEmail}
            </span>
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
      label: "Employee Beneficiary",
      render: (item) => (
        <div className="flex flex-col min-w-[160px]">
          <span className="font-semibold text-textBlack text-xs">{item.employeeName}</span>
          <span className="text-[11px] text-textBlack/50">{item.employeeRole}</span>
          <span className="text-[10px] text-primary/80 font-medium">{item.department}</span>
        </div>
      ),
    },
    {
      label: "Bank & Account",
      render: (item) => (
        <div className="flex flex-col min-w-[140px]">
          <span className="text-xs font-medium text-textBlack">{item.bankName}</span>
          <div className="flex items-center gap-1">
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
      label: "Type",
      render: (item) => categoryBadge(item.paymentType),
    },
    {
      label: "Amount",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-xs text-primary">
            {formatterUtility(item.amount)}
          </span>
          <span className="text-[10px] text-textBlack/50">
            Fee: {formatterUtility(item.fee)}
          </span>
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
        const otherActions = [
          {
            name: "View Full Receipt",
            icon: <LuReceipt size={14} className="text-primary" />,
            action: () => {
              setSelectedPayment(item);
              setViewReceiptModal(true);
            },
          },
        ];

        if (item.status === "pending" || item.status === "processing") {
          otherActions.push({
            name: "Approve Disbursement",
            icon: <FiCheckCircle size={14} className="text-emerald-600" />,
            action: () => {
              setSelectedPayment(item);
              setApproveModal(true);
            },
          });
          otherActions.push({
            name: "Reject Disbursement",
            icon: <FiXCircle size={14} className="text-rose-600" />,
            action: () => {
              setSelectedPayment(item);
              setRejectModal(true);
            },
          });
        }

        if (item.status === "failed") {
          otherActions.push({
            name: "Retry / Re-query Payout",
            icon: <FiRefreshCw size={14} className="text-amber-600" />,
            action: () => {
              setSelectedPayment(item);
              setRetryModal(true);
            },
          });
        }

        otherActions.push({
          name: "Copy Ref Code",
          icon: <LuCopy size={14} className="text-gray-600" />,
          action: () => handleCopy(item.reference, "Payment Reference"),
        });

        return (
          <ActionCell
            rowId={Number(item.id)}
            canView={true}
            onView={() => {
              setSelectedPayment(item);
              setViewReceiptModal(true);
            }}
            otherActions={otherActions}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textBlack tracking-tight">
            Manage Employee Payments
          </h2>
          <p className="text-sm text-textBlack/50 mt-0.5">
            Audit, track, and clear company-to-employee salary disbursements across all organizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ActionButton
            text="Export CSV"
            icon={<FiDownload size={14} />}
            onClick={handleExportCSV}
            overideBg={true}
            buttonStyle="border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1A1921] shadow-xs"
          />
          {selectedRowIds.length > 0 && (
            <ActionButton
              text={`Approve Selected (${selectedRowIds.length})`}
              icon={<FiCheckCircle size={14} />}
              onClick={handleBatchApprove}
              disabled={isSubmitting}
              overideBg={true}
              buttonStyle="bg-primary hover:bg-emerald-700 text-white shadow-xs"
            />
          )}
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
          title="Successful Payouts"
          value={stats.successfulCount}
          icon={TbReceiptDollar}
        />
        <OverviewCards
          title="Pending Clearance"
          value={stats.pendingCount}
          icon={LuClock}
        />
        <OverviewCards
          title="Failed / Cancelled"
          value={stats.failedCount}
          icon={LuShieldAlert}
        />
      </div>

      {/* Toolbar: Search & Filter Trigger */}
      <div className="p-4 rounded-xl bg-secondary border border-primary/10 flex flex-col gap-3 ">
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
              className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-sm text-textBlack outline-none w-56 md:w-72 focus:border-primary/30 transition-colors placeholder:text-textBlack/40"
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
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">
                <span>Type: <strong>{categoryFilter}</strong></span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
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
        data={paginatedData}
        isLoading={false}
        error={null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        selectable={true}
        selectedRowIds={selectedRowIds}
        onToggleRowSelection={handleToggleRowSelection}
        onToggleAllRows={handleToggleAllRows}
        getRowId={(item) => item.id}
      />
      </div>


      {/* ===================== MODAL: ADVANCED FILTERS ===================== */}
      {isFilterModalOpen && (
        <Modal onClose={() => setIsFilterModalOpen(false)} customMode>
          <div className="bg-white dark:bg-[#131217] border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full mx-auto shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <LuFilter size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-textBlack">Filter Payments</h3>
                  <p className="text-xs text-textBlack/50">Customize search parameters & filters</p>
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
                    { key: "all", label: "All Statuses" },
                    { key: "successful", label: "Successful" },
                    { key: "pending", label: "Pending" },
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
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${isSelected
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
                <label className="text-xs font-bold text-textBlack">Organization / Company</label>
                <select
                  value={tempCompany}
                  onChange={(e) => setTempCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-textBlack cursor-pointer"
                >
                  <option value="all">All Organizations</option>
                  {companyOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Payment Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textBlack">Disbursement Category</label>
                <select
                  value={tempCategory}
                  onChange={(e) => setTempCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-textBlack cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Salary">Salary Payout</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Reimbursement">Reimbursement</option>
                  <option value="Commission">Sales Commission</option>
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
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
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
                  buttonStyle="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 text-xs h-9 px-4 rounded-xl"
                />
                <ActionButton
                  text="Apply Filters"
                  onClick={handleApplyFilters}
                  overideBg={true}
                  buttonStyle="bg-primary hover:bg-primary/90 text-white text-xs h-9 px-5 rounded-xl shadow-xs"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 1: Payment Receipt / Detailed Breakdown */}
      {viewReceiptModal && selectedPayment && (
        <Modal onClose={() => setViewReceiptModal(false)}>
          <div className="flex flex-col gap-6 p-2">
            <div>
              <h3 className="text-lg font-bold text-textBlack">Employee Disbursement Voucher</h3>
              <p className="text-xs text-textBlack/50">Official digital payment clearance voucher</p>
            </div>

            {/* Top Status Header */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10">
              <div className="flex flex-col">
                <span className="text-xs text-textBlack/50 font-medium">Disbursal Reference</span>
                <span className="text-base font-bold font-mono text-textBlack tracking-wider">
                  {selectedPayment.reference}
                </span>
                <span className="text-[11px] text-textBlack/50 font-mono mt-0.5">
                  Batch: {selectedPayment.batchId}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={selectedPayment.status} />
                <span className="text-[11px] text-textBlack/50">
                  {formatShortDate(selectedPayment.date)}
                </span>
              </div>
            </div>

            {/* Beneficiary & Employer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Beneficiary Employee */}
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#131217] flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Beneficiary (Employee)
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-textBlack">
                    {selectedPayment.employeeName}
                  </span>
                  <span className="text-xs text-textBlack/50">{selectedPayment.employeeEmail}</span>
                  <span className="text-xs text-textBlack font-medium mt-1">
                    {selectedPayment.employeeRole} • {selectedPayment.department}
                  </span>
                </div>
                <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/10 flex flex-col">
                  <span className="text-[11px] text-textBlack/50">Destination Account</span>
                  <span className="text-xs font-semibold text-textBlack">
                    {selectedPayment.bankName}
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono text-textBlack mt-0.5">
                    <span>{selectedPayment.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedPayment.accountNumber, "Account Number")}
                      className="text-primary text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <LuCopy size={11} /> Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Debtor Company */}
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#131217] flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-textBlack/50">
                  Debtor Organization (Employer)
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-textBlack">
                    {selectedPayment.companyName}
                  </span>
                  <span className="text-xs text-textBlack/50">{selectedPayment.companyEmail}</span>
                  <span className="text-xs text-textBlack/50 mt-1">
                    Organization ID: #ORG-{selectedPayment.companyId}
                  </span>
                </div>
                <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/10 flex flex-col">
                  <span className="text-[11px] text-textBlack/50">Payment Narration</span>
                  <span className="text-xs text-textBlack italic">
                    "{selectedPayment.narration || "Employee Compensation Disbursal"}"
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
                  <span>Gross Disbursal Amount ({selectedPayment.paymentType})</span>
                  <span className="font-semibold text-textBlack">
                    {formatterUtility(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-textBlack/50">
                  <span>Payfleet Platform Clearance Fee</span>
                  <span className="font-medium text-textBlack">
                    {formatterUtility(selectedPayment.fee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex justify-between text-sm font-bold text-primary">
                  <span>Net Credited to Beneficiary</span>
                  <span>{formatterUtility(selectedPayment.netAmount)}</span>
                </div>
              </div>
            </div>

            {/* Audit & Compliance Log */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 flex flex-col gap-2 text-xs">
              <span className="font-semibold text-textBlack">Audit & Gateway Information</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-textBlack/50">
                <div>
                  <span className="text-textBlack/50">Gateway Ref: </span>
                  <span className="font-mono font-medium text-textBlack">
                    {selectedPayment.gatewayRef || "Awaiting Gateway Handshake"}
                  </span>
                </div>
                <div>
                  <span className="text-textBlack/50">Authorized By: </span>
                  <span className="font-medium text-textBlack">
                    {selectedPayment.approvedBy || "Pending Review"}
                  </span>
                </div>
                {selectedPayment.approvedAt && (
                  <div>
                    <span className="text-textBlack/50">Timestamp: </span>
                    <span className="text-textBlack">{formatShortDate(selectedPayment.approvedAt)}</span>
                  </div>
                )}
                {selectedPayment.rejectionReason && (
                  <div className="sm:col-span-2 text-rose-600">
                    <span className="font-semibold">Rejection Reason: </span>
                    <span>{selectedPayment.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-textBlack hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LuPrinter size={15} /> Print / Save Voucher
              </button>

              <div className="flex items-center gap-2">
                {(selectedPayment.status === "pending" ||
                  selectedPayment.status === "processing") && (
                    <>
                      <ActionButton
                        text="Reject"
                        icon={<FiXCircle size={14} />}
                        onClick={() => setRejectModal(true)}
                        overideBg={true}
                        buttonStyle="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs h-9 px-3 rounded-xl"
                      />
                      <ActionButton
                        text="Approve Disbursal"
                        icon={<FiCheckCircle size={14} />}
                        onClick={() => handleApprovePayment(selectedPayment)}
                        disabled={isSubmitting}
                        overideBg={true}
                        buttonStyle="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-3 rounded-xl"
                      />
                    </>
                  )}
                {selectedPayment.status === "failed" && (
                  <ActionButton
                    text="Retry Transfer"
                    icon={<FiRefreshCw size={14} />}
                    onClick={() => setRetryModal(true)}
                    overideBg={true}
                    buttonStyle="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 px-3 rounded-xl"
                  />
                )}
                <ActionButton
                  text="Close"
                  onClick={() => setViewReceiptModal(false)}
                  overideBg={true}
                  buttonStyle="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-xs h-9 px-3 rounded-xl"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Approve Confirmation */}
      {approveModal && selectedPayment && (
        <ConfirmDialog
          isOpen={approveModal}
          onCancel={() => setApproveModal(false)}
          onConfirm={() => handleApprovePayment()}
          title="Approve Employee Disbursement"
          message={`Are you sure you want to approve the disbursal of ${formatterUtility(
            selectedPayment.amount
          )} to ${selectedPayment.employeeName} (${selectedPayment.companyName})? Funds will be credited directly to ${selectedPayment.bankName}.`}
          confirmText="Confirm & Clear Payout"
          isLoading={isSubmitting}
        />
      )}

      {/* Modal 3: Reject Confirmation Modal */}
      {rejectModal && selectedPayment && (
        <Modal onClose={() => setRejectModal(false)}>
          <div className="flex flex-col gap-4 p-2">
            <div>
              <h3 className="text-lg font-bold text-textBlack">Reject Employee Disbursement</h3>
              <p className="text-xs text-textBlack/50">Cancel payout and refund funds to employer</p>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
              <LuShieldAlert size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Cancellation Warning</p>
                <p className="mt-0.5 text-rose-700">
                  Rejecting this payout will cancel the bank transfer and automatically refund{" "}
                  <strong>{formatterUtility(selectedPayment.amount)}</strong> back to{" "}
                  <strong>{selectedPayment.companyName}</strong>'s deposit wallet.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textBlack">
                Reason for Rejection / Cancellation
              </label>
              <select
                value={rejectionReasonSelect}
                onChange={(e) => setRejectionReasonSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-textBlack"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {rejectionReasonSelect === "Other Reason (Specify below)" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textBlack">
                  Specific Details / Auditor Notes
                </label>
                <textarea
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="Provide precise reason for compliance records..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-white dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-textBlack"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
              <ActionButton
                text="Cancel"
                onClick={() => setRejectModal(false)}
                overideBg={true}
                buttonStyle="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 text-xs h-9 px-3 rounded-xl"
              />
              <ActionButton
                text="Confirm Rejection & Refund"
                onClick={handleRejectPayment}
                disabled={isSubmitting}
                overideBg={true}
                buttonStyle="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-3 rounded-xl"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 4: Retry Payment Modal */}
      {retryModal && selectedPayment && (
        <ConfirmDialog
          isOpen={retryModal}
          onCancel={() => setRetryModal(false)}
          onConfirm={handleRetryPayment}
          title="Retry Failed Disbursement"
          message={`Would you like to re-query the payment gateway and retry transferring ${formatterUtility(
            selectedPayment.amount
          )} to ${selectedPayment.employeeName} (${selectedPayment.bankName} - ${selectedPayment.accountNumber})?`}
          confirmText="Re-query & Retry"
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default SuperAdminManagePayments;
