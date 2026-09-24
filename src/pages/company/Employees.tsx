import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReusableTable from "../../utility/ReusableTable";
import OverviewCards from "../../components/cards/OverviewCards";
import EditEmployeeModal from "../../components/modal/EditEmployeeModal";
import type { TableColumnProps } from "../../lib/interfaces";
import { formatterUtility } from "../../helpers/formatterUtility";
import { LuUsersRound } from "react-icons/lu";
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from "react-icons/hi2";
import { TbReceiptDollar } from "react-icons/tb";
import ActionCell from "../../components/ui/ActionCell";
import { FaMoneyBillWave } from "react-icons/fa6";
import {
  getDemoEmployees,
  toggleEmployeePayroll,
  type DemoEmployee,
} from "../../services/demoEmployeeService";

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<DemoEmployee[]>(() =>
    getDemoEmployees(),
  );
  const [editing, setEditing] = useState<DemoEmployee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalItems = employees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const activeCount = employees.filter((emp) => emp.status === "Active").length;
  const payrollCount = employees.filter((emp) => emp.is_payroll).length;
  const totalPayroll = employees.reduce(
    (sum, emp) => sum + (emp.is_payroll ? emp.estimate_pay : 0),
    0,
  );

  const paginatedData = employees.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const handleSaved = (updated: DemoEmployee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updated.id ? updated : emp)),
    );
    setEditing(null);
  };

  const handleTogglePayroll = (emp: DemoEmployee) => {
    const updated = toggleEmployeePayroll(emp.id);
    if (!updated) return;

    setEmployees((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)),
    );
    toast.success(
      updated.is_payroll
        ? `${updated.first_name} ${updated.last_name} added to payroll `
        : `${updated.first_name} ${updated.last_name} removed from payroll `,
    );
  };

  const columns: TableColumnProps<DemoEmployee>[] = [
    {
      label: "Full Name",
      render: (item) => (
        <span className="font-semibold text-inherit">
          {item.first_name} {item.last_name}
        </span>
      ),
    },
    {
      label: "Email Address",
      render: (item) => <span className="lowercase">{item.email}</span>,
    },
    { label: "Job Title", key: "job_title" },
    {
      label: "Employment Type",
      render: (item) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium capitalize">
          {item.employment_type}
        </span>
      ),
    },
    {
      label: "Pay",
      render: (item) => (
        <span className="font-semibold text-primary">
          {formatterUtility(item.estimate_pay)}
        </span>
      ),  
    },
    {
      label: "Action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onEdit={() => setEditing(item)}
          otherActions={[
            {
              name: item.is_payroll ? "Remove from payroll" : "Add to payroll",
              icon: <FaMoneyBillWave size={12} />,
              action: () => handleTogglePayroll(item),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">Employees</h2>
          <p className="text-sm text-textBlack/50">
            Manage and view all employees
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/employees/add")}
          className="action-btn text-white text-xs rounded-md font-medium px-4 h-10 cursor-pointer"
        >
          + Add Employee
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuUsersRound}
          icon2={HiOutlineArrowTrendingUp}
          title="Total Employees"
          value={totalItems}
        />
        <OverviewCards
          icon={LuUsersRound}
          icon2={HiOutlineArrowTrendingUp}
          title="Active Employees"
          value={activeCount}
        />
        <OverviewCards
          icon={LuUsersRound}
          icon2={HiOutlineArrowTrendingUp}
          title="On Payroll"
          value={payrollCount}
        />
        <OverviewCards
          icon={TbReceiptDollar}
          icon2={HiOutlineArrowTrendingDown}
          title="Total Payroll"
          value={formatterUtility(totalPayroll)}
        />
      </div>

      <div className="bg-tertiary rounded-xl p-4">
        <div>
          
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
        />
      </div>

      {editing && (
        <EditEmployeeModal
          employee={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Employees;