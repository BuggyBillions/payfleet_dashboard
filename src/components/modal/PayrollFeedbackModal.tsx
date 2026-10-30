import React from "react";
import Modal from "./Modal";
import type { PayEmployeesResponse } from "../../lib/interfaces";
import { formatterUtility } from "../../helpers/formatterUtility";
import {
  LuCheckCheck,
  LuSkipForward,
  LuCircleAlert,
  LuCoins,
  LuUsers,
  LuWallet,
  LuReceipt,
  LuCircleCheck,
} from "react-icons/lu";

interface PayrollFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PayEmployeesResponse;
}

// const statusBadgeClasses: Record<string, string> = {
//   paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
//   success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
//   pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
//   skipped: "bg-amber-500/10 text-amber-600 border-amber-500/20",
//   failed: "bg-red-500/10 text-red-600 border-red-500/20",
// };

const PayrollFeedbackModal: React.FC<PayrollFeedbackModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen) return null;

  const { summary, data: employeeResults = [], message } = result;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-6 w-full text-textBlack">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <LuReceipt size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-textBlack">
                Payroll Processing Summary
              </h3>
              <p className="text-xs text-textBlack/60">
                {message || "Payroll processing completed."}
              </p>
            </div>
          </div>
          {summary?.payroll_month && (
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0">
              Month: {summary.payroll_month}
            </span>
          )}
        </div>

        {/* Primary Summary Cards (Paid, Skipped, Failed, Deductions) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Paid */}
          <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-secondary">
            <div className="flex items-center justify-between text-textBlack">
              <span className="text-[11px] font-medium">Total Paid</span>
              <LuCheckCheck size={16} />
            </div>
            <span className="text-xl font-bold text-textBlack">
              {summary?.total_paid ?? 0}
            </span>
          </div>

          {/* Total Skipped */}
          <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-secondary">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Total Skipped</span>
              <LuSkipForward size={16} />
            </div>
            <span className="text-xl font-bold">
              {summary?.total_skipped ?? 0}
            </span>
          </div>

          {/* Total Failed */}
          <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-secondary">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Total Failed</span>
              <LuCircleAlert size={16} />
            </div>
            <span className="text-xl font-bold text-textBlack">
              {summary?.total_failed ?? 0}
            </span>
          </div>

          {/* Total Deductions */}
          <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-secondary">
            <div className="flex items-center justify-between text-textBlack">
              <span className="text-[11px] font-medium">Deductions</span>
              <LuCoins size={16} />
            </div>
            <span className="text-xl font-bold text-textBlack truncate">
              {formatterUtility(Number(summary?.total_deductions ?? 0))}
            </span>
          </div>
        </div>

        {/* Secondary Summary Breakdown */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-secondary border border-primary/10 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-textBlack/50 flex items-center gap-1">
                <LuUsers size={12} /> Total Employees
              </span>
              <span className="font-semibold text-textBlack">
                {summary.total_employees ?? employeeResults.length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-textBlack/50 flex items-center gap-1">
                <LuWallet size={12} /> Amount Paid
              </span>
              <span className="font-semibold text-textBlack">
                {formatterUtility(Number(summary.total_amount_paid ?? 0))}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-textBlack/50">
                Processing Fees
              </span>
              <span className="font-semibold text-textBlack">
                {formatterUtility(Number(summary.total_processing_fees ?? 0))}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-textBlack/50">
                Remaining Balance
              </span>
              <span className="font-semibold text-textBlack">
                {formatterUtility(Number(summary.remaining_balance ?? 0))}
              </span>
            </div>
          </div>
        )}

        {/* Employee Results Table/List: {employee_name | "Employee {employee_id}"}: {reason} */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-textBlack">
              Employee Payout Details ({employeeResults.length})
            </span>
          </div>

          {employeeResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-textBlack/50 bg-secondary rounded-lg border border-primary/10">
              No individual employee logs returned.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto styled-scrollbar rounded-xl border border-primary/10 divide-y divide-primary/5 bg-secondary/30">
              {employeeResults.map((item, idx) => {
                const displayName =
                  item.employee_name || `Employee #${item.employee_id}`;
                // const badgeClass =
                //   statusBadgeClasses[item.status?.toLowerCase()] ||
                //   "bg-gray-100 text-gray-700 border-gray-200";

                return (
                  <div
                    key={item.payment_id || item.employee_id || idx}
                    className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-secondary/60 transition"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-textBlack truncate">
                          {displayName}
                        </span>
                        {/* <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-semibold capitalize border ${badgeClass}`}
                        >
                          {item.status}
                        </span> */}
                      </div>
                      <p className="text-[11px] text-textBlack/70 wrap-break-word">
                        {item.reason}
                      </p>
                      {item.reference && (
                        <span className="text-[10px] font-mono text-textBlack/40">
                          Ref: {item.reference}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-2 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <LuCircleCheck size={14} />
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PayrollFeedbackModal;
