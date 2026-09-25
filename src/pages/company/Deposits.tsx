import React, { useEffect, useMemo, useState } from "react";
import type {
  DepositsProps,
  DemoDeposit,
  TableColumnProps,
} from "../../lib/interfaces";
import { formatterUtility } from "../../helpers/formatterUtility";
import ActionButton from "../../components/ui/ActionButton";
import OverviewCards from "../../components/cards/OverviewCards";
import StatusBadge from "../../components/ui/StatusBadge";
import ActionCell from "../../components/ui/ActionCell";
import ReusableTable from "../../utility/ReusableTable";
import { FaPlus } from "react-icons/fa6";
import { LuWallet, LuClock } from "react-icons/lu";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import Deposit from "../../components/modal/Deposit";
import EachCompanyDepositModal from "../../components/modal/EachCompanyDepositModal";
import { useUser } from "../../hooks/useUser";
import {
  getCompanyDeposits,
  type CompanyDeposit,
} from "../../services/depositService";

interface DepositRow extends DemoDeposit {
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

  const openView = (id: number | string) => setViewDepositId(id);

  const columns: TableColumnProps<DepositRow>[] = [
    {
      label: "Reference",
      render: (d) => (
        <span className="font-semibold text-textBlack">{d.reference}</span>
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
      label: "Date",
      render: (d) =>
        new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
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
              : "Manage all  deposit transactions."}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuWallet}
          title="Available Account Balance"
          value={formatterUtility(totalBalance)}
          icon2={HiOutlineArrowTrendingUp}
        />
        <OverviewCards
          icon={LuClock}
          title="Pending Deposits"
          value={formatterUtility(pendingAmount)}
          icon2={HiOutlineArrowTrendingUp}
        />
      </div>

      <div className="bg-white dark:bg-[#131217] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-textBlack">
              Recent Transactions
            </h3>
            <p className="text-xs text-textBlack/60">
              Latest deposit activity for your business.
            </p>
          </div>
        </div>
        <ReusableTable
          columns={columns}
          data={deposits}
          isLoading={loading}
          error={null}
          currentPage={currentPage}
          totalPages={Math.ceil(deposits.length / itemsPerPage) || 1}
          totalItems={deposits.length}
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