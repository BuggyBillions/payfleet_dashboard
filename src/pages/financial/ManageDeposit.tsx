import React, { useState, useMemo } from "react";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import Modal from "../../components/modal/Modal";
import { toast } from "sonner";
import { formatShortDate, formatterUtility } from "../../helpers/formatterUtility";
import type { TableColumnProps } from "../../lib/interfaces";
import { FiSearch } from "react-icons/fi";
import {
  LuCircleCheck,
  LuClock,
  LuCopy,
  LuCheck,
  LuX,
  LuTriangleAlert,
  LuEye,
} from "react-icons/lu";
import { TbReceiptDollar, TbArrowUpRight } from "react-icons/tb";
import { BsCheck2Circle, BsXCircle } from "react-icons/bs";

export interface FinancialDepositProps {
  id: number;
  companyName: string;
  email: string;
  reference: string;
  amount: number;
  method: string;
  status: "successful" | "pending" | "failed";
  date: string;
  rejectionReason?: string;
  approvedAt?: string;
  accountNumber?: string;
  bankName?: string;
}

const statusBadge = (status: FinancialDepositProps["status"]) => {
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

const INITIAL_FINANCIAL_DEPOSITS: FinancialDepositProps[] = [
  {
    id: 1,
    companyName: "Acme Technologies Ltd",
    email: "finance@acmetech.io",
    reference: "PF-DEP-849201",
    amount: 1500000,
    method: "Bank Transfer (Paystack-Titan)",
    accountNumber: "9903723754",
    bankName: "Paystack-Titan",
    status: "pending",
    date: "2026-09-24T14:30:00",
  },
  {
    id: 2,
    companyName: "Sunmence Tech Limited",
    email: "company@payfleet.io",
    reference: "PF-DEP-849202",
    amount: 500000,
    method: "Bank Transfer (Wema Bank)",
    accountNumber: "9817625028",
    bankName: "Wema Bank",
    status: "pending",
    date: "2026-09-24T13:15:00",
  },
  {
    id: 3,
    companyName: "Global Logistics Inc",
    email: "billing@globallogistics.com",
    reference: "PF-DEP-849203",
    amount: 750000,
    method: "Bank Transfer",
    accountNumber: "9903723754",
    bankName: "Paystack-Titan",
    status: "successful",
    date: "2026-09-24T09:30:00",
    approvedAt: "2026-09-24T09:45:00",
  },
  {
    id: 4,
    companyName: "Apex Health Systems",
    email: "accounts@apexhealth.ng",
    reference: "PF-DEP-849204",
    amount: 3200000,
    method: "Bank Transfer",
    accountNumber: "9903723754",
    bankName: "Paystack-Titan",
    status: "pending",
    date: "2026-09-23T16:45:00",
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
];

const REJECTION_PRESETS = [
  "Payment not reflected in bank account statement",
  "Incorrect amount transferred",
  "Duplicate payment proof / transaction reference",
  "Account number / beneficiary mismatch",
  "Transaction expired before settlement",
];

const FinancialManageDeposit: React.FC = () => {
  const [depositList, setDepositList] = useState<FinancialDepositProps[]>(INITIAL_FINANCIAL_DEPOSITS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedDeposit, setSelectedDeposit] = useState<FinancialDepositProps | null>(null);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Statistics
  const pendingDeposits = useMemo(() => {
    return depositList.filter((d) => d.status === "pending");
  }, [depositList]);

  const pendingAmount = useMemo(() => {
    return pendingDeposits.reduce((sum, d) => sum + d.amount, 0);
  }, [pendingDeposits]);

  const approvedAmount = useMemo(() => {
    return depositList
      .filter((d) => d.status === "successful")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [depositList]);

  const rejectedCount = useMemo(() => {
    return depositList.filter((d) => d.status === "failed").length;
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
      // Simulate API approval call
      await new Promise((resolve) => setTimeout(resolve, 800));

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
    if (!selectedDeposit) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting this deposit");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API reject call
      await new Promise((resolve) => setTimeout(resolve, 800));

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

  const handleCopyRef = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      toast.success("Reference copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const columns: TableColumnProps<FinancialDepositProps>[] = [
    {
      label: "Company",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-xs">{item.companyName}</span>
          <span className="text-[11px] text-gray-500 lowercase">{item.email}</span>
        </div>
      ),
    },
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold uppercase tracking-wider text-xs font-mono text-gray-800">
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
        <span className="text-gray-600 text-xs flex items-center gap-1">
          <TbArrowUpRight size={13} className="text-gray-400 shrink-0" />
          {item.method}
        </span>
      ),
    },
    {
      label: "Status",
      render: (item) => statusBadge(item.status),
    },
    {
      label: "Date Submitted",
      render: (item) => (
        <span className="text-gray-500 text-xs">
          {formatShortDate(item.date)}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status === "pending" ? (
            <>
              {/* Quick Approve button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDeposit(item);
                  setApproveModal(true);
                }}
                className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 border border-green-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Approve and credit wallet"
              >
                <BsCheck2Circle size={12} />
                <span>Approve</span>
              </button>

              {/* Quick Reject button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDeposit(item);
                  setRejectionReason("");
                  setRejectModal(true);
                }}
                className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Reject deposit"
              >
                <BsXCircle size={12} />
                <span>Reject</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedDeposit(item);
                setViewModal(true);
              }}
              className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <LuEye size={12} />
              <span>Details</span>
            </button>
          )}

          <ActionCell
            rowId={Number(item.id)}
            canView={true}
            onView={() => {
              setSelectedDeposit(item);
              setViewModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900">
            Deposit Verification & Approvals
          </h2>
          <p className="text-sm text-gray-500">
            Review, verify bank settlements, and approve or reject inbound company wallet funding requests
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-amber-500/20">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600">{formatterUtility(pendingAmount)}</p>
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
              <LuClock size={12} /> {pendingDeposits.length} deposits awaiting review
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <LuTriangleAlert size={24} />
          </div>
        </div>

        {/* Total Settled Volume */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Total Approved Volume</p>
            <p className="text-2xl font-bold text-gray-900">{formatterUtility(approvedAmount)}</p>
            <span className="text-[11px] text-green-600 font-medium flex items-center gap-1 mt-1">
              <LuCircleCheck size={12} /> Successfully Credited to Wallets
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <TbReceiptDollar size={24} />
          </div>
        </div>

        {/* Rejected / Flagged Count */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Rejected Transactions</p>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            <span className="text-[11px] text-gray-500 font-medium mt-1">
              Declined or unverified deposits
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
            <BsXCircle size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-gray-900">Deposit Requests Queue</h3>
            <p className="text-xs text-gray-500">
              Verify incoming bank transfers and manage approvals
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
              className="h-10 px-3 text-xs rounded-lg border border-primary/10 bg-secondary outline-none text-gray-700 font-medium"
            >
              <option value="all">All Deposits</option>
              <option value="pending">Pending Only ({pendingDeposits.length})</option>
              <option value="successful">Approved / Successful</option>
              <option value="failed">Rejected / Failed</option>
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
                placeholder="Search company, reference..."
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

      {/* APPROVE MODAL */}
      {approveModal && selectedDeposit && (
        <Modal onClose={() => { setApproveModal(false); setSelectedDeposit(null); }} customMode>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <BsCheck2Circle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Approve Deposit</h3>
                <p className="text-xs text-gray-500">Credit client wallet balance</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2.5 border border-gray-100">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">Amount to Credit</span>
                <span className="font-bold text-base text-primary">{formatterUtility(selectedDeposit.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Company</span>
                <span className="font-semibold text-gray-800">{selectedDeposit.companyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono font-semibold text-gray-800">{selectedDeposit.reference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Channel</span>
                <span className="font-medium text-gray-700">{selectedDeposit.method}</span>
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200/80 rounded-xl text-xs text-green-900 leading-relaxed">
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
                className="w-1/2 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
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
                    <span>Confirm Approval</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {rejectModal && selectedDeposit && (
        <Modal onClose={() => { setRejectModal(false); setSelectedDeposit(null); }} customMode>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <BsXCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject Deposit</h3>
                <p className="text-xs text-gray-500">Decline deposit and notify client</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Deposit Reference:</span>
                <span className="font-mono font-semibold text-gray-800">{selectedDeposit.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-primary">{formatterUtility(selectedDeposit.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Company:</span>
                <span className="font-medium text-gray-800">{selectedDeposit.companyName}</span>
              </div>
            </div>

            {/* Rejection Reason Form */}
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="text-xs font-semibold text-gray-700 block">
                Reason for Rejection *
              </label>

              {/* Preset buttons */}
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-medium">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] rounded border border-gray-200 text-left transition cursor-pointer"
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
                className="w-full p-2.5 text-xs rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
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
                className="w-1/2 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || !rejectionReason.trim()}
                onClick={handleReject}
                className="w-1/2 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
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
        <Modal onClose={() => { setViewModal(false); setSelectedDeposit(null); }} customMode>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-auto shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Deposit Audit Report</h3>
                <p className="text-xs text-gray-500">Transaction ID & payment details</p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(selectedDeposit.status)}
                <button
                  type="button"
                  onClick={() => { setViewModal(false); setSelectedDeposit(null); }}
                  className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <LuX size={18} />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-3 border border-gray-100">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">Deposit Amount</span>
                <span className="font-bold text-base text-primary">{formatterUtility(selectedDeposit.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Company Name</span>
                <span className="font-semibold text-gray-800">{selectedDeposit.companyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Company Email</span>
                <span className="font-medium text-gray-700">{selectedDeposit.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Reference</span>
                <div className="flex items-center gap-1.5 font-mono font-semibold text-gray-800">
                  <span>{selectedDeposit.reference}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(selectedDeposit.reference)}
                    className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                    title="Copy Reference"
                  >
                    {copied ? <LuCheck size={12} className="text-green-600" /> : <LuCopy size={12} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Channel</span>
                <span className="font-medium text-gray-700">{selectedDeposit.method}</span>
              </div>
              {selectedDeposit.accountNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Destination Account</span>
                  <span className="font-mono font-medium text-gray-800">
                    {selectedDeposit.accountNumber} ({selectedDeposit.bankName})
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Date Submitted</span>
                <span className="font-medium text-gray-700">{new Date(selectedDeposit.date).toLocaleString()}</span>
              </div>
              {selectedDeposit.approvedAt && (
                <div className="flex justify-between items-center text-green-700 bg-green-50 p-2 rounded-lg">
                  <span>Approved At</span>
                  <span className="font-semibold">{new Date(selectedDeposit.approvedAt).toLocaleString()}</span>
                </div>
              )}
              {selectedDeposit.rejectionReason && (
                <div className="flex flex-col gap-1 text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  <span className="font-bold text-[11px] uppercase">Rejection Reason</span>
                  <span className="text-xs">{selectedDeposit.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewModal(false);
                  setSelectedDeposit(null);
                }}
                className="w-full py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FinancialManageDeposit;
