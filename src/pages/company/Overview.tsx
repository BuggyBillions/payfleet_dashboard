import React, { useEffect, useState } from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps } from "../../lib/interfaces";
import { LuUsersRound, LuWallet } from "react-icons/lu";
import { TbReceiptDollar } from "react-icons/tb";
import { FaMoneyBillWave } from "react-icons/fa6";
import {
  formatterUtility,
  formatShortDate,
  getUserDisplayName,
} from "../../helpers/formatterUtility";
import { useUser } from "../../hooks/useUser";
import { useMyCompanyStats } from "../../hooks/useCompany";
import { getEmployees } from "../../services/employeeService";
import {
  getCompanyDeposits,
  type CompanyDeposit,
} from "../../services/depositService";
import StatusBadge from "../../components/ui/StatusBadge";
import PageHeader from "../../components/navs/PageHeader";

interface DepositRow {
  id: number | string;
  reference: string;
  amount: number;
  status: "successful" | "pending" | "failed";
  date: string;
}

const normalizeStatus = (
  status: CompanyDeposit["status"],
): DepositRow["status"] => {
  if (typeof status === "number") {
    return status === 1 ? "successful" : status === 0 ? "pending" : "failed";
  }
  if (typeof status === "boolean") {
    return status ? "successful" : "pending";
  }
  const s = String(status ?? "").toLowerCase();
  if (
    [
      "successful",
      "success",
      "completed",
      "succeeded",
      "approved",
      "paid",
      "credited",
    ].includes(s)
  ) {
    return "successful";
  }
  if (
    [
      "pending",
      "processing",
      "initiated",
      "in_progress",
      "awaiting",
      "unsettled",
    ].includes(s)
  ) {
    return "pending";
  }
  return "failed";
};

const Overview: React.FC = () => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;
  const displayName = getUserDisplayName(user as Record<string, unknown> | null);

  const [rows, setRows] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(0);

  const { data: statsData } = useMyCompanyStats();

  useEffect(() => {
    let mounted = true;
    Promise.all([
      companyId
        ? getEmployees({ company_id: companyId, per_page: 500 })
        : Promise.resolve({ items: [], totalItems: 0, totalPages: 1, currentPage: 1 }),
      getCompanyDeposits(companyId),
    ])
      .then(([empData, deposits]) => {
        if (!mounted) return;
        const employees = empData.items ?? [];
        let payroll = 0;
        employees.forEach((emp) => {
          payroll += Number(emp.estimate_pay) || 0;
        });
        setTotalEmployees(empData.totalItems ?? employees.length);
        setTotalPayroll(payroll);

        const mapped: DepositRow[] = deposits.map((t) => {
          const transaction = t.transaction ?? ({} as Record<string, unknown>);
          const reference = String(
            transaction.reference ??
              t.reference ??
              t.reference_no ??
              t.transaction_reference ??
              t.ref ??
              "",
          );
          return {
            id: t.id ?? Date.now(),
            reference:
              reference ||
              `PF-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
            amount: Number(transaction.amount ?? t.amount) || 0,
            status: normalizeStatus(
              (transaction.status as CompanyDeposit["status"]) ?? t.status,
            ),
            date: String(
              t.created_at ??
                t.date ??
                transaction.created_at ??
                new Date().toISOString(),
            ),
          };
        });
        mapped.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setRows(mapped);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [companyId]);

  const recentTransactions = rows.slice(0, 5);

  // Prefer the /my-company-stats values, fall back to what we computed locally.
  const statEmployees = statsData?.totalEmployees || totalEmployees;
  const statEstimated = statsData?.estimatedSalary || totalPayroll;
  const statTotalPaid = statsData?.totalPaid || 0;
  const statBalance = statsData?.companyBalance || 0;

  const columns: TableColumnProps<DepositRow>[] = [
    {
      label: "Reference",
      render: (item) => (
        <span className="font-semibold text-inherit">{item.reference}</span>
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
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      label: "Date",
      render: (item) => <span>{formatShortDate(item.date)}</span>,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        heading={displayName ? `Welcome, ${displayName}` : "Welcome"}
        value="Here is your business breakdown"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 mb-4">
        <OverviewCards
          icon={LuUsersRound}
          title="Total Employees"
          value={statEmployees}
        />

        <OverviewCards
          icon={TbReceiptDollar}
          title="Estimated Salary"
          value={formatterUtility(statEstimated)}
        />

        <OverviewCards
          icon={FaMoneyBillWave}
          title="Total Paid"
          value={formatterUtility(statTotalPaid)}
        />

        <OverviewCards
          icon={LuWallet}
          title="Wallet Balance"
          value={formatterUtility(statBalance)}
        />
      </div>

      <div className="bg-tertiary rounded-xl p-4">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold text-textBlack">Recent Transactions</h3>
          <p className="text-xs text-gray-500 dark:text-textBlack/75">
            Your most recent deposit activity
          </p>
        </div>
        <ReusableTable
          columns={columns}
          data={recentTransactions}
          isLoading={loading}
          error={null}
          currentPage={1}
          totalPages={1}
          totalItems={recentTransactions.length}
          itemsPerPage={5}
          setCurrentPage={() => {}}
          setItemsPerPage={() => {}}
        />
      </div>
    </div>
  );
};

export default Overview;