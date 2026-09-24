import React from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps } from "../../lib/interfaces";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { LuUsersRound } from "react-icons/lu";
import { TbReceiptDollar } from "react-icons/tb";
import {
  formatterUtility,
  formatShortDate,
} from "../../helpers/formatterUtility";
import { useUser } from "../../hooks/useUser";
import { getDemoEmployees } from "../../services/demoEmployeeService";
import {
  getDemoPayments,
  type DemoPayment,
} from "../../services/demoPaymentService";

const statusBadge = (status: DemoPayment["status"]) => {
  const styles = {
    successful: "bg-green-50 text-green-600 border-green-500/30",
    pending: "bg-amber-50 text-amber-600 border-amber-500/30",
    failed: "bg-red-50 text-red-600 border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const Overview: React.FC = () => {
  const { user } = useUser();

  const employees = getDemoEmployees();
  const payments = getDemoPayments();

  const totalEmployees = employees.length;
  const estimatedSalary = employees
    .filter((emp) => emp.is_payroll)
    .reduce((sum, emp) => sum + emp.estimate_pay, 0);
  const completedPayments = payments.filter(
    (p) => p.status === "successful",
  );
  const totalSalaryPaid = completedPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const recentTransactions = payments.slice(0, 5);

  const columns: TableColumnProps<DemoPayment>[] = [
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
    {
      label: "Status",
      render: (item) => statusBadge(item.status),
    },
    {
      label: "Date",
      render: (item) => <span>{formatShortDate(item.date)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">
            Welcome <span className="capitalize">{user?.role}</span>
          </h2>
          <p className="text-sm text-gray-500">
            Here is your business breakdown overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuUsersRound}
          title="Total Employees"
          value={totalEmployees}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={TbReceiptDollar}
          title="Total Salary Paid"
          value={formatterUtility(totalSalaryPaid)}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={HiOutlineArrowTrendingUp}
          title="Completed Payments"
          value={completedPayments.length}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={LuUsersRound}
          title="Estimated Salary"
          value={formatterUtility(estimatedSalary)}
          icon2={HiOutlineArrowTrendingUp}
        />
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold">Recent Transactions</h3>
          <p className="text-xs text-gray-500">
            Your most recent payroll activity
          </p>
        </div>
        <ReusableTable
          columns={columns}
          data={recentTransactions}
          isLoading={false}
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