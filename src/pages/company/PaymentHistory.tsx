import React, { useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import OverviewCards from "../../components/cards/OverviewCards";
import ActionCell from "../../components/ui/ActionCell";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import type { TableColumnProps } from "../../lib/interfaces";
import { LuHistory, LuRefreshCw, LuCircleCheck } from "react-icons/lu";
import { FaMoneyBillWave } from "react-icons/fa6";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import {
  getDemoPayments,
  type DemoPayment,
} from "../../services/demoPaymentService";
import StatusBadge from "../../components/ui/StatusBadge";
import { FiChevronDown } from "react-icons/fi";

const buildColumns = (
  onRetry?: (payment: DemoPayment) => void,
): TableColumnProps<DemoPayment>[] => {
  const columns: TableColumnProps<DemoPayment>[] = [
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold uppercase">{item.reference}</span>
      ),
    },
    {
      label: "Employee",
      render: (item) => (
        <span className="font-semibold text-inherit">
          {item.employee_name}
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
    { label: "Method", key: "method" },
    {
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Date",
      render: (item) => <span>{formatShortDate(item.date)}</span>,
    },
  ];

  if (onRetry) {
    columns.push({
      label: "Action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          otherActions={[
            {
              name: "Retry",
              icon: <LuRefreshCw size={12} />,
              action: () => onRetry(item),
            },
          ]}
        />
      ),
    });
  }

  return columns;
};

/**
 * Paginated table rendered inside each expanded month of the Payments
 * accordion. Keeps its own page state so months paginate independently.
 */
const MonthPaymentsTable: React.FC<{
  payments: DemoPayment[];
  onRetry: (payment: DemoPayment) => void;
}> = ({ payments, onRetry }) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const totalItems = payments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const data = payments.slice((page - 1) * perPage, (page - 1) * perPage + perPage);

  return (
    <ReusableTable
      columns={buildColumns(onRetry)}
      data={data}
      isLoading={false}
      error={null}
      currentPage={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={perPage}
      setCurrentPage={setPage}
      setItemsPerPage={setPerPage}
    />
  );
};

const PaymentHistory: React.FC = () => {
  const [tab, setTab] = useState<"payments" | "failed">("payments");

  const [payments] = useState<DemoPayment[]>(() => getDemoPayments());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [retryTarget, setRetryTarget] = useState<DemoPayment | null>(null);

  // The second tab lists only the transactions that failed, each one
  // individually retryable from the action cell.
  const failedPayments = payments.filter((p) => p.status === "failed");

  const totalItems = failedPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = failedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const totalPaid = payments
    .filter((p) => p.status === "successful")
    .reduce((sum, p) => sum + p.amount, 0);

  // Group payments by month so the Payments tab can render an accordion.
  const byMonth = (() => {
    const groups = new Map<string, DemoPayment[]>();
    [...payments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((payment) => {
        const date = new Date(payment.date);
        const key = isNaN(date.getTime())
          ? "Unknown"
          : date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
        const bucket = groups.get(key);
        if (bucket) bucket.push(payment);
        else groups.set(key, [payment]);
      });
    return [...groups.entries()];
  })();

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month],
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">Payment History</h2>
          <p className="text-sm text-textBlack/50">
            View all money paid out to staff
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <OverviewCards
          title="Total Paid"
          value={formatterUtility(totalPaid)}
          icon={FaMoneyBillWave}
        />
        <OverviewCards
          title="Payments"
          value={totalItems}
          icon={LuHistory}
        />
      </div>

      <div className="flex items-center gap-1 border-b border-black/10">
        {(
          [
            { key: "payments", label: "Payments" },
            { key: "failed", label: "Failed Transactions" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 pb-2.5 pt-1 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-textBlack/50 hover:text-textBlack"
            }`}
          >
            {t.label}
            {t.key === "failed" && failedPayments.length > 0 && (
              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-semibold">
                {failedPayments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "payments" ? (
        <div className="flex flex-col gap-3">
          {byMonth.length === 0 ? (
            <div className="bg-tertiary rounded-xl p-8 text-center text-xs text-textBlack/50">
              No payments recorded yet.
            </div>
          ) : (
            byMonth.map(([month, monthPayments]) => {
              const isOpen = expandedMonths.includes(month);
              const monthTotal = monthPayments
                .filter((p) => p.status === "successful")
                .reduce((sum, p) => sum + p.amount, 0);

              return (
                <div
                  key={month}
                  className="bg-tertiary rounded-xl border border-primary/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleMonth(month)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-secondary transition cursor-pointer"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-textBlack">
                        {month}
                      </span>
                      <span className="text-[11px] text-textBlack/60">
                        {monthPayments.length} payment
                        {monthPayments.length === 1 ? "" : "s"}
                        {monthTotal > 0 &&
                          ` • ${formatterUtility(monthTotal)} paid`}
                      </span>
                    </div>
                    <FiChevronDown
                      size={16}
                      className={`text-textBlack/50 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-primary/10 p-3">
                      <MonthPaymentsTable
                        payments={monthPayments}
                        onRetry={setRetryTarget}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : failedPayments.length === 0 ? (
        <div className="bg-tertiary rounded-xl p-10 text-center">
          <LuCircleCheck className="mx-auto text-emerald-500 mb-2" size={22} />
          <p className="text-xs font-medium text-textBlack">
            No failed transactions
          </p>
          <p className="text-[11px] text-textBlack/50 mt-1">
            Every payment in this period went through successfully.
          </p>
        </div>
      ) : (
        <div className="bg-tertiary p-2">
          <ReusableTable
            columns={buildColumns(setRetryTarget)}
            data={paginatedData}
            isLoading={false}
            error={null}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!retryTarget}
        title="Retry transaction?"
        message={`Would you like to retry the payment to ${
          retryTarget?.employee_name ?? ""
        } for ${formatterUtility(retryTarget?.amount ?? 0)}?`}
        confirmText="Yes, Retry"
        onCancel={() => setRetryTarget(null)}
        onConfirm={() => setRetryTarget(null)}
        isLoading={false}
      />
    </div>
  );
};

export default PaymentHistory;