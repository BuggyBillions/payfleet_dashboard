import React, { useEffect, useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import PaginationControls from "../../utility/PaginationControls";
import OverviewCards from "../../components/cards/OverviewCards";
import ActionCell from "../../components/ui/ActionCell";
import RetryPayrollModal from "../../components/modal/RetryPayrollModal";
import type {
  TableColumnProps,
  SalaryPayment,
  SalaryPaymentMonth,
} from "../../lib/interfaces";
import { LuHistory, LuRefreshCw, LuX } from "react-icons/lu";
import { FaMoneyBillWave } from "react-icons/fa6";
import { LuTriangleAlert } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import { useUser } from "../../hooks/useUser";
import { useSalaryPayments } from "../../hooks/useSalaryPayments";
import { getErrorMessage } from "../../helpers/api";
import StatusBadge from "../../components/ui/StatusBadge";
import { FiChevronDown } from "react-icons/fi";

const buildColumns = (
  onRetry?: (payment: SalaryPayment) => void,
): TableColumnProps<SalaryPayment>[] => {
  const columns: TableColumnProps<SalaryPayment>[] = [
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
          {item.employee?.full_name || item.employee_name}
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
      label: "Destination",
      render: (item) =>
        item.employee ? (
          <span className="flex flex-col">
            <span className="text-inherit">{item.employee.bank_name}</span>
            <span className="text-[10px] text-textBlack/50">
              {item.employee.account_number}
            </span>
          </span>
        ) : (
          <span className="text-textBlack/40">—</span>
        ),
    },
    {
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Date",
      render: (item) => <span>{formatShortDate(item.payment_date)}</span>,
    },
  ];

  if (onRetry) {
    columns.push({
      label: "Action",
      render: (item) =>
        item.status === "failed" ? (
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
        ) : (
          <span className="text-textBlack/40">—</span>
        ),
    });
  }

  return columns;
};

/**
 * One expanded month from the API's grouped response. Pagination is over
 * month groups, so each group's payments render in full without its own
 * pager.
 */
const MonthPaymentsTable: React.FC<{
  payments: SalaryPayment[];
  onRetry?: (payment: SalaryPayment) => void;
}> = ({ payments, onRetry }) => (
  <ReusableTable
    columns={buildColumns(onRetry)}
    data={payments}
    isLoading={false}
    error={null}
    currentPage={1}
    totalPages={1}
    totalItems={payments.length}
    itemsPerPage={payments.length || 1}
    setCurrentPage={() => {}}
    setItemsPerPage={() => {}}
  />
);

/**
 * The month accordion shared by the Payments and Failed Transactions tabs.
 * Both tabs read the same grouped shape, so both render it identically.
 */
const MonthGroups: React.FC<{
  months: SalaryPaymentMonth[];
  expandedMonths: string[];
  onToggleMonth: (monthKey: string) => void;
  onRetry?: (payment: SalaryPayment) => void;
}> = ({ months, expandedMonths, onToggleMonth, onRetry }) => (
  <div className="flex flex-col gap-3">
    {months.map((group) => {
      const isOpen = expandedMonths.includes(group.month_key);

      return (
        <div
          key={group.month_key}
          className="bg-tertiary rounded-xl border border-primary/10 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => onToggleMonth(group.month_key)}
            aria-expanded={isOpen}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-secondary transition cursor-pointer"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-textBlack">
                {group.month}
              </span>
              <span className="text-[11px] text-textBlack/60">
                {group.count} payment{group.count === 1 ? "" : "s"}
                {group.successful_amount > 0 &&
                  ` • ${formatterUtility(group.successful_amount)} paid`}
                {group.pending_amount > 0 &&
                  ` • ${formatterUtility(group.pending_amount)} pending`}
                {group.failed_amount > 0 &&
                  ` • ${formatterUtility(group.failed_amount)} failed`}
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
              <MonthPaymentsTable payments={group.payments} onRetry={onRetry} />
            </div>
          )}
        </div>
      );
    })}
  </div>
);

/**
 * The API paginates month groups, so the current page cannot supply the full
 * list of months. Offer the most recent 12 instead so any month can be
 * targeted, and mark the ones present in the loaded page.
 */
const buildMonthOptions = (count = 12): Array<{ value: string; label: string }> => {
  const now = new Date();
  const options: Array<{ value: string; label: string }> = [];

  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });
  }

  return options;
};

const PaymentHistory: React.FC = () => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;
  const [tab, setTab] = useState<"payments" | "failed">("payments");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [month, setMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [retryTarget, setRetryTarget] = useState<SalaryPayment | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const isInvalidRange = Boolean(dateFrom && dateTo && dateTo < dateFrom);
  const activeRange =
    !isInvalidRange && (dateFrom || dateTo)
      ? { date_from: dateFrom || undefined, date_to: dateTo || undefined }
      : {};

  const { data, isLoading, isError, error } = useSalaryPayments({
    company_id: companyId,
    search: debouncedSearch,
    status: tab === "failed" ? "failed" : "all",
    month: month || undefined,
    ...activeRange,
    page: currentPage,
    per_page: perPage,
  });

  const months = data?.months ?? [];
  const pagination = data?.pagination;
  const monthOptions = buildMonthOptions();
  const loadedMonthKeys = new Set(months.map((m) => m.month_key));

  const totalPaid = months.reduce((sum, m) => sum + m.successful_amount, 0);
  const totalPayments = months.reduce((sum, m) => sum + m.count, 0);
  const totalFailedAmount = months.reduce((sum, m) => sum + m.failed_amount, 0);
  const totalAttempted = months.reduce((sum, m) => sum + m.total_amount, 0);
  const totalGroups = pagination?.total_groups ?? months.length;
  const lastPage = pagination?.last_page ?? 1;

  const failedPayments = months
    .flatMap((m) => m.payments)
    .filter((p) => p.status === "failed");
  const failedPaymentCount = failedPayments.length;
  const isFailedTab = tab === "failed";

  const resetPage = () => setCurrentPage(1);

  const hasActiveFilters = Boolean(
    debouncedSearch || month || dateFrom || dateTo,
  );

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setMonth("");
    setDateFrom("");
    setDateTo("");
    resetPage();
  };

  const handleTabChange = (next: "payments" | "failed") => {
    setTab(next);
    resetPage();
    setExpandedMonths([]);
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) =>
      prev.includes(monthKey)
        ? prev.filter((m) => m !== monthKey)
        : [...prev, monthKey],
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">Payment History</h2>
          <p className="text-sm text-textBlack/50">
            {data?.company?.name
              ? `All money paid out to staff of ${data.company.name}`
              : "View all money paid out to staff"}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 h-10 rounded-md text-xs font-medium border border-black/10 bg-secondary text-textBlack/70 hover:text-textBlack cursor-pointer"
          >
            <LuX size={12} />
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-tertiary rounded-xl p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-[10px] font-medium text-textBlack/60">
              Search
            </span>
            <span className="flex items-center gap-2 border border-black/10 rounded-md px-3 h-10 bg-secondary">
              <IoSearchOutline className="text-textBlack/40 shrink-0" />
              <input
                type="text"
                placeholder="Search by name or reference..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="w-full outline-0 text-sm placeholder:text-textBlack/40 bg-transparent"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-textBlack/60">
              Month
            </span>
            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                resetPage();
              }}
              className="w-full border border-black/10 text-textBlack bg-secondary rounded-md px-3 h-10 text-sm outline-0 cursor-pointer"
            >
              <option value="">All months</option>
              {monthOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="capitalize"
                >
                  {option.label}
                  {loadedMonthKeys.has(option.value) ? " •" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium text-textBlack/60">
                From
              </span>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  resetPage();
                }}
                className="w-full border border-black/10 text-textBlack bg-secondary rounded-md px-3 h-10 text-xs outline-0 cursor-pointer"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium text-textBlack/60">
                To
              </span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  resetPage();
                }}
                className={`w-full border rounded-md px-3 h-10 text-xs outline-0 cursor-pointer ${
                  isInvalidRange
                    ? "border-red-400 text-red-600"
                    : "border-black/10 text-textBlack bg-secondary"
                }`}
              />
            </label>
          </div>
        </div>

        {isInvalidRange && (
          <p className="text-[11px] text-red-600">
            The end date must be on or after the start date.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
        {isFailedTab ? (
          <>
            <OverviewCards
              title="Failed Amount"
              value={formatterUtility(totalFailedAmount)}
              icon={LuTriangleAlert}
            />
            <OverviewCards
              title="Failed Payments"
              value={failedPaymentCount}
              icon={LuHistory}
            />
            <OverviewCards
              title="Total Attempted"
              value={formatterUtility(totalAttempted)}
              icon={FaMoneyBillWave}
            />
          </>
        ) : (
          <>
            <OverviewCards
              title="Total Paid"
              value={formatterUtility(totalPaid)}
              icon={FaMoneyBillWave}
            />
            <OverviewCards
              title="Payments"
              value={totalPayments}
              icon={LuHistory}
            />
            <OverviewCards
              title="Failed Amount"
              value={formatterUtility(totalFailedAmount)}
              icon={LuTriangleAlert}
            />
          </>
        )}
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
            onClick={() => handleTabChange(t.key)}
            className={`px-4 pb-2.5 pt-1 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-textBlack/50 hover:text-textBlack"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="bg-tertiary rounded-xl p-8 text-center text-xs text-textBlack/50">
            Loading payments…
          </div>
        ) : isError ? (
          <div className="bg-tertiary rounded-xl p-8 text-center text-xs text-red-600">
            {getErrorMessage(error, "Failed to load payment history")}
          </div>
        ) : isFailedTab && failedPayments.length === 0 ? (
          <div className="bg-tertiary rounded-xl p-10 text-center">
            <p className="text-xs font-medium text-textBlack">
              No failed transactions
            </p>
            <p className="text-[11px] text-textBlack/50 mt-1">
              Every payment in this period went through successfully.
            </p>
          </div>
        ) : months.length === 0 ? (
          <div className="bg-tertiary rounded-xl p-8 text-center text-xs text-textBlack/50">
            {debouncedSearch
              ? `No payments matching "${debouncedSearch}".`
              : isFailedTab
                ? "No failed transactions in this period."
                : "No payments recorded yet."}
          </div>
        ) : (
          <MonthGroups
            months={months}
            expandedMonths={expandedMonths}
            onToggleMonth={toggleMonth}
            onRetry={isFailedTab ? setRetryTarget : undefined}
          />
        )}

        <PaginationControls
          currentPage={currentPage}
          totalPages={lastPage}
          totalItems={totalGroups}
          itemsPerPage={perPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setPerPage}
        />
      </div>

      {retryTarget && (
        <RetryPayrollModal
          payment={retryTarget}
          onClose={() => setRetryTarget(null)}
        />
      )}
    </div>
  );
};

export default PaymentHistory;
