import React, { useEffect, useMemo, useState } from "react";
import type {
  DepositsProps,
  DemoDeposit,
  TableColumnProps,
} from "../../lib/interfaces";
import { formatterUtility, formatDateTime } from "../../helpers/formatterUtility";
import ActionButton from "../../components/ui/ActionButton";
import OverviewCards from "../../components/cards/OverviewCards";
import StatusBadge from "../../components/ui/StatusBadge";
import ActionCell from "../../components/ui/ActionCell";
import ReusableTable from "../../utility/ReusableTable";
import { FaPlus } from "react-icons/fa6";
import { LuWallet, LuClock, LuCheck, LuCopy } from "react-icons/lu";
import { copyToClipboard } from "../../helpers/clipboardHelper";
import Deposit from "../../components/modal/Deposit";
import EachCompanyDepositModal from "../../components/modal/EachCompanyDepositModal";
import { useUser } from "../../hooks/useUser";
import {
  getCompanyDeposits,
  type CompanyDeposit,
} from "../../services/depositService";
import { FiSearch } from "react-icons/fi";

interface DepositRow extends Omit<DemoDeposit, "id"> {
  id: number | string;
}

const normalizeStatus = (status: CompanyDeposit["status"]): DemoDeposit["status"] => {
  if (typeof status === "number") {
    return status === 1 ? "successful" : status === 0 ? "pending" : "failed";
  }
  if (typeof status === "boolean") {
    return status ? "successful" : "pending";
  }
  const s = String(status ?? "").toLowerCase();
  if (["successful", "success", "completed", "succeeded", "approved", "paid", "credited"].includes(s)) {
    return "successful";
  }
  if (["pending", "processing", "initiated", "in_progress", "awaiting", "unsettled"].includes(s)) {
    return "pending";
  }
  return "failed";
};

const Deposits: React.FC<DepositsProps> = ({ defaultFilter = "all" }) => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [initiate, setInitiate] = useState(false);
  const [viewDepositId, setViewDepositId] = useState<number | string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleCopyRef = async (ref: string) => {
    const success = await copyToClipboard(ref, "Reference");
    if (success) {
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const openView = (id: number | string) => setViewDepositId(id);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const columns: TableColumnProps<DepositRow>[] = [
    {
      label: "Reference",
      render: (d) => (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-textBlack/50 font-mono">{d.reference}</span>
          {d.reference && d.reference !== "—" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyRef(d.reference);
              }}
              className="text-textBlack/40 hover:text-primary transition cursor-pointer"
              title="Copy reference"
            >
              {copiedRef === d.reference ? (
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
      label: "Amount",
      render: (d) => (
        <span className="font-medium">{formatterUtility(d.amount)}</span>
      ),
    },
    { label: "Method", key: "method" },
    {
      label: "Status",
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      label: "Date & Time",
      render: (d) => (
        <span className="text-xs text-textBlack/70 font-medium whitespace-nowrap">
          {formatDateTime(d.date)}
        </span>
      ),
    },
    {
      label: "Action",
      render: (d) => (
        <ActionCell rowId={d.id} canView onView={openView} />
      ),
    },
  ];

  useEffect(() => {
    let mounted = true;
    getCompanyDeposits(companyId)
      .then((items) => {
        if (!mounted) return;
        const mapped: DepositRow[] = items.map((t) => {
          const transaction = t.transaction ?? ({} as Record<string, unknown>);
          const reference = String(
            transaction.reference ??
            t.reference ??
            t.reference_no ??
            t.transaction_reference ??
            t.ref ??
            "",
          );
          const amount = Number(transaction.amount ?? t.amount) || 0;
          const status = normalizeStatus(
            (transaction.status as CompanyDeposit["status"]) ?? t.status,
          );
          const createdAt = String(
            t.created_at ??
            t.date ??
            transaction.created_at ??
            new Date().toISOString(),
          );
          return {
            id: t.id ?? Date.now(),
            reference:
              reference ||
              `PF-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
            amount,
            method: t.method ?? "Bank Transfer",
            status,
            date: createdAt,
          };
        });
        mapped.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setDeposits(mapped);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [companyId]);

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

  const filteredDeposits = useMemo(() => {
    let list = deposits;
    if (defaultFilter === "pending") {
      list = list.filter((d) => d.status === "pending");
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.reference.toLowerCase().includes(q) ||
          d.method.toLowerCase().includes(q) ||
          d.status.toLowerCase().includes(q) ||
          d.amount.toString().includes(q),
      );
    }
    return list;
  }, [deposits, defaultFilter, debouncedSearch]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredDeposits.length / itemsPerPage) || 1;
  }, [filteredDeposits.length, itemsPerPage]);

  const paginatedDeposits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDeposits.slice(start, start + itemsPerPage);
  }, [filteredDeposits, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleDepositSuccess = (newDeposit: DemoDeposit) => {
    setDeposits((prev) => [newDeposit, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">
            {defaultFilter === "pending" ? "Pending Deposits" : "Deposits"}
          </h2>
          <p className="text-xs text-textBlack/60">
            {defaultFilter === "pending"
              ? "Monitor and track incoming deposits awaiting bank confirmation."
              : "Manage all deposit transactions."}
          </p>
        </div>
        <div className="shrink-0">
          <ActionButton
            text="Deposit Funds"
            icon={<FaPlus />}
            onClick={() => setInitiate(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuWallet}
          title="Available Account Balance"
          value={formatterUtility(totalBalance)}
        />
        <OverviewCards
          icon={LuClock}
          title="Pending Deposits"
          value={formatterUtility(pendingAmount)}
        />
      </div>

      <div className="bg-tertiary p-4 dark:bg-[#131217] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, method, amount..."
              className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-sm text-textBlack outline-none w-64 md:w-80 focus:border-primary/30 transition-colors placeholder:text-textBlack/40"
            />
          </div>
        </div>

        <ReusableTable
          columns={columns}
          data={paginatedDeposits}
          isLoading={loading}
          error={null}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDeposits.length}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      {initiate && (
        <Deposit
          onClose={() => setInitiate(false)}
          onDepositSuccess={handleDepositSuccess}
          companyId={companyId}
        />
      )}

      {viewDepositId && (
        <EachCompanyDepositModal
          depositId={viewDepositId}
          onClose={() => setViewDepositId(null)}
        />
      )}
    </div>
  );
};

export default Deposits;