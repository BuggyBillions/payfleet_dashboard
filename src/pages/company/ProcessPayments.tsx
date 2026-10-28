import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ReusableTable from "../../utility/ReusableTable";
import Modal from "../../components/modal/Modal";
import PaymentFeeBreakdownModal from "../../components/modal/PaymentFeeBreakdownModal";
import PinInput from "../../components/ui/PinInput";
import type {
  TableColumnProps,
  Employee,
  EmployeeListResponse,
} from "../../lib/interfaces";
import { formatterUtility } from "../../helpers/formatterUtility";
import {
  getEmployeeNetPay,
  getEmployeeDeductionAmount,
} from "../../helpers/feeCalculator";
import { toast } from "sonner";
import { IoSearchOutline } from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa6";
import { LuLoader, LuCircleCheck, LuCircleSlash } from "react-icons/lu";
import { useUser } from "../../hooks/useUser";
import { usePayEmployees } from "../../hooks/useEmployeePayment";
import { getEmployees } from "../../services/employeeService";

/** `paying: 0` excludes an employee from the next payout run. */
const isIncludedForPayout = (employee: Employee): boolean => {
  const raw = employee.paying;
  if (raw === undefined || raw === null || raw === "") return true;
  if (typeof raw === "number") return raw !== 0;
  return !["0", "false", "no", "excluded"].includes(String(raw).toLowerCase());
};

const ProcessPayments: React.FC = () => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modals state
  const [isFeeBreakdownOpen, setIsFeeBreakdownOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");

  const payAllMutation = usePayEmployees();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery<EmployeeListResponse>({
    queryKey: [
      "employees",
      "process-payments",
      companyId,
      debouncedSearch,
      currentPage,
      itemsPerPage,
    ],
    queryFn: () =>
      getEmployees({
        company_id: companyId,
        search: debouncedSearch,
        page: currentPage,
        per_page: itemsPerPage,
      }),
    enabled: Boolean(companyId),
    placeholderData: (prev) => prev,
  });

  const employees = useMemo(() => data?.items ?? [], [data?.items]);
  const totalItems = data?.totalItems ?? employees.length;

  // Calculate included employees for payout
  const includedEmployees = useMemo(() => {
    return employees.filter(isIncludedForPayout);
  }, [employees]);

  const payableCount = useMemo(() => {
    if (includedEmployees.length > 0) return includedEmployees.length;
    return totalItems > 0 ? totalItems : 1;
  }, [includedEmployees, totalItems]);

  // Check for deducted_amount / deduction_amount and subtract from estimate_pay
  const totalEstimatePayout = useMemo(() => {
    return includedEmployees.reduce(
      (sum, item) => sum + getEmployeeNetPay(item),
      0,
    );
  }, [includedEmployees]);

  // Step 1: Initiate payment -> Open Fee Breakdown Modal
  const handleInitiatePayment = () => {
    if (totalItems === 0) {
      toast.error("No employees found to process payment for.");
      return;
    }
    setIsFeeBreakdownOpen(true);
  };

  // Step 2: Fee breakdown confirmed -> Open PIN modal
  const handleConfirmFeeBreakdown = () => {
    setIsFeeBreakdownOpen(false);
    setPin("");
    setIsPinModalOpen(true);
  };

  const closePinModal = () => {
    if (payAllMutation.isPending) return;
    setIsPinModalOpen(false);
    setPin("");
  };

  const handlePayAll = () => {
    if (!/^\d{4}$/.test(pin)) {
      toast.error("Enter your 4-digit transaction PIN");
      return;
    }
    if (!companyId) {
      toast.error("Could not resolve your company");
      return;
    }

    payAllMutation.mutate(
      { pin, company_id: companyId },
      {
        onSuccess: () => {
          setIsPinModalOpen(false);
          setPin("");
        },
      },
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
      render: (item) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#2A5D56]/10 text-[#2A5D56] text-[10px] font-medium capitalize">
          {item.employment_type}
        </span>
      ),
    },
    {
      label: "Pay",
      render: (item) => {
        const netPay = getEmployeeNetPay(item);
        const deduction = getEmployeeDeductionAmount(item);
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-primary">
              {formatterUtility(netPay)}
            </span>
            {deduction > 0 && (
              <span className="text-[10px] text-red-500 font-medium">
                -{formatterUtility(deduction)} ded.
              </span>
            )}
          </div>
        );
      },
    },
    {
      label: "Payout",
      render: (item) => {
        const included = isIncludedForPayout(item);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
              included
                ? "bg-[#2A5D56]/10 text-[#2A5D56]"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {included ? (
              <LuCircleCheck size={11} />
            ) : (
              <LuCircleSlash size={11} />
            )}
            {included ? "Included" : "Excluded"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg text-textBlack font-semibold">Process Payments</h2>
          <p className="text-sm text-gray-500">
            Select staff and process their salary payments
          </p>
        </div>
      </div>

      <div className="bg-tertiary rounded-lg p-4">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={payAllMutation.isPending || isLoading}
              className="flex items-center gap-1.5 px-4 h-9 rounded-md text-xs font-medium bg-primary text-white cursor-pointer disabled:opacity-60 shadow-xs hover:bg-primary/95 transition"
            >
              <FaMoneyBillWave size={12} />
              Pay
            </button>
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

      {/* Step 1: Payment Fee Breakdown Modal */}
      <PaymentFeeBreakdownModal
        isOpen={isFeeBreakdownOpen}
        onClose={() => setIsFeeBreakdownOpen(false)}
        onConfirm={handleConfirmFeeBreakdown}
        employeeCount={payableCount}
        totalPayoutAmount={
          totalEstimatePayout > 0 ? totalEstimatePayout : undefined
        }
      />

      {/* Step 2: Transaction PIN Modal with 4-Pin Box */}
      {isPinModalOpen && (
        <Modal customMode onClose={closePinModal}>
          {/* <div className=""></div> */}
          <div className="flex flex-col gap-6 w-100 px-5 py-4 rounded-md mx-auto p-1 bg-white">
            <div className="flex flex-col text-center sm:text-left space-y-1">
              <h3 className="font-semibold text-base text-textBlack">
                Confirm Payment
              </h3>
              <p className="text-xs text-textBlack/60">
                This pays every employee currently included in the payout. Enter
                your 4-digit transaction PIN to authorise it.
              </p>
            </div>

            {/* 4-Box PIN Input */}
            <div className="py-2">
              <PinInput
                value={pin}
                onChange={setPin}
                length={4}
                autoFocus
                disabled={payAllMutation.isPending}
                label="Enter 4-Digit PIN"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closePinModal}
                disabled={payAllMutation.isPending}
                className="px-4 h-10 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayAll}
                disabled={payAllMutation.isPending || pin.length !== 4}
                className="px-6 h-10 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              >
                {payAllMutation.isPending && (
                  <LuLoader size={13} className="animate-spin" />
                )}
                {payAllMutation.isPending ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProcessPayments;
