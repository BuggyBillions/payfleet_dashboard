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
import {
  getDemoPayments,
  type DemoPayment,
} from "../../services/demoPaymentService";
import StatusBadge from "../../components/ui/StatusBadge";
import PageHeader from "../../components/navs/PageHeader";

const Overview: React.FC = () => {
  const { user } = useUser();
  const payments = getDemoPayments();

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
        heading={`Welcome, ${user?.first_name}`}
        value="Here is your business breakdown"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 mb-4">
        <OverviewCards
          icon={LuUsersRound}
          title="Total Employees"
          value={0}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={TbReceiptDollar}
          title="Total Salary Paid"
          value={formatterUtility(0)}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={HiOutlineArrowTrendingUp}
          title="Completed Payments"
          value={0}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={LuUsersRound}
          title="Estimated Salary"
          value={formatterUtility(0)}
          icon2={HiOutlineArrowTrendingUp}
        />
      </div>

      <div className="bg-tertiary rounded-xl p-4">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold text-textBlack">Recent Transactions</h3>
          <p className="text-xs text-gray-500 dark:text-textBlack/75">
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