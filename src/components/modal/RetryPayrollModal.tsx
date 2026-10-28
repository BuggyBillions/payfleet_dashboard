import React, { useState } from "react";
import { toast } from "sonner";
import { LuLoader } from "react-icons/lu";
import Modal from "./Modal";
import PaymentFeeBreakdownModal from "./PaymentFeeBreakdownModal";
import PinInput from "../ui/PinInput";
import type { SalaryPayment } from "../../lib/interfaces";
import { useUser } from "../../hooks/useUser";
import { useRetryPayrollPayment } from "../../hooks/useSalaryPayments";
import { formatterUtility } from "../../helpers/formatterUtility";

/**
 * Shows fee breakdown for the single employee payout retry,
 * then asks for the 4-digit transaction PIN via 4-pin box and executes POST /retry-payroll/{id}.
 */
const RetryPayrollModal: React.FC<{
  payment: SalaryPayment | null;
  onClose: () => void;
}> = ({ payment, onClose }) => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;
  const [step, setStep] = useState<"fee" | "pin">("fee");
  const [pin, setPin] = useState("");
  const retryMutation = useRetryPayrollPayment();

  const close = () => {
    if (retryMutation.isPending) return;
    setPin("");
    setStep("fee");
    onClose();
  };

  const handleRetry = () => {
    if (!payment) return;

    if (!/^\d{4}$/.test(pin)) {
      toast.error("Enter your 4-digit transaction PIN");
      return;
    }
    if (!companyId) {
      toast.error("Could not resolve your company");
      return;
    }

    retryMutation.mutate(
      { id: payment.id, pin, company_id: companyId },
      {
        onSuccess: () => {
          close();
        },
      },
    );
  };

  if (!payment) return null;

  return (
    <>
      {/* Step 1: Fee breakdown modal before Transaction PIN */}
      {step === "fee" && (
        <PaymentFeeBreakdownModal
          isOpen={true}
          onClose={close}
          onConfirm={() => setStep("pin")}
          employeeCount={1}
          fgEligibleCount={(Number(payment.amount) || 0) > 10000 ? 1 : 0}
          totalPayoutAmount={Number(payment.amount) || 0}
        />
      )}

      {/* Step 2: Transaction PIN modal with 4-PIN Box */}
      {step === "pin" && (
        <Modal onClose={close}>
          <div className="flex flex-col gap-6 max-w-sm w-full mx-auto p-1">
            <div className="flex flex-col text-center sm:text-left space-y-1">
              <h3 className="font-semibold text-base text-textBlack">
                Authorize Retry Payment
              </h3>
              <p className="text-xs text-textBlack/60">
                This will retry the {formatterUtility(payment.amount)} payout to{" "}
                {payment.employee?.full_name || payment.employee_name} (
                {payment.reference}). Enter your 4-digit PIN to proceed.
              </p>
            </div>

            {/* 4-Box PIN Input */}
            <div className="py-2">
              <PinInput
                value={pin}
                onChange={setPin}
                length={4}
                autoFocus
                disabled={retryMutation.isPending}
                label="Enter 4-Digit PIN"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                disabled={retryMutation.isPending}
                className="px-4 h-10 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRetry}
                disabled={retryMutation.isPending || pin.length !== 4}
                className="px-6 h-10 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              >
                {retryMutation.isPending && (
                  <LuLoader size={13} className="animate-spin" />
                )}
                {retryMutation.isPending ? "Retrying..." : "Retry Payment"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default RetryPayrollModal;