import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LuUsersRound } from "react-icons/lu";
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from "react-icons/hi2";
import { TbReceiptDollar } from "react-icons/tb";
import { IoSearchOutline } from "react-icons/io5";
import ReusableTable from "../../utility/ReusableTable";
import OverviewCards from "../../components/cards/OverviewCards";
import EditEmployeeModal from "../../components/modal/EditEmployeeModal";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionCell from "../../components/ui/ActionCell";
import type { TableColumnProps, Employee, EmployeeListResponse } from "../../lib/interfaces";
import { formatterUtility } from "../../helpers/formatterUtility";
import { getErrorMessage } from "../../helpers/api";
import { useUser } from "../../hooks/useUser";
import { getEmployees, deleteEmployee, EMPLOYMENT_TYPES } from "../../services/employeeService";

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const companyId = user?.company_details?.id;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<EmployeeListResponse>({
    queryKey: [
      "employees",
      companyId,
      debouncedSearch,
      employmentFilter,
      currentPage,
      itemsPerPage,
    ],
    queryFn: () =>
      getEmployees({
        company_id: companyId,
        search: debouncedSearch,
        employment_type:
          employmentFilter === "all" ? undefined : employmentFilter,
        page: currentPage,
        per_page: itemsPerPage,
      }),
    enabled: Boolean(companyId),
    placeholderData: (prev) => prev,
  });

  const { data: statsData } = useQuery<EmployeeListResponse>({
    queryKey: [
      "employees",
      "stats",
      companyId,
      debouncedSearch,
      employmentFilter,
    ],
    queryFn: () =>
      getEmployees({
        company_id: companyId,
        search: debouncedSearch,
        employment_type:
          employmentFilter === "all" ? undefined : employmentFilter,
        per_page: 500,
      }),
    enabled: Boolean(companyId),
  });

  const employees = data?.items ?? [];
  const totalItems = data?.totalItems ?? employees.length;

  const statsEmployees = statsData?.items ?? [];
  const onPayrollCount = statsEmployees.filter(
    (emp) => String(emp.paying) === "1",
  ).length;
  const totalPayroll = statsEmployees.reduce(
    (sum, emp) => sum + (Number(emp.estimate_pay) || 0),
    0,
  );
  const averagePay = totalItems ? totalPayroll / totalItems : 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["employees"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteEmployee(id),
    onSuccess: () => {
      toast.success("Employee deleted ");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Failed to delete employee"));
    },
  });

  const handleSaved = () => {
    setEditing(null);
    invalidate();
  };

  const columns: TableColumnProps<Employee>[] = [
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
          {formatterUtility(Number(item.estimate_pay))}
        </span>
      ),
    },
    {
      label: "Action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onEdit={() => setEditing(item)}
          onDelete={() => setDeleteTarget(item)}
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
          title="On Payroll"
          value={onPayrollCount}
        />
        <OverviewCards
          icon={TbReceiptDollar}
          icon2={HiOutlineArrowTrendingDown}
          title="Total Payroll"
          value={formatterUtility(totalPayroll)}
        />
        <OverviewCards
          icon={TbReceiptDollar}
          icon2={HiOutlineArrowTrendingDown}
          title="Average Pay"
          value={formatterUtility(averagePay)}
        />
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 border border-black/10 rounded-md px-3 h-10 w-full sm:w-64 bg-secondary">
            <IoSearchOutline className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full outline-0 text-sm placeholder:text-gray-400 bg-transparent"
            />
          </div>
          <div className="w-full sm:w-56">
            <select
              value={employmentFilter}
              onChange={(e) => {
                setEmploymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-black/10 bg-secondary rounded-md px-3 h-10 text-sm outline-0"
            >
              <option value="all">All Employment Types</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ReusableTable
          columns={columns}
          data={employees}
          isLoading={isLoading}
          error={isError ? error : null}
          currentPage={currentPage}
          totalPages={data?.totalPages ?? 1}
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete employee?"
        message={`Are you sure you want to delete ${
          deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ""
        }? This action cannot be undone.`}
        confirmText="Yes, Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Employees;