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
import { LuClock, LuCopy, LuCheck } from "react-icons/lu";
import { TbReceiptDollar, TbArrowUpRight } from "react-icons/tb";
import { BsCheck2Circle, BsXCircle } from "react-icons/bs";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  useDeposits,
  useDepositStats,
  useApproveDeposit,
  useRejectDeposit,
  useDeleteDeposit,
} from "../../hooks/useDeposit";

export type { DepositItemProps, ManageDepositProps };
export const INITIAL_DEPOSIT_DATA: DepositItemProps[] = [];

const REJECTION_PRESETS = [
  "Payment not reflected in clearing bank account",
  "Incorrect amount transferred",
  "Duplicate transaction reference proof",
  "Account number / beneficiary mismatch",
  "Transaction clearing window expired",
];

const ManageDeposit: React.FC<ManageDepositProps> = ({
  defaultFilter = "all",
  role = "admin",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setStatusFilter(defaultFilter);
    setCurrentPage(1);
  }, [defaultFilter]);

  // Main paginated query using GET /all-deposit?search=...
  const {
    data: depositData,
    isLoading: loadingDeposits,
    isFetching,
    error: tableError,
    refetch,
  } = useDeposits({
    page: currentPage,
    per_page: itemsPerPage,
    searchTerm: debouncedSearch,
    status: statusFilter,
  });

  // Global deposit stats query for accurate KPI cards
  const { data: statsData } = useDepositStats();

  const depositList = depositData?.items ?? [];
  const totalItems = depositData?.totalItems ?? depositList.length;
  const totalPages = depositData?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Platform statistics derived from /deposit-stats or current list fallback
  const allDeposits = statsData?.items && statsData.items.length > 0 ? statsData.items : depositList;

  const totalVolume = useMemo(() => {
    if (statsData?.totalVolume !== undefined && statsData.totalVolume > 0) {
      return statsData.totalVolume;
    }
    return allDeposits
      .filter((d) => d.status === "successful")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [allDeposits, statsData?.totalVolume]);

  const pendingVolume = useMemo(() => {
    if (statsData?.pendingVolume !== undefined && statsData.pendingVolume > 0) {
      return statsData.pendingVolume;
    }
    return allDeposits
      .filter((d) => d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [allDeposits, statsData?.pendingVolume]);

  const successfulCount = useMemo(() => {
    if (statsData?.successfulCount !== undefined && statsData.successfulCount > 0) {
      return statsData.successfulCount;
    }
    return allDeposits.filter((d) => d.status === "successful").length;
  }, [allDeposits, statsData?.successfulCount]);

  const pendingCount = useMemo(() => {
    if (statsData?.pendingCount !== undefined && statsData.pendingCount > 0) {
      return statsData.pendingCount;
    }
    return allDeposits.filter((d) => d.status === "pending").length;
  }, [allDeposits, statsData?.pendingCount]);

  const failedCount = useMemo(() => {
    if (statsData?.failedCount !== undefined && statsData.failedCount > 0) {
      return statsData.failedCount;
    }
    return allDeposits.filter((d) => d.status === "failed").length;
  }, [allDeposits, statsData?.failedCount]);

  const totalDepositsCount = statsData?.totalDeposits || statsData?.totalItems || totalItems;

  const statusTabs = useMemo(() => {
    return [
      { label: "All", value: "all", count: totalDepositsCount },
      { label: "Pending", value: "pending", count: pendingCount },
      { label: "Successful", value: "successful", count: successfulCount },
      { label: "Failed", value: "failed", count: failedCount },
    ];
  }, [totalDepositsCount, pendingCount, successfulCount, failedCount]);

  // Mutations
  const approveMutation = useApproveDeposit();
  const rejectMutation = useRejectDeposit();
  const deleteMutation = useDeleteDeposit();

  const handleApprove = async () => {
    if (!selectedDeposit) return;
    approveMutation.mutate(selectedDeposit.id, {
      onSuccess: () => {
        toast.success(
          `Deposit ${selectedDeposit.reference} approved! ${formatterUtility(
            selectedDeposit.amount
          )} credited to ${selectedDeposit.companyName}.`
        );
        setApproveModal(false);
        setSelectedDeposit(null);
        refetch();
      },
    });
  };

  const handleReject = async () => {
    if (!selectedDeposit) return;
    const reasonText = rejectionReason.trim() || "fraudulent";
    rejectMutation.mutate(
      {
        id: selectedDeposit.id,
        amount: Number(selectedDeposit.amount),
        company_id: selectedDeposit.company_id || selectedDeposit.companyId,
        description: reasonText,
        reason: reasonText,
      },
      {
        onSuccess: () => {
          toast.success(
            `Deposit ${selectedDeposit.reference} for ${selectedDeposit.companyName} has been declined.`
          );
          setRejectModal(false);
          setSelectedDeposit(null);
          setRejectionReason("");
          refetch();
        },
      }
    );
  };

  const handleDelete = async () => {
    if (!selectedDeposit) return;
    deleteMutation.mutate(selectedDeposit.id, {
      onSuccess: () => {
        setDeleteModal(false);
        setSelectedDeposit(null);
        refetch();
      },
    });
  };

  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleCopyRef = (ref: string) => {
    if (!ref || ref === "—") return;
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    toast.success("Reference copied to clipboard");
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const getInitials = (name?: string) => {
    if (!name) return "CP";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const columns: TableColumnProps<DepositItemProps>[] = [
    {
      label: "Company / Reference",
      key: "companyName",
      render: (item: DepositItemProps) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-textBlack text-sm">{item.companyName}</span>
            <span className=" text-textBlack/70 text-xs">{item.email}</span>
          </div>
        </div>
      ),
    },
    {
      label: "Amount",
      key: "amount",
      render: (item: DepositItemProps) => (
        <span className="font-bold text-textBlack text-xs">
          {formatterUtility(item.amount)}
        </span>
      ),
    },
    {
      label: "Refrence No.",
      key: "refrence",
      render: (item: DepositItemProps) => (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-textBlack/50 font-mono">{item.reference}</span>
          {item.reference && item.reference !== "—" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyRef(item.reference);
              }}
              className="text-textBlack/40 hover:text-primary transition cursor-pointer"
              title="Copy reference"
            >
              {copiedRef === item.reference ? (
                <LuCheck size={11} className="text-emerald-500" />
              ) : (
                <LuCopy size={11} />
              )}
            </button>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (item: DepositItemProps) => <StatusBadge status={item.status} />,
    },
    {
      label: "Deposit Date",
      key: "date",
      render: (item: DepositItemProps) => (
        <span className="text-xs text-textBlack/70 font-medium">
          {formatShortDate(item.date)}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (item: DepositItemProps) => {
        const otherActions = [
          ...(item.status === "pending"
            ? [
              {
                name: "Approve Deposit",
                icon: <BsCheck2Circle className="text-emerald-500" />,
                action: () => {
                  setSelectedDeposit(item);
                  setApproveModal(true);
                },
              },
              {
                name: "Decline Deposit",
                icon: <BsXCircle className="text-red-500" />,
                action: () => {
                  setSelectedDeposit(item);
                  setRejectionReason("");
                  setRejectModal(true);
                },
              },
            ]
            : []),
        ];

        return (
          <ActionCell
            rowId={item.id}
            canView={true}
            onView={() => {
              setSelectedDeposit(item);
              setViewModal(true);
            }}
            otherActions={otherActions}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">
            {role === "financial"
              ? defaultFilter === "pending"
                ? "Pending Deposits Verification"
                : "Financial Deposits Management"
              : defaultFilter === "pending"
                ? "Deposit Verification & Approvals"
                : "Manage Deposits"}
          </h2>
          <p className="text-xs text-textBlack/60">
            {role === "financial"
              ? "Review, verify, and approve inbound wallet funding requests from client companies"
              : "Monitor and manage all inbound wallet funding transactions across all client companies"}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={TbReceiptDollar}
          title="Total Deposited"
          value={formatterUtility(totalVolume)}
        />
        <OverviewCards
          icon={LuClock}
          title="Pending Approvals"
          value={pendingCount.toString()}
        />
        <OverviewCards
          icon={TbArrowUpRight}
          title="Pending Volume"
          value={formatterUtility(pendingVolume)}
        />
        <OverviewCards
          icon={BsCheck2Circle}
          title="Settled Deposits"
          value={successfulCount.toString()}
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference, company, email..."
                className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-sm text-textBlack outline-none w-64 md:w-80 focus:border-primary/30 transition-colors placeholder:text-textBlack/40"
              />
            </div>
          </div>

          {/* Status Filter Tabs (all, pending, successful, failed) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-secondary p-1 rounded-xl border border-primary/10 self-start sm:self-auto">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center lg:gap-2 gap-1 px-1.5 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${isActive
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "text-textBlack/60 hover:text-textBlack hover:bg-primary/5"
                    }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isActive
                        ? "bg-white/20 text-white"
                        : tab.value === "pending" && tab.count > 0
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : tab.value === "failed" && tab.count > 0
                            ? "bg-red-500/15 text-red-600 dark:text-red-400"
                            : "bg-primary/10 text-textBlack/60"
                        }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Component */}
        <ReusableTable
          columns={columns}
          data={depositList}
          isLoading={loadingDeposits || isFetching}
          error={tableError}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          hasSerialNo={true}
        />
      </div>

      {/* APPROVE DEPOSIT MODAL */}
      {approveModal && selectedDeposit && (
        <Modal onClose={() => setApproveModal(false)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-primary/10">
              <div>
                <h3 className="text-base font-bold text-textBlack">Approve Bank Deposit</h3>
                <p className="text-xs text-textBlack/60">Confirm receipt of funds</p>
              </div>
            </div>

            <div className="bg-secondary p-4 rounded-xl space-y-2.5 text-xs border border-primary/10">
              <div className="flex justify-between">
                <span className="text-textBlack/60">Deposit Amount:</span>
                <span className="font-bold text-primary text-sm">
                  {formatterUtility(selectedDeposit.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-textBlack/60">Company:</span>
                <span className="font-semibold text-textBlack">{selectedDeposit.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textBlack/60">Reference:</span>
                <span className="font-mono font-semibold text-textBlack">{selectedDeposit.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textBlack/60">Channel:</span>
                <span className="font-medium text-textBlack/80">{selectedDeposit.method}</span>
              </div>
            </div>

            <p className="text-xs text-textBlack/70 leading-relaxed">
              Confirming this deposit will immediately credit{" "}
              <strong>{formatterUtility(selectedDeposit.amount)}</strong> to{" "}
              <strong>{selectedDeposit.companyName}</strong>'s available wallet balance.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-primary/20 text-textBlack/70 hover:bg-secondary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approveMutation.isPending}
                onClick={handleApprove}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                {approveMutation.isPending ? "Approving..." : "Confirm & Credit Wallet"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT DEPOSIT MODAL */}
      {rejectModal && selectedDeposit && (
        <Modal onClose={() => setRejectModal(false)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-textBlack">Decline Deposit</h3>
                  <p className="text-xs text-textBlack/60">Decline unverified bank transaction</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">

              <div className="basis-1/3 bg-secondary p-3.5 rounded-xl space-y-2 lg:space-y-4 text-xs border border-primary/10">
                <div className="flex flex-col">
                  <span className="text-textBlack/60">Amount:</span>
                  <span className="font-bold text-primary">{formatterUtility(selectedDeposit.amount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-textBlack/60">Company:</span>
                  <span className="font-medium text-textBlack">{selectedDeposit.companyName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-textBlack/60">Company email:</span>
                  <span className="font-medium text-textBlack">{selectedDeposit.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-textBlack/60">Reference:</span>
                  <span className="font-mono text-textBlack">{selectedDeposit.reference}</span>
                </div>
              </div>

              <div className="basis-2/3 space-y-2">
                <label className="text-xs font-semibold text-textBlack block">
                  Select Reason for Declining
                </label>
                <div className="lg:space-y-3 space-y-1 styled-scrollbar max-h-42 overflow-y-auto pr-1">
                  {REJECTION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition border cursor-pointer ${rejectionReason === preset
                        ? "bg-red-50 border-red-300 text-red-700 font-medium"
                        : "bg-secondary/50 border-primary/10 text-textBlack/70 hover:bg-secondary"
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Or type custom reason for client..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-primary/20 bg-secondary text-textBlack outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-primary/20 text-textBlack/70 hover:bg-secondary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={handleReject}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Declining..." : "Decline Deposit"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW DEPOSIT DETAILS MODAL */}
      {viewModal && selectedDeposit && (
        <Modal onClose={() => setViewModal(false)}>
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {getInitials(selectedDeposit.companyName)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-textBlack">Deposit Audit Report</h3>
                  <p className="text-xs text-textBlack/60">Transaction verification summary</p>
                </div>
              </div>
              <StatusBadge status={selectedDeposit.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-secondary p-4 rounded-xl border border-primary/10">
              <div>
                <span className="text-textBlack/60 block mb-0.5">Deposit Amount</span>
                <span className="font-bold text-primary text-base">
                  {formatterUtility(selectedDeposit.amount)}
                </span>
              </div>
              <div>
                <span className="text-textBlack/60 block mb-0.5">Company Name</span>
                <span className="font-semibold text-textBlack">{selectedDeposit.companyName}</span>
              </div>
              <div>
                <span className="text-textBlack/60 block mb-0.5">Notification Email</span>
                <span className="font-medium text-textBlack/80">{selectedDeposit.email}</span>
              </div>
              <div>
                <span className="text-textBlack/60 block mb-0.5">Transaction Reference</span>
                <div className="flex items-center gap-1.5 font-mono font-semibold text-textBlack">
                  <span>{selectedDeposit.reference}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(selectedDeposit.reference)}
                    className="text-textBlack/40 hover:text-primary transition p-0.5 cursor-pointer"
                  >
                    {copiedRef === selectedDeposit.reference ? (
                      <LuCheck size={12} className="text-emerald-500" />
                    ) : (
                      <LuCopy size={12} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-textBlack/60 block mb-0.5">Payment Method</span>
                <span className="font-medium text-textBlack/80">{selectedDeposit.method}</span>
              </div>
              {selectedDeposit.accountNumber && (
                <div>
                  <span className="text-textBlack/60 block mb-0.5">Destination Account</span>
                  <span className="font-mono text-textBlack/80">
                    {selectedDeposit.accountNumber} ({selectedDeposit.bankName})
                  </span>
                </div>
              )}
              <div>
                <span className="text-textBlack/60 block mb-0.5">Initiated Date</span>
                <span className="text-textBlack/80">{formatShortDate(selectedDeposit.date)}</span>
              </div>
              {selectedDeposit.approvedAt && (
                <div>
                  <span className="text-textBlack/60 block mb-0.5">Processed Timestamp</span>
                  <span className="text-textBlack/80">{formatShortDate(selectedDeposit.approvedAt)}</span>
                </div>
              )}
              {selectedDeposit.rejectionReason && (
                <div className="col-span-2 bg-red-50 p-3 rounded-lg border border-red-200 text-red-700">
                  <strong>Rejection Note:</strong> {selectedDeposit.rejectionReason}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewModal(false)}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition cursor-pointer shadow-sm"
              >
                Close Summary
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
        isLoading={deleteMutation.isPending}
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