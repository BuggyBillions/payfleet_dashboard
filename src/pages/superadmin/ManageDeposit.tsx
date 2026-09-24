import React, { useState, useMemo, useEffect } from "react";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import Modal from "../../components/modal/Modal";
import OverviewCards from "../../components/cards/OverviewCards";
import { toast } from "sonner";
import { formatShortDate, formatterUtility } from "../../helpers/formatterUtility";
import type { TableColumnProps, DepositItemProps, ManageDepositProps } from "../../lib/interfaces";
import { FiSearch } from "react-icons/fi";
import { LuClock, LuCopy, LuCheck, LuX } from "react-icons/lu";
import { TbReceiptDollar, TbArrowUpRight } from "react-icons/tb";
import { BsCheck2Circle, BsXCircle } from "react-icons/bs";

export type { DepositItemProps, ManageDepositProps };

const statusBadge = (status: DepositItemProps["status"]) => {
  const styles = {
    successful: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    failed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const INITIAL_DEPOSIT_DATA: DepositItemProps[] = [
  {
    id: 1,
    companyName: "Acme Technologies Ltd",
    email: "finance@acmetech.io",
    reference: "PF-DEP-849201",
    amount: 1500000,
    method: "Bank Transfer",
    accountNumber: "0123984711",
    bankName: "Guaranty Trust Bank",
    status: "successful",
    date: "2026-09-24T10:15:00",
    approvedAt: "2026-09-24T10:20:00",
  },
  {
    id: 2,
    companyName: "Global Logistics Inc",
    email: "billing@globallogistics.com",
    reference: "PF-DEP-849202",
    amount: 750000,
    method: "Bank Transfer",
    accountNumber: "2201948301",
    bankName: "Zenith Bank",
    status: "successful",
    date: "2026-09-24T09:30:00",
    approvedAt: "2026-09-24T09:35:00",
  },
  {
    id: 3,
    companyName: "Apex Health Systems",
    email: "accounts@apexhealth.ng",
    reference: "PF-DEP-849203",
    amount: 3200000,
    method: "Bank Transfer",
    accountNumber: "1092837465",
    bankName: "Access Bank",
    status: "pending",
    date: "2026-09-23T16:45:00",
  },
  {
    id: 4,
    companyName: "Payfleet Demo Corp",
    email: "treasury@democorp.io",
    reference: "PF-DEP-849204",
    amount: 1850000,
    method: "Direct Transfer",
    accountNumber: "0091827364",
    bankName: "First Bank of Nigeria",
    status: "pending",
    date: "2026-09-23T15:10:00",
  },
  {
    id: 5,
    companyName: "Sterling Retail Hub",
    email: "admin@sterlinghub.com",
    reference: "PF-DEP-849205",
    amount: 450000,
    method: "Card",
    status: "successful",
    date: "2026-09-23T14:20:00",
    approvedAt: "2026-09-23T14:22:00",
  },
  {
    id: 6,
    companyName: "Vanguard Media Group",
    email: "pay@vanguardmedia.io",
    reference: "PF-DEP-849206",
    amount: 890000,
    method: "Bank Transfer",
    accountNumber: "9903723754",
    bankName: "Paystack-Titan",
    status: "failed",
    date: "2026-09-22T11:10:00",
    rejectionReason: "Funds not received in clearing account within 24 hours.",
  },
  {
    id: 7,
    companyName: "Bluecrest Energy",
    email: "treasury@bluecrestenergy.com",
    reference: "PF-DEP-849207",
    amount: 5000000,
    method: "Bank Transfer",
    accountNumber: "9817625028",
    bankName: "Wema Bank",
    status: "successful",
    date: "2026-09-22T08:05:00",
    approvedAt: "2026-09-22T08:30:00",
  },
  {
    id: 8,
    companyName: "Sunmence Tech Limited",
    email: "company@payfleet.io",
    reference: "PF-DEP-849208",
    amount: 500000,
    method: "Bank Transfer",
    accountNumber: "0192837465",
    bankName: "GTBank",
    status: "successful",
    date: "2026-09-21T15:40:00",
    approvedAt: "2026-09-21T15:45:00",
  },
];

const REJECTION_PRESETS = [
  "Payment not reflected in bank account statement",
  "Incorrect amount transferred",
  "Duplicate payment proof / transaction reference",
  "Account number / beneficiary mismatch",
  "Transaction expired before settlement",
];

const ManageDeposit: React.FC<ManageDepositProps> = ({
  defaultFilter = "all",
  role = "superadmin",
}) => {
  const [depositList, setDepositList] = useState<DepositItemProps[]>(INITIAL_DEPOSIT_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [selectedDeposit, setSelectedDeposit] = useState<DepositItemProps | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStatusFilter(defaultFilter);
    setCurrentPage(1);
  }, [defaultFilter]);

  // Platform statistics
  const totalVolume = useMemo(() => {
    return depositList
      .filter((d) => d.status === "successful")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [depositList]);

  const pendingVolume = useMemo(() => {
    return depositList
      .filter((d) => d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [depositList]);

  const successfulCount = useMemo(() => {
    return depositList.filter((d) => d.status === "successful").length;
  }, [depositList]);

  // Filtered deposits
  const filteredDeposits = useMemo(() => {
    return depositList.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm.trim() === "" ||
        item.companyName.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.reference.toLowerCase().includes(term) ||
        item.method.toLowerCase().includes(term) ||
        item.amount.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [depositList, searchTerm, statusFilter]);

  const totalItems = filteredDeposits.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDeposits.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDeposits, currentPage, itemsPerPage]);

  const handleApprove = async () => {
    if (!selectedDeposit) return;
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDepositList((prev) =>
        prev.map((item) =>
          item.id === selectedDeposit.id
            ? {
                ...item,
                status: "successful",
                approvedAt: new Date().toISOString(),
              }
            : item
        )
      );
      toast.success(
        `Deposit ${selectedDeposit.reference} approved! ${formatterUtility(selectedDeposit.amount)} credited to ${selectedDeposit.companyName}.`
      );
      setApproveModal(false);
      setSelectedDeposit(null);
    } catch {
      toast.error("Failed to approve deposit");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit || !rejectionReason.trim()) return;
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDepositList((prev) =>
        prev.map((item) =>
          item.id === selectedDeposit.id
            ? {
                ...item,
                status: "failed",
                rejectionReason: rejectionReason.trim(),
              }
            : item
        )
      );
      toast.error(
        `Deposit ${selectedDeposit.reference} for ${selectedDeposit.companyName} has been rejected.`
      );
      setRejectModal(false);
      setSelectedDeposit(null);
      setRejectionReason("");
    } catch {
      toast.error("Failed to reject deposit");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDeposit) return;
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setDepositList((prev) => prev.filter((item) => item.id !== selectedDeposit.id));
      toast.success(`Deposit record ${selectedDeposit.reference} deleted successfully`);
      setDeleteModal(false);
      setSelectedDeposit(null);
    } catch {
      toast.error("Failed to delete deposit record");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyRef = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      toast.success("Reference copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy reference");
    }
  };

  const columns: TableColumnProps<DepositItemProps>[] = [
    {
      label: "Company",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">{item.companyName}</span>
          <span className="text-[11px] text-textBlack/60 lowercase">{item.email}</span>
        </div>
      ),
    },
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold uppercase tracking-wider text-xs font-mono text-textBlack">
          {item.reference}
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
      label: "Channel",
      render: (item) => (
        <span className="text-textBlack/70 text-xs flex items-center gap-1">
          <TbArrowUpRight size={13} className="text-textBlack/40 shrink-0" />
          {item.method}
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
        <span className="text-textBlack/60 text-xs">
          {formatShortDate(item.date)}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (item) => (
        <ActionCell
          rowId={Number(item.id)}
          canView={true}
          onView={() => {
            setSelectedDeposit(item);
            setViewModal(true);
          }}
          onDelete={
            role === "superadmin"
              ? () => {
                  setSelectedDeposit(item);
                  setDeleteModal(true);
                }
              : undefined
          }
          otherActions={
            item.status === "pending"
              ? [
                  {
                    name: "Approve Deposit",
                    icon: <BsCheck2Circle className="text-green-600" size={14} />,
                    action: () => {
                      setSelectedDeposit(item);
                      setApproveModal(true);
                    },
                  },
                  {
                    name: "Reject Deposit",
                    icon: <BsXCircle className="text-red-600" size={14} />,
                    action: () => {
                      setSelectedDeposit(item);
                      setRejectionReason("");
                      setRejectModal(true);
                    },
                  },
                ]
              : []
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">
            {defaultFilter === "pending"
              ? "Pending Deposits Verification"
              : role === "financial"
              ? "Deposit Verification & Approvals"
              : "Manage Deposits"}
          </h2>
          <p className="text-xs text-textBlack/60">
            {defaultFilter === "pending"
              ? "Review and approve inbound company deposit settlements awaiting confirmation"
              : "Monitor and manage all inbound wallet funding transactions across all client companies"}
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCards
          title="Total Platform Volume"
          value={formatterUtility(totalVolume)}
          icon={TbReceiptDollar}
        />
        <OverviewCards
          title="Pending Approvals"
          value={formatterUtility(pendingVolume)}
          icon={LuClock}
        />
        <OverviewCards
          title="Completed Transactions"
          value={successfulCount.toString()}
          icon={TbReceiptDollar}
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-tertiary rounded-xl p-5 border border-primary/10 space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-textBlack">
              {defaultFilter === "pending" ? "Pending Deposits Audit" : "Deposit Audit Log"}
            </h3>
            <p className="text-xs text-textBlack/60">
              Real-time feed of all company bank transfers and card deposits
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
                placeholder="Search company, reference..."
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

      {/* APPROVE MODAL */}
      {approveModal && selectedDeposit && (
        <Modal
          onClose={() => {
            setApproveModal(false);
            setSelectedDeposit(null);
          }}
          customMode
        >
          <div className="bg-tertiary rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl space-y-4 text-textBlack">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                <BsCheck2Circle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-textBlack">Approve Bank Deposit</h3>
                <p className="text-xs text-textBlack/60">Confirm receipt of funds</p>
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-4 text-xs space-y-2 border border-primary/10">
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Amount</span>
                <span className="font-bold text-primary text-base">
                  {formatterUtility(selectedDeposit.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Company</span>
                <span className="font-semibold text-textBlack">{selectedDeposit.companyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Reference</span>
                <span className="font-mono font-semibold text-textBlack">{selectedDeposit.reference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Channel</span>
                <span className="font-medium text-textBlack/80">{selectedDeposit.method}</span>
              </div>
            </div>

            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-700 dark:text-green-400 leading-relaxed">
              Confirming this deposit will immediately credit <strong>{formatterUtility(selectedDeposit.amount)}</strong> to <strong>{selectedDeposit.companyName}</strong>'s available wallet balance.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setApproveModal(false);
                  setSelectedDeposit(null);
                }}
                className="w-1/2 py-2.5 rounded-lg border border-primary/10 text-textBlack text-xs font-semibold hover:bg-secondary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApprove}
                className="w-1/2 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <BsCheck2Circle size={14} />
                    <span>Confirm & Credit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {rejectModal && selectedDeposit && (
        <Modal
          onClose={() => {
            setRejectModal(false);
            setSelectedDeposit(null);
          }}
          customMode
        >
          <div className="bg-tertiary rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl space-y-4 text-textBlack">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                <BsXCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-textBlack">Reject Deposit</h3>
                <p className="text-xs text-textBlack/60">Decline unverified bank transaction</p>
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-3 text-xs space-y-1.5 border border-primary/10">
              <div className="flex justify-between">
                <span className="text-textBlack/60">Amount:</span>
                <span className="font-bold text-primary">{formatterUtility(selectedDeposit.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textBlack/60">Company:</span>
                <span className="font-medium text-textBlack">{selectedDeposit.companyName}</span>
              </div>
            </div>

            {/* Rejection Reason Form */}
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="text-xs font-semibold text-textBlack block">
                Reason for Rejection *
              </label>

              <div className="space-y-1">
                <p className="text-[10px] text-textBlack/50 font-medium">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="px-2 py-1 bg-secondary hover:bg-primary/10 text-textBlack text-[10px] rounded border border-primary/10 text-left transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                id="rejection-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Type or select reason for rejection..."
                className="w-full p-2.5 text-xs rounded-lg border border-primary/10 bg-secondary text-textBlack placeholder:text-textBlack/40 focus:border-red-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setRejectModal(false);
                  setSelectedDeposit(null);
                }}
                className="w-1/2 py-2.5 rounded-lg border border-primary/10 text-textBlack text-xs font-semibold hover:bg-secondary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || !rejectionReason.trim()}
                onClick={handleReject}
                className="w-1/2 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Rejecting...</span>
                ) : (
                  <>
                    <BsXCircle size={14} />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewModal && selectedDeposit && (
        <Modal
          onClose={() => {
            setViewModal(false);
            setSelectedDeposit(null);
          }}
          customMode
        >
          <div className="bg-tertiary rounded-2xl p-6 max-w-lg w-full mx-auto shadow-2xl space-y-5 text-textBlack">
            <div className="flex items-center justify-between pb-3 border-b border-primary/10">
              <div>
                <h3 className="text-base font-bold text-textBlack">Deposit Audit Report</h3>
                <p className="text-xs text-textBlack/60">Transaction ID & payment details</p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(selectedDeposit.status)}
                <button
                  type="button"
                  onClick={() => {
                    setViewModal(false);
                    setSelectedDeposit(null);
                  }}
                  className="p-1 text-textBlack/60 hover:text-textBlack cursor-pointer"
                >
                  <LuX size={18} />
                </button>
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-4 text-xs space-y-3 border border-primary/10">
              <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                <span className="text-textBlack/60">Deposit Amount</span>
                <span className="font-bold text-base text-primary">
                  {formatterUtility(selectedDeposit.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Company Name</span>
                <span className="font-semibold text-textBlack">{selectedDeposit.companyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Company Email</span>
                <span className="font-medium text-textBlack/80">{selectedDeposit.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Reference</span>
                <div className="flex items-center gap-1.5 font-mono font-semibold text-textBlack">
                  <span>{selectedDeposit.reference}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(selectedDeposit.reference)}
                    className="p-1 text-textBlack/60 hover:text-textBlack cursor-pointer"
                    title="Copy Reference"
                  >
                    {copied ? <LuCheck size={12} className="text-green-600" /> : <LuCopy size={12} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Payment Channel</span>
                <span className="font-medium text-textBlack/80">{selectedDeposit.method}</span>
              </div>
              {selectedDeposit.accountNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-textBlack/60">Destination Account</span>
                  <span className="font-mono font-medium text-textBlack">
                    {selectedDeposit.accountNumber} ({selectedDeposit.bankName})
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-textBlack/60">Initiation Timestamp</span>
                <span className="text-textBlack/80">{formatShortDate(selectedDeposit.date)}</span>
              </div>
              {selectedDeposit.approvedAt && (
                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                  <span>Approved & Credited</span>
                  <span>{formatShortDate(selectedDeposit.approvedAt)}</span>
                </div>
              )}
              {selectedDeposit.rejectionReason && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  <strong>Rejection Note:</strong> {selectedDeposit.rejectionReason}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewModal(false);
                  setSelectedDeposit(null);
                }}
                className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={deleteModal && Boolean(selectedDeposit)}
        title="Delete Deposit Record"
        message={`Are you sure you want to delete deposit record ${selectedDeposit?.reference} for ${selectedDeposit?.companyName}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={isProcessing}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedDeposit(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ManageDeposit;