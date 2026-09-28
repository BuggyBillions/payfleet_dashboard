import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LuUsersRound } from "react-icons/lu";
import { TbReceiptDollar } from "react-icons/tb";
import { IoSearchOutline } from "react-icons/io5";
import { FiMinusCircle } from "react-icons/fi";
import { LuCircleCheck, LuCircleSlash } from "react-icons/lu";
import ReusableTable from "../../utility/ReusableTable";
import OverviewCards from "../../components/cards/OverviewCards";
import ReduceSalaryModal from "../../components/modal/ReduceSalaryModal";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionCell from "../../components/ui/ActionCell";
import type { TableColumnProps, Employee, EmployeeDeduction, EmployeeListResponse } from "../../lib/interfaces";
import { formatShortDate, formatterUtility } from "../../helpers/formatterUtility";
import { getErrorMessage } from "../../helpers/api";
import { useUser } from "../../hooks/useUser";
import { useEmployeeDeductions } from "../../hooks/useEmployeeDeduction";
import {
  useMarkMultiplePaying,
  usePaySingleEmployee,
} from "../../hooks/useEmployeePayment";
import { getEmployees, deleteEmployee, EMPLOYMENT_TYPES } from "../../services/employeeService";

type EmployeeTab = "employees" | "deductions";

/** `paying: 0` takes an employee off payroll, so PAY skips them. */
const isOnPayroll = (employee: Employee): boolean => {
  const raw = employee.paying;
  if (raw === undefined || raw === null || raw === "") return true;
  if (typeof raw === "number") return raw !== 0;
  return !["0", "false", "no", "excluded"].includes(String(raw).toLowerCase());
};


const Employees: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const companyId = user?.company_details?.id;

  const [activeTab, setActiveTab] = useState<EmployeeTab>("employees");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deductionSearch, setDeductionSearch] = useState("");
  const [debouncedDeductionSearch, setDebouncedDeductionSearch] = useState("");
  const [deductionPage, setDeductionPage] = useState(1);
  const [deductionItemsPerPage, setDeductionItemsPerPage] = useState(5);
  const [deductTarget, setDeductTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<number | string>>([]);

  const paySingleMutation = usePaySingleEmployee();
  const multiplePayingMutation = useMarkMultiplePaying();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDeductionSearch(deductionSearch), 500);
    return () => clearTimeout(timer);
  }, [deductionSearch]);

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

  const { data: employeeDeductions } = useEmployeeDeductions(
    { company_id: companyId, per_page: 500 },
    Boolean(companyId) && activeTab === "employees",
  );

  const {
    data: deductionsData,
    isLoading: isLoadingDeductions,
    isError: isDeductionsError,
    error: deductionsError,
  } = useEmployeeDeductions(
    {
      company_id: companyId,
      search: debouncedDeductionSearch,
      page: deductionPage,
      per_page: deductionItemsPerPage,
    },
    Boolean(companyId) && activeTab === "deductions",
  );

  const deductionByEmployee = new Map(
    (employeeDeductions?.items ?? []).map((row) => [
      String(row.employee_id),
      row,
    ]),
  );

  const deductions = deductionsData?.items ?? [];
  const totalDeductionItems = deductionsData?.totalItems ?? deductions.length;

  const employees = data?.items ?? [];
  const totalItems = data?.totalItems ?? employees.length;

  const statsEmployees = statsData?.items ?? [];
  const payrollEmployees = statsEmployees.filter(isOnPayroll);
  const onPayrollCount = payrollEmployees.length;
  const totalPayroll = payrollEmployees.reduce(
    (sum, emp) => sum + (Number(emp.estimate_pay) || 0),
    0,
  );
  const averagePay = onPayrollCount ? totalPayroll / onPayrollCount : 0;

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

  const handleDeductSaved = () => {
    setDeductTarget(null);
  };

  const handleToggleRow = (id: number | string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedRowIds(checked ? employees.map((emp) => emp.id) : []);
  };

  const selectedEmployees = employees.filter((emp) =>
    selectedRowIds.includes(emp.id),
  );
  const selectedOffPayroll = selectedEmployees.filter(
    (emp) => !isOnPayroll(emp),
  );
  const selectedOnPayroll = selectedEmployees.filter(isOnPayroll);
  const isPayingMutation = paySingleMutation.isPending || multiplePayingMutation.isPending;

  const handleMarkSelected = (paying: 0 | 1) => {
    if (selectedRowIds.length === 0) return;
    multiplePayingMutation.mutate(
      { ids: selectedRowIds, paying },
      { onSuccess: () => setSelectedRowIds([]) },
    );
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
      render: (item) => <span className="capitalize">{item.employment_type}</span>,
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
      label: "Deduction",
      render: (item) => {
        const row = deductionByEmployee.get(String(item.id));
        const amount = Number(row?.amount ?? item.deduction_amount ?? 0);

        if (!amount) {
          return <span className="text-textBlack/40">—</span>;
        }

        return (
          <span className="font-semibold text-red-600">
            -{formatterUtility(amount)}
          </span>
        );
      },
    },
    {
      label: "Payroll",
      render: (item) => {
        const onPayroll = isOnPayroll(item);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
              onPayroll
                ? "bg-[#2A5D56]/10 text-[#2A5D56]"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {onPayroll ? <LuCircleCheck size={11} /> : <LuCircleSlash size={11} />}
            {onPayroll ? "On payroll" : "Off payroll"}
          </span>
        );
      },
    },
    {
      label: "Action",
      render: (item) => {
        const onPayroll = isOnPayroll(item);
        return (
          <ActionCell
            rowId={item.id}
            onEdit={(rowId) => navigate(`/dashboard/employees/edit/${rowId}`)}
            onDelete={() => setDeleteTarget(item)}
            otherActions={[
              {
                name: "Add to payroll",
                icon: <LuCircleCheck size={12} />,
                disabled: onPayroll || paySingleMutation.isPending,
                action: () => paySingleMutation.mutate(item.id),
              },
              {
                name: "Remove from payroll",
                icon: <LuCircleSlash size={12} />,
                disabled: !onPayroll || paySingleMutation.isPending,
                action: () => paySingleMutation.mutate(item.id),
              },
              {
                name: "Deduct Salary",
                icon: <FiMinusCircle size={12} />,
                action: () => setDeductTarget(item),
              },
            ]}
          />
        );
      },
    },
  ];

  const deductionColumns: TableColumnProps<EmployeeDeduction>[] = [
    {
      label: "Employee",
      render: (item) => {
        const name = [item.employee?.first_name, item.employee?.last_name]
          .filter(Boolean)
          .join(" ");
        return (
          <span className="flex flex-col gap-0.5">
            <span className="font-semibold text-inherit">
              {name || (item.employee_id ? `Employee #${item.employee_id}` : "—")}
            </span>
            {item.employee?.email && (
              <span className="text-[10px] text-textBlack/50 lowercase font-normal">
                {item.employee.email}
              </span>
            )}
          </span>
        );
      },
    },
    {
      label: "Amount Deducted",
      render: (item) => (
        <span className="font-semibold text-red-600">
          -{formatterUtility(item.amount)}
        </span>
      ),
    },
    {
      label: "Reason",
      render: (item) => (
        <span className="whitespace-normal max-w-64">
          {item.reason || "—"}
        </span>
      ),
    },
    {
      label: "Months",
      render: (item) => (
        <span>
          {item.no_of_month} {item.no_of_month === 1 ? "month" : "months"}
        </span>
      ),
    },
    {
      label: "Date",
      render: (item) => <span>{formatShortDate(String(item.created_at))}</span>,
    },
  ];

  const handleTabChange = (tab: EmployeeTab) => {
    setActiveTab(tab);
    if (tab === "deductions") setDeductionPage(1);
  };

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

      <div className="flex items-center gap-1 border-b border-black/10">
        {(
          [
            { key: "employees", label: "Employees" },
            { key: "deductions", label: "Deductions" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 pb-2.5 pt-1 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-textBlack/50 hover:text-textBlack"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuUsersRound}
          title="Total Employees"
          value={totalItems}
        />
        <OverviewCards
          icon={LuUsersRound}
          title="On Payroll"
          value={onPayrollCount}
        />
        <OverviewCards
          icon={TbReceiptDollar}
          title="Total Payroll"
          value={formatterUtility(totalPayroll)}
        />
        <OverviewCards
          icon={TbReceiptDollar}
          title="Average Pay"
          value={formatterUtility(averagePay)}
        />
      </div>

      {activeTab === "employees" ? (
        <div className="bg-tertiary rounded-xl p-4">
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
                className="w-full border border-black/10 text-textBlack bg-secondary rounded-md px-3 h-10 text-sm outline-0"
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

          {selectedRowIds.length > 0 && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <span className="text-xs text-textBlack/60 mr-auto">
                {selectedRowIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => handleMarkSelected(0)}
                disabled={isPayingMutation || selectedOnPayroll.length === 0}
                title={
                  selectedOnPayroll.length === 0
                    ? "Selected employees are already off payroll"
                    : undefined
                }
                className="flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-medium border border-black/10 bg-secondary text-textBlack/70 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <LuCircleSlash size={12} />
                Remove from payroll
              </button>
              <button
                type="button"
                onClick={() => handleMarkSelected(1)}
                disabled={isPayingMutation || selectedOffPayroll.length === 0}
                title={
                  selectedOffPayroll.length === 0
                    ? "Selected employees are already on payroll"
                    : undefined
                }
                className="flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-medium border border-black/10 bg-secondary text-textBlack/70 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <LuCircleCheck size={12} />
                Add to payroll
              </button>
            </div>
          )}

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
            selectable
            selectedRowIds={selectedRowIds}
            onToggleRowSelection={handleToggleRow}
            onToggleAllRows={handleToggleAll}
          />
        </div>
      ) : (
        <div className="bg-tertiary rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 border border-black/10 rounded-md px-3 h-10 w-full sm:w-64 bg-secondary">
              <IoSearchOutline className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search deductions..."
                value={deductionSearch}
                onChange={(e) => {
                  setDeductionSearch(e.target.value);
                  setDeductionPage(1);
                }}
                className="w-full outline-0 text-sm placeholder:text-gray-400 bg-transparent"
              />
            </div>
          </div>

          <ReusableTable
            columns={deductionColumns}
            data={deductions}
            isLoading={isLoadingDeductions}
            error={isDeductionsError ? deductionsError : null}
            currentPage={deductionPage}
            totalPages={deductionsData?.totalPages ?? 1}
            totalItems={totalDeductionItems}
            itemsPerPage={deductionItemsPerPage}
            setCurrentPage={setDeductionPage}
            setItemsPerPage={setDeductionItemsPerPage}
          />
        </div>
      )}

      {deductTarget && (
        <ReduceSalaryModal
          employee={deductTarget}
          onClose={() => setDeductTarget(null)}
          onSaved={handleDeductSaved}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete employee?"
        message={`Are you sure you want to delete ${deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ""
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