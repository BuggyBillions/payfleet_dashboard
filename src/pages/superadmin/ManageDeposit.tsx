import React, { useState, useMemo } from 'react';
import ReusableTable from '../../utility/ReusableTable';
import ActionCell from '../../components/ui/ActionCell';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import Modal from '../../components/modal/Modal';
import { getErrorMessage } from '../../helpers/api';
import { toast } from "sonner";
import { formatShortDate, formatterUtility } from '../../helpers/formatterUtility';
import type { TableColumnProps } from '../../lib/interfaces';
import { FiSearch } from 'react-icons/fi';
import { LuWallet, LuCircleCheck, LuClock, LuCopy, LuCheck } from 'react-icons/lu';
import { TbReceiptDollar, TbArrowUpRight } from 'react-icons/tb';

export interface AdminDepositProps {
  id: number;
  companyName: string;
  email: string;
  reference: string;
  amount: number;
  method: string;
  status: "successful" | "pending" | "failed";
  date: string;
}

const statusBadge = (status: AdminDepositProps["status"]) => {
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

const INITIAL_DEPOSIT_DATA: AdminDepositProps[] = [
  {
    id: 1,
    companyName: 'Acme Technologies Ltd',
    email: 'finance@acmetech.io',
    reference: 'PF-DEP-849201',
    amount: 1500000,
    method: 'Bank Transfer',
    status: 'successful',
    date: '2026-09-24T10:15:00',
  },
  {
    id: 2,
    companyName: 'Global Logistics Inc',
    email: 'billing@globallogistics.com',
    reference: 'PF-DEP-849202',
    amount: 750000,
    method: 'Bank Transfer',
    status: 'successful',
    date: '2026-09-24T09:30:00',
  },
  {
    id: 3,
    companyName: 'Apex Health Systems',
    email: 'accounts@apexhealth.ng',
    reference: 'PF-DEP-849203',
    amount: 3200000,
    method: 'Bank Transfer',
    status: 'pending',
    date: '2026-09-23T16:45:00',
  },
  {
    id: 4,
    companyName: 'Sterling Retail Hub',
    email: 'admin@sterlinghub.com',
    reference: 'PF-DEP-849204',
    amount: 450000,
    method: 'Card',
    status: 'successful',
    date: '2026-09-23T14:20:00',
  },
  {
    id: 5,
    companyName: 'Vanguard Media Group',
    email: 'pay@vanguardmedia.io',
    reference: 'PF-DEP-849205',
    amount: 890000,
    method: 'Bank Transfer',
    status: 'failed',
    date: '2026-09-22T11:10:00',
  },
  {
    id: 6,
    companyName: 'Bluecrest Energy',
    email: 'treasury@bluecrestenergy.com',
    reference: 'PF-DEP-849206',
    amount: 5000000,
    method: 'Bank Transfer',
    status: 'successful',
    date: '2026-09-22T08:05:00',
  },
  {
    id: 7,
    companyName: 'Sunmence Tech Limited',
    email: 'company@payfleet.io',
    reference: 'PF-DEP-849207',
    amount: 500000,
    method: 'Bank Transfer',
    status: 'successful',
    date: '2026-09-21T15:40:00',
  },
];

const ManageDeposit: React.FC = () => {
  const [depositList, setDepositList] = useState<AdminDepositProps[]>(INITIAL_DEPOSIT_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<AdminDepositProps | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleDelete = async () => {
    if (!selectedDeposit) return;
    setLoading(true);
    try {
      setDepositList((prev) => prev.filter((item) => item.id !== selectedDeposit.id));
      toast.success(`Deposit record ${selectedDeposit.reference} deleted successfully`);
      setDeleteModal(false);
      setSelectedDeposit(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete deposit record"));
    } finally {
      setLoading(false);
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

  const columns: TableColumnProps<AdminDepositProps>[] = [
    {
      label: 'Company',
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
        <span className="font-semibold text-primary">
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
      label: "Date & Time",
      render: (item) => (
        <span className="text-gray-500 text-xs">
          {formatShortDate(item.date)}
        </span>
      ),
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (item) => (
        <ActionCell
          rowId={Number(item.id)}
          canView={true}
          onView={() => {
            setSelectedDeposit(item);
            setViewModal(true);
          }}
          onDelete={() => {
            setSelectedDeposit(item);
            setDeleteModal(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900">
            Manage Deposits
          </h2>
          <p className="text-sm text-gray-500">
            Monitor and manage all inbound wallet funding transactions across all client companies
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Platform Volume */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Total Platform Volume</p>
            <p className="text-2xl font-bold text-gray-900">{formatterUtility(totalVolume)}</p>
            <span className="text-[11px] text-green-600 font-medium flex items-center gap-1 mt-1">
              <LuCircleCheck size={12} /> Verified & Settled
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <TbReceiptDollar size={24} />
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600">{formatterUtility(pendingVolume)}</p>
            <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
              <LuClock size={12} /> Awaiting Gateway Webhook
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <LuWallet size={22} />
          </div>
        </div>

        {/* Successful Deposits Count */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-tableHeading font-medium">Completed Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{successfulCount}</p>
            <span className="text-[11px] text-gray-500 font-medium mt-1">
              Across all registered companies
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <LuCircleCheck size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-gray-900">Deposit Audit Log</h3>
            <p className="text-xs text-gray-500">
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteModal && Boolean(selectedDeposit)}
        title="Delete Deposit Record"
        message={`Are you sure you want to delete deposit record ${selectedDeposit?.reference}? This action is irreversible.`}
        confirmText="Yes, Delete"
        isLoading={loading}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedDeposit(null);
        }}
        onConfirm={handleDelete}
      />

      {/* View Deposit Details Modal */}
      {viewModal && selectedDeposit && (
        <Modal onClose={() => { setViewModal(false); setSelectedDeposit(null); }} customMode>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Deposit Details</h3>
                <p className="text-xs text-gray-500">Transaction ID & payment audit report</p>
              </div>
              <div>{statusBadge(selectedDeposit.status)}</div>
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
                <span className="text-gray-500">Channel</span>
                <span className="font-medium text-gray-700">{selectedDeposit.method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium text-gray-700">{new Date(selectedDeposit.date).toLocaleString()}</span>
              </div>
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
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageDeposit;