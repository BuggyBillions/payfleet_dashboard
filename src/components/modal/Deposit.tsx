import React, { useState, useId } from "react";
import Modal from "./Modal";
import { toast } from "sonner";
import type { DemoDeposit } from "../../lib/interfaces";
import {
  LuCopy,
  LuCheck,
  LuX,
  LuArrowRight,
  LuBuilding,
  LuLoader,
} from "react-icons/lu";
import FormattedInput from "../ui/FormattedInput";
import type { DepositModalProps } from "../../lib/interfaces";
import { companyFunding } from "../../services/depositService";
import { getErrorMessage } from "../../helpers/api";
import { useAccount } from "../../hooks/useBank";

const Deposit: React.FC<DepositModalProps> = ({
  onClose,
  onDepositSuccess,
  companyId,
}) => {
  const [amountStr, setAmountStr] = useState("");
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const inputId = useId();

  const { data: account, isLoading: loadingAccount } = useAccount();

  const accountName = account?.account_name ?? "";
  const accountNumber = account?.account_number ?? "";
  const bankName = account?.bank_name ?? "";

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleConfirm = async () => {
    const parsed = parseFloat(String(amountStr).replace(/,/g, ""));
    if (isNaN(parsed) || parsed < 100) {
      toast.error("Please enter a valid deposit amount (min ₦100)");
      return;
    }
    if (!companyId) {
      toast.error("Unable to identify your company. Please log in again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await companyFunding({
        company_id: companyId,
        amount: parsed,
      });
      const ref =
        data?.reference ??
        data?.reference_no ??
        data?.transaction_reference ??
        data?.ref ??
        `PF-DEP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newDeposit: DemoDeposit = {
        id: Date.now(),
        reference: String(ref),
        amount: parsed,
        method: "Bank Transfer",
        status: "successful",
        date: new Date().toISOString(),
      };
      onDepositSuccess?.(newDeposit);
      toast.success("Deposit submitted for processing!");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to initiate deposit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal customMode onClose={onClose}>
      <div className="flex flex-col items-center justify-center p-2 w-full max-w-3xl mx-auto">
        <div className="relative w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 z-10"
          >
            <LuX size={18} />
          </button>

          <div className="p-6 md:p-8">
            <div className="mb-6 pr-8">
              <h3 className="text-base font-bold text-gray-800">Deposit Funds</h3>
              <p className="text-xs text-gray-500">
                Transfer the amount below to the displayed account, then confirm your deposit.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Amount Card */}
              <div className="bg-[#F9FAFB] rounded-lg p-5 border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Enter Amount
                </p>

                <div className="space-y-1.5">
                  <label htmlFor={inputId} className="text-xs font-medium text-gray-700 block">
                    Amount to Deposit (NGN)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-500 font-bold text-base">₦</span>
                    <FormattedInput
                      id={inputId}
                      type="number"
                      name="amount"
                      min={100}
                      value={amountStr}
                      onChange={(e) => {
                        const inputValue = String(e.target.value);
                        setAmountStr(inputValue);
                        const val = parseFloat(inputValue);
                        if (!isNaN(val)) setAmount(val);
                      }}
                      placeholder="e.g. 50000"
                      className="w-full h-12 pl-8 pr-3 text-lg font-bold text-gray-800 bg-white border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Quick Select</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[50000, 100000, 250000, 500000, 700000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setAmount(amt);
                          setAmountStr(amt.toString());
                        }}
                        className={`py-1.5 px-2 text-xs font-semibold rounded border transition cursor-pointer text-center ${
                          amountStr === amt.toString()
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting || !amountStr || parseFloat(amountStr) < 100}
                    className="w-full h-11 bg-primary disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg hover:bg-[#008f4c] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <LuLoader size={14} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>Confirm Deposit</span>
                        <LuArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bank Account Card */}
              <div className="bg-white rounded-lg p-5 border border-gray-200 space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Transfer To
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Make a manual transfer to this account
                  </p>
                </div>

                {loadingAccount ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                    <LuLoader size={20} className="animate-spin" />
                    <span className="text-xs">Loading account details...</span>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        BANK NAME
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5">
                        <LuBuilding size={13} className="text-gray-400 shrink-0" />
                        {bankName || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        ACCOUNT NUMBER
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-sm font-bold text-gray-900 tracking-wide font-mono">
                          {accountNumber || "—"}
                        </p>
                        {accountNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopy(accountNumber, "Account number")}
                            className="text-gray-400 hover:text-gray-700 transition cursor-pointer p-1"
                            title="Copy Account Number"
                          >
                            {copiedField === "Account number" ? (
                              <LuCheck size={14} className="text-primary" />
                            ) : (
                              <LuCopy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        ACCOUNT NAME
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-sm font-bold text-gray-900">
                          {accountName || "—"}
                        </p>
                        {accountName && (
                          <button
                            type="button"
                            onClick={() => handleCopy(accountName, "Account name")}
                            className="text-gray-400 hover:text-gray-700 transition cursor-pointer p-1"
                            title="Copy Account Name"
                          >
                            {copiedField === "Account name" ? (
                              <LuCheck size={14} className="text-primary" />
                            ) : (
                              <LuCopy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        AMOUNT
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {amount > 0 ? `NGN ${amount.toLocaleString()}` : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Deposit;