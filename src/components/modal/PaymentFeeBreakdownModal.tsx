import React, { useState } from "react";
import Modal from "./Modal";
import { usePaymentSettings } from "../../hooks/usePaymentSettings";
import { usePayrollPreview } from "../../hooks/useEmployeePayment";
import { calculateFeeBreakdown } from "../../helpers/feeCalculator";
import { formatterUtility } from "../../helpers/formatterUtility";
import {
  LuLoader,
  LuCircleAlert,
  LuUsers,
  LuShieldCheck,
  LuCircleCheck,
  LuRefreshCw,
  LuChevronDown,
  LuChevronUp,
  LuWallet,
} from "react-icons/lu";

interface PaymentFeeBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  companyId?: number | string;
  employeeCount?: number;
  fgEligibleCount?: number;
  totalPayoutAmount?: number;
}

// const formatMonthLabel = (monthStr?: string): string => {
//   if (!monthStr) return "";
//   const d = new Date(`${monthStr}-01T00:00:00`);
//   if (!isNaN(d.getTime())) {
//     return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
//   }
//   return monthStr;
// };

const PaymentFeeBreakdownModal: React.FC<PaymentFeeBreakdownModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  companyId,
  employeeCount = 1,
  fgEligibleCount,
  totalPayoutAmount,
}) => {
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  // 1. Fetch from GET /payroll/preview?company_id={id} when companyId is present
  const {
    data: previewResponse,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    error: previewError,
    refetch: refetchPreview,
    isFetching: isPreviewFetching,
  } = usePayrollPreview(companyId, {
    enabled: isOpen && Boolean(companyId),
  });

  // 2. Fallback to settings query if companyId is not provided
  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError,
    refetch: refetchSettings,
    isFetching: isSettingsFetching,
  } = usePaymentSettings({
    enabled: isOpen && !companyId,
  });

  if (!isOpen) return null;

  // Choose preview data if available
  const hasPreview = Boolean(previewResponse?.summary);
  const summary = previewResponse?.summary;
  const employees = previewResponse?.employees ?? [];
  const skipped = previewResponse?.skipped ?? [];

  const isLoading = companyId ? isPreviewLoading : isSettingsLoading;
  const isFetching = companyId ? isPreviewFetching : isSettingsFetching;
  const isError = companyId ? isPreviewError : isSettingsError;
  const error = companyId ? previewError : settingsError;
  const refetch = companyId ? refetchPreview : refetchSettings;

  // Fallback calculation for when companyId is absent
  const count = Math.max(1, employeeCount || 1);
  const fallbackBreakdown = calculateFeeBreakdown(
    settings,
    count,
    totalPayoutAmount,
    fgEligibleCount,
  );
  const hasBaseAmount =
    typeof totalPayoutAmount === "number" && totalPayoutAmount > 0;
  const fallbackGrandTotal = hasBaseAmount
    ? totalPayoutAmount + fallbackBreakdown.totalFees
    : fallbackBreakdown.totalFees;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4 w-full max-h-[85vh] overflow-y-auto styled-scrollbar pr-1">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-primary/10 pb-3">
          <div className="flex items-center gap-3">
          
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-textBlack">
                Payment Fee Breakdown
              </h3>
              <p className="text-xs text-textBlack/60">
                Review breakdown and charges before authorizing payout
              </p>
            </div>
          </div>

          {/* {summary?.payroll_month && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-bold tracking-wide">
              {formatMonthLabel(summary.payroll_month)}
            </span>
          )} */}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3 bg-secondary rounded-xl border border-primary/10 text-center">
            <LuLoader size={24} className="text-primary animate-spin" />
            <p className="text-xs text-textBlack/70 font-medium">
              Generating payroll breakdown preview...
            </p>
          </div>
        ) : isError || (companyId && !previewResponse) ? (
          /* Error State */
          <div className="p-5 flex flex-col gap-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-2.5">
              <LuCircleAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="flex flex-col text-xs space-y-1">
                <span className="font-semibold text-red-600">
                  Unable to load payroll preview
                </span>
                <p className="text-textBlack/70">
                  {(error as Error)?.message ||
                    "Could not retrieve payroll breakdown from the server. Payout cannot be authorized without fee verification."}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 h-8 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-textWhite rounded-lg border border-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="px-3 h-8 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <LuRefreshCw
                  size={12}
                  className={isFetching ? "animate-spin" : ""}
                />
                Retry
              </button>
            </div>
          </div>
        ) : hasPreview && summary ? (
          /* Loaded with /payroll/preview API Response */
          <div className="flex flex-col gap-3.5">
            {/* Balance Coverage Notice Banner */}
            {!summary.can_cover ? (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs flex items-start gap-2.5">
                <LuCircleAlert
                  size={18}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-amber-800">
                    Insufficient Company Balance
                  </span>
                  <p className="text-amber-900/80 leading-relaxed text-[11px]">
                    Current balance is{" "}
                    <strong>{formatterUtility(summary.company_balance)}</strong>,
                    but total required is{" "}
                    <strong>{formatterUtility(summary.total_to_pay)}</strong>.
                    Shortfall:{" "}
                    <strong className="text-red-600 font-bold">
                      {formatterUtility(summary.shortfall)}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800">
                  <LuCircleCheck size={16} className="text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    Balance sufficient for payout
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-900">
                  {formatterUtility(summary.company_balance)} Balance
                </span>
              </div>
            )}

            {/* Scope / Employees Info Bar */}
            <div className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-primary/10 text-xs">
              <div className="flex items-center gap-2">
                <LuUsers className="text-primary" size={16} />
                <span className="text-textBlack/70">Staff to Pay:</span>
                <span className="font-bold text-textBlack">
                  {summary.employees_to_pay}{" "}
                  {summary.employees_to_pay === 1 ? "Employee" : "Employees"}
                </span>
              </div>

              {summary.employees_skipped > 0 && (
                <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold px-2 py-0.5 rounded-full">
                  {summary.employees_skipped} Skipped
                </span>
              )}
            </div>

            {/* Statutory & Platform Fees Card */}
            <div className="bg-secondary/60 rounded-xl p-3.5 border border-primary/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-primary/10">
                <span className="font-bold text-textBlack text-xs">
                  Charges & Statutory Deductions
                </span>
                <span className="text-[10px] text-textBlack/50">
                  Per-Employee Breakdown
                </span>
              </div>

              {/* VAT */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-textBlack">
                    Value Added Tax (VAT)
                  </span>
                  <span className="text-[10px] text-textBlack/50">
                    Statutory tax charge
                  </span>
                </div>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(summary.total_vat)}
                </span>
              </div>

              {/* Federal Government Fee */}
              {summary.total_federal_government > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                  <div className="flex flex-col">
                    <span className="font-medium text-textBlack">
                      Federal Government EMTL Fee
                    </span>
                    <span className="text-[10px] text-textBlack/50">
                      Applies to transfers &gt; ₦10,000
                    </span>
                  </div>
                  <span className="font-semibold text-textBlack">
                    {formatterUtility(summary.total_federal_government)}
                  </span>
                </div>
              )}

              {/* Payfleet Processing Fee */}
              <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                <div className="flex flex-col">
                  <span className="font-medium text-textBlack">
                    Payfleet Processing Fee
                  </span>
                  <span className="text-[10px] text-textBlack/50">
                    Gateway & transfer processing
                  </span>
                </div>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(summary.total_payfleet_fee)}
                </span>
              </div>

              {/* Subtotal of Charges */}
              <div className="pt-2 border-t border-dashed border-primary/20 flex items-center justify-between text-xs font-semibold text-textBlack/80">
                <span>Total Transaction Charges</span>
                <span className="text-primary font-bold">
                  {formatterUtility(summary.total_charges)}
                </span>
              </div>
            </div>

            {/* Grand Total Summary Box */}
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-textBlack/70">
                <span>Total Net Salaries</span>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(summary.total_net_salary)}
                </span>
              </div>

              {summary.total_deductions > 0 && (
                <div className="flex items-center justify-between text-red-600">
                  <span>Total Deductions</span>
                  <span className="font-semibold">
                    -{formatterUtility(summary.total_deductions)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-textBlack/70">
                <span>Total Charges (VAT + Fees)</span>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(summary.total_charges)}
                </span>
              </div>

              <div className="pt-2 border-t border-primary/10 flex items-center justify-between text-sm font-bold text-textBlack">
                <span>Total Amount to Debit</span>
                <span className="text-primary text-base font-extrabold">
                  {formatterUtility(summary.total_to_pay)}
                </span>
              </div>

              <div className="pt-1.5 border-t border-dashed border-primary/10 flex items-center justify-between text-[11px] text-textBlack/60">
                <span className="flex items-center gap-1">
                  <LuWallet size={12} /> Balance after payout:
                </span>
                <span
                  className={`font-semibold ${
                    summary.balance_after_payroll < 0
                      ? "text-red-600"
                      : "text-textBlack"
                  }`}
                >
                  {formatterUtility(summary.balance_after_payroll)}
                </span>
              </div>
            </div>

            {/* Toggleable Individual Employee Breakdown */}
            {employees.length > 0 && (
              <div className="border border-primary/10 rounded-xl overflow-hidden bg-secondary/30">
                <button
                  type="button"
                  onClick={() => setShowEmployeeList((prev) => !prev)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-textBlack hover:bg-secondary transition cursor-pointer"
                >
                  <span>
                    Staff Payout Breakdown ({employees.length})
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-primary">
                    <span>{showEmployeeList ? "Hide" : "View"}</span>
                    {showEmployeeList ? (
                      <LuChevronUp size={14} />
                    ) : (
                      <LuChevronDown size={14} />
                    )}
                  </div>
                </button>

                {showEmployeeList && (
                  <div className="p-3 border-t border-primary/10 max-h-48 overflow-y-auto styled-scrollbar space-y-2">
                    {employees.map((emp) => (
                      <div
                        key={emp.employee_id}
                        className="bg-white p-2.5 rounded-lg border border-primary/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-textBlack truncate">
                            {emp.employee_name}
                          </span>
                          <span className="text-[10px] text-textBlack/50">
                            Net: {formatterUtility(emp.net_salary)} + Charges:{" "}
                            {formatterUtility(emp.total_charges)}
                          </span>
                        </div>
                        <span className="font-bold text-primary shrink-0 ml-2">
                          {formatterUtility(emp.total_to_pay)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skipped Notice if any */}
            {skipped.length > 0 && (
              <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-1">
                <span className="font-semibold text-amber-700">
                  Skipped Staff ({skipped.length}):
                </span>
                <p className="text-[11px] text-textBlack/60">
                  {skipped
                    .map((s) => s.employee_name || `ID #${s.employee_id}`)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Notice Footer */}
            <p className="text-[11px] text-textBlack/50 flex items-center gap-1.5 pt-1">
              <LuShieldCheck className="text-primary shrink-0" size={14} />
              Payroll preview calculated directly from live fee and payout rules.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-10 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-5 h-10 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <LuCircleCheck size={14} />
                Confirm & Enter PIN
              </button>
            </div>
          </div>
        ) : (
          /* Fallback when companyId is absent (e.g. static calculation) */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-primary/10 text-xs">
              <div className="flex items-center gap-2">
                <LuUsers className="text-primary" size={16} />
                <span className="text-textBlack/70">Employees to Pay:</span>
                <span className="font-bold text-textBlack">
                  {count} {count === 1 ? "Employee" : "Employees"}
                </span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                Per-Employee Fees
              </span>
            </div>

            <div className="bg-secondary/60 rounded-xl p-3.5 border border-primary/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-textBlack">
                    Value Added Tax (VAT)
                  </span>
                  <span className="text-[10px] text-textBlack/50">
                    {formatterUtility(fallbackBreakdown.vatPerEmployee)} × {count}
                  </span>
                </div>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(fallbackBreakdown.totalVat)}
                </span>
              </div>

              {fallbackBreakdown.totalFedGovtFee > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                  <div className="flex flex-col">
                    <span className="font-medium text-textBlack">
                      Federal Government Fee
                    </span>
                    <span className="text-[10px] text-textBlack/50">
                      {formatterUtility(
                        fallbackBreakdown.fedGovtFeePerEmployee,
                      )}{" "}
                      × {fallbackBreakdown.fgEligibleCount} staff (&gt; ₦10,000)
                    </span>
                  </div>
                  <span className="font-semibold text-textBlack">
                    {formatterUtility(fallbackBreakdown.totalFedGovtFee)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                <div className="flex flex-col">
                  <span className="font-medium text-textBlack">
                    Payfleet Processing Fee
                  </span>
                  <span className="text-[10px] text-textBlack/50">
                    {formatterUtility(
                      fallbackBreakdown.payfleetFeePerEmployee,
                    )}{" "}
                    × {count}
                  </span>
                </div>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(fallbackBreakdown.totalPayfleetFee)}
                </span>
              </div>

              <div className="pt-2 border-t border-dashed border-primary/20 flex items-center justify-between text-xs font-semibold text-textBlack/80">
                <span>Total Fee Per Employee</span>
                <span className="text-primary font-bold">
                  {formatterUtility(fallbackBreakdown.totalFeePerEmployee)}
                </span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3.5 space-y-1.5 text-xs">
              {hasBaseAmount && (
                <div className="flex items-center justify-between text-textBlack/70">
                  <span>Salary / Payout Amount</span>
                  <span className="font-semibold text-textBlack">
                    {formatterUtility(totalPayoutAmount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-textBlack/70">
                <span>
                  Total Applicable Fees ({count}{" "}
                  {count === 1 ? "staff" : "staff"})
                </span>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(fallbackBreakdown.totalFees)}
                </span>
              </div>
              <div className="pt-2 border-t border-primary/10 flex items-center justify-between text-sm font-bold text-textBlack">
                <span>Total Amount to Debit</span>
                <span className="text-primary text-base">
                  {formatterUtility(fallbackGrandTotal)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-textBlack/50 flex items-center gap-1.5">
              <LuShieldCheck className="text-primary shrink-0" size={14} />
              All transaction fees are billed strictly per recipient employee.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-10 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-5 h-10 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <LuCircleCheck size={14} />
                Confirm & Enter PIN
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentFeeBreakdownModal;
