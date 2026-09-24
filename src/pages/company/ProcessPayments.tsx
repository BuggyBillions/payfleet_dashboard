import React, { useMemo, useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps } from "../../lib/interfaces";
import { formatterUtility } from "../../helpers/formatterUtility";
import { toast } from "sonner";
import { IoSearchOutline } from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa6";
import { FiMinusCircle } from "react-icons/fi";
import ActionCell from "../../components/ui/ActionCell";
import ReduceSalaryModal from "../../components/modal/ReduceSalaryModal";
import {
  getDemoEmployees,
  type DemoEmployee,
} from "../../services/demoEmployeeService";

const ProcessPayments: React.FC = () => {
  const [employees, setEmployees] = useState<DemoEmployee[]>(() =>
    getDemoEmployees(),
  );
  const [reduceModalEmployee, setReduceModalEmployee] =
    useState<DemoEmployee | null>(null);
  const [search, setSearch] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<
    Array<number | string>
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filtered = useMemo(() => {
    let list = employees;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (emp) =>
          `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.job_title.toLowerCase().includes(q),
      );
    }

    return list;
  }, [employees, search]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const handleToggleRow = (id: number | string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedRowIds(checked ? paginatedData.map((emp) => emp.id) : []);
  };

  const handlePay = (emp: DemoEmployee) => {
    toast.success(
      `Payment of ${formatterUtility(emp.estimate_pay)} for ${emp.first_name} ${emp.last_name} initiated `,
    );
  };

  const handlePaySelected = () => {
    toast.success(`Payment processed for ${selectedRowIds.length} staff `);
    setSelectedRowIds([]);
  };

  const handleDeductSaved = (updated: DemoEmployee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)),
    );
    setReduceModalEmployee(null);
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
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#2A5D56]/10 text-[#2A5D56] text-[10px] font-medium capitalize">
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
          otherActions={[
            {
              name: "Reduce Salary",
              icon: <FiMinusCircle size={12} />,
              action: () => setReduceModalEmployee(item),
            },
            {
              name: "Pay",
              icon: <FaMoneyBillWave size={12} />,
              action: () => handlePay(item),
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
          <h2 className="text-lg font-semibold">Process Payments</h2>
          <p className="text-sm text-gray-500">
            Select staff and process their salary payments
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 border border-black/10 rounded-md px-3 h-10 w-full sm:w-72 bg-secondary">
            <IoSearchOutline className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full outline-0 text-sm placeholder:text-gray-400 bg-transparent"
            />
          </div>

          {selectedRowIds.length > 0 && (
            <button
              type="button"
              onClick={handlePaySelected}
              className="flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-medium bg-primary text-white cursor-pointer"
            >
              <FaMoneyBillWave size={12} />
              Pay Selected
            </button>
          )}
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
          selectable
          selectedRowIds={selectedRowIds}
          onToggleRowSelection={handleToggleRow}
          onToggleAllRows={handleToggleAll}
        />
      </div>

      {reduceModalEmployee && (
        <ReduceSalaryModal
          employee={reduceModalEmployee}
          onClose={() => setReduceModalEmployee(null)}
          onSaved={handleDeductSaved}
        />
      )}
    </div>
  );
};

export default ProcessPayments;