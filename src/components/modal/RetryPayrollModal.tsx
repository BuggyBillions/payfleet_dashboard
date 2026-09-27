import React, { useState } from "react";
import { toast } from "sonner";
import { LuLoader } from "react-icons/lu";
import Modal from "./Modal";
import type { SalaryPayment } from "../../lib/interfaces";
import { useUser } from "../../hooks/useUser";
import { useRetryPayrollPayment } from "../../hooks/useSalaryPayments";
import { formatterUtility } from "../../helpers/formatterUtility";

/**
 * Asks for the transaction PIN then retries one failed salary payment via
 * POST /retry-payroll/{id}. The id is the payment's own id.
 */
const RetryPayrollModal: React.FC<{
  payment: SalaryPayment | null;
  onClose: () => void;
}> = ({ payment, onClose }) => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;
  const [pin, setPin] = useState("");
  const retryMutation = useRetryPayrollPayment();

  const close = () => {
    if (retryMutation.isPending) return;
    setPin("");
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
      { onSuccess: close },
    );
  };

  if (!payment) return null;

  return (
    <Modal onClose={close}>
      <div className="flex flex-col gap-5 max-w-sm">
        <div className="flex flex-col">
          <h3 className="font-semibold text-base text-textBlack">
            Retry payment?
          </h3>
          <p className="text-xs text-textBlack/60">
            This will retry the {formatterUtility(payment.amount)} payout to{" "}
            {payment.employee?.full_name || payment.employee_name} (
            {payment.reference}).
          </p>
        </div>

        <label className="flex flex-col space-y-1.5">
          <span className="font-medium text-xs text-textBlack">
            Transaction PIN
          </span>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 4-digit PIN"
            className="w-full text-textBlack border border-primary/10 bg-secondary rounded-lg px-4 h-11 text-xs outline-0 placeholder:text-textBlack/40 focus:border-primary/40 transition"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
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
            disabled={retryMutation.isPending}
            className="px-6 h-10 text-xs font-medium bg-primary hover:bg-primary/90 text-textBlack rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
          >
            {retryMutation.isPending && (
              <LuLoader size={13} className="animate-spin" />
            )}
            {retryMutation.isPending ? "Retrying..." : "Retry"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RetryPayrollModal;
