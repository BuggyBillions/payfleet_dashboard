import React from "react";
import Modal from "./Modal";
import { usePaymentSettings } from "../../hooks/usePaymentSettings";
import { calculateFeeBreakdown } from "../../helpers/feeCalculator";
import { formatterUtility } from "../../helpers/formatterUtility";
import {
  LuReceipt,
  LuLoader,
  LuCircleAlert,
  LuUsers,
  LuShieldCheck,
  LuCircleCheck,
  LuRefreshCw,
} from "react-icons/lu";

interface PaymentFeeBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeCount: number;
  fgEligibleCount?: number;
  totalPayoutAmount?: number;
}

const PaymentFeeBreakdownModal: React.FC<PaymentFeeBreakdownModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employeeCount,
  fgEligibleCount,
  totalPayoutAmount,
}) => {
  const { data: settings, isLoading, isError, error, refetch, isFetching } =
    usePaymentSettings({ enabled: isOpen });

  if (!isOpen) return null;

  const count = Math.max(1, employeeCount || 1);
  const breakdown = calculateFeeBreakdown(
    settings,
    count,
    totalPayoutAmount,
    fgEligibleCount,
  );
  const hasBaseAmount = typeof totalPayoutAmount === "number" && totalPayoutAmount > 0;
  const grandTotal = hasBaseAmount ? totalPayoutAmount + breakdown.totalFees : breakdown.totalFees;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-5 w-full">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <LuReceipt size={22} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-textBlack">
              Payment Fee Breakdown
            </h3>
            <p className="text-xs text-textBlack/60">
              Review transaction and statutory fees before authorizing payout
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3 bg-secondary rounded-xl border border-primary/10 text-center">
            <LuLoader size={24} className="text-primary animate-spin" />
            <p className="text-xs text-textBlack/70">
              Retrieving current payment fee settings...
            </p>
          </div>
        ) : isError || !settings ? (
          /* Error State - Do not proceed if request fails */
          <div className="p-5 flex flex-col gap-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-2.5">
              <LuCircleAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="flex flex-col text-xs space-y-1">
                <span className="font-semibold text-red-600">
                  Unable to load payment fee settings
                </span>
                <p className="text-textBlack/70">
                  {(error as Error)?.message ||
                    "Could not retrieve payment fee configuration from the server. Payout cannot be authorized without fee verification."}
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
                <LuRefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
                Retry
              </button>
            </div>
          </div>
        ) : (
          /* Loaded Fee Breakdown */
          <div className="flex flex-col gap-4">
            {/* Employee Count & Notice */}
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

            {/* Individual Fee Breakdown Card */}
            <div className="bg-secondary/60 rounded-xl p-3.5 border border-primary/10 space-y-2.5 text-xs">
              {/* VAT */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-textBlack">Value Added Tax (VAT)</span>
                  <span className="text-[10px] text-textBlack/50">
                    {formatterUtility(breakdown.vatPerEmployee)} × {count}
                  </span>
                </div>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(breakdown.totalVat)}
                </span>
              </div>

              {/* Federal Government Fee - applies per employee receiving more than 10,000 */}
              {breakdown.totalFedGovtFee > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                <div className="flex flex-col">
                  <span className="font-medium text-textBlack">Federal Government Fee</span>
                  <span className="text-[10px] text-textBlack/50">
                    {formatterUtility(breakdown.fedGovtFeePerEmployee)} × {breakdown.fgEligibleCount} staff (&gt; ₦10,000)
                  </span>
                </div>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(breakdown.totalFedGovtFee)}
                </span>
              </div>

              )}

              {/* Payfleet Fee */}
              <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                <div className="flex flex-col">
                  <span className="font-medium text-textBlack">Payfleet Processing Fee</span>
                  <span className="text-[10px] text-textBlack/50">
                    {formatterUtility(breakdown.payfleetFeePerEmployee)} × {count}
                  </span>
                </div>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(breakdown.totalPayfleetFee)}
                </span>
              </div>

              {/* Subtotal Per Employee */}
              <div className="pt-2 border-t border-dashed border-primary/20 flex items-center justify-between text-xs font-semibold text-textBlack/80">
                <span>Total Fee Per Employee</span>
                <span className="text-primary font-bold">
                  {formatterUtility(breakdown.totalFeePerEmployee)}
                </span>
              </div>
            </div>

            {/* Grand Totals Summary Box */}
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
                <span>Total Applicable Fees ({count} {count === 1 ? "staff" : "staff"})</span>
                <span className="font-semibold text-textBlack">
                  {formatterUtility(breakdown.totalFees)}
                </span>
              </div>
              <div className="pt-2 border-t border-primary/10 flex items-center justify-between text-sm font-bold text-textBlack">
                <span>Total Amount to Debit</span>
                <span className="text-primary text-base">
                  {formatterUtility(grandTotal)}
                </span>
              </div>
            </div>

            {/* Important Notice */}
            <p className="text-[11px] text-textBlack/50 flex items-center gap-1.5">
              <LuShieldCheck className="text-primary shrink-0" size={14} />
              All transaction fees are billed strictly per recipient employee.
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
        )}
      </div>
    </Modal>
  );
};

export default PaymentFeeBreakdownModal;