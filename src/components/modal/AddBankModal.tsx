import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import type { AddBankModalProps, BankItem } from "../../lib/interfaces";
import { useCreateAccount, useResolveAccount } from "../../hooks/useBank";
import SearchableInput from "../ui/SearchableInput";
import ActionButton from "../ui/ActionButton";
import { toast } from "sonner";

const inputClass =
  "w-full text-textBlack border border-primary/10 bg-secondary rounded-lg px-4 h-11 text-xs outline-0 placeholder:text-textBlack/40 focus:border-primary/40 transition";

const AddBankModal: React.FC<AddBankModalProps> = ({
  onClose,
  defaultBank,
  onSuccess,
}) => {
  const createAccountMutation = useCreateAccount();
  const resolveAccountMutation = useResolveAccount();

  const [bankName, setBankName] = useState(defaultBank?.name || "");
  const [bankCode, setBankCode] = useState(defaultBank?.code || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (defaultBank) {
      setBankName(defaultBank.name);
      setBankCode(defaultBank.code || "");
    }
  }, [defaultBank]);

  // Auto-resolve account name using /resolve-account when 10 digits and bank_code are present
  useEffect(() => {
    if (accountNumber.trim().length === 10 && bankCode) {
      resolveAccountMutation.mutate(
        {
          account_number: accountNumber.trim(),
          bank_code: bankCode,
        },
        {
          onSuccess: (data: unknown) => {
            const res = data as {
              account_name?: string;
              accountName?: string;
              data?: { account_name?: string; accountName?: string };
            };
            const resolvedName =
              res?.account_name ||
              res?.data?.account_name ||
              res?.accountName ||
              res?.data?.accountName;
            if (resolvedName) {
              setAccountName(resolvedName);
              toast.success(`Account verified: ${resolvedName}`);
            }
          },
        }
      );
    }
  }, [accountNumber, bankCode]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bankName.trim()) {
      toast.error("Please search and select a bank");
      return;
    }
    if (!accountNumber.trim() || accountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit account number");
      return;
    }
    if (!accountName.trim()) {
      toast.error("Please provide the account holder name");
      return;
    }

    createAccountMutation.mutate(
      {
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        bank_code: bankCode?.trim(),
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-textBlack">
              Configure Settlement Account
            </h2>
            <p className="text-xs text-textBlack/60">
              Select bank from list and resolve account details
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Searchable Bank Input using /all-banks */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-medium text-xs text-textBlack">
              Select Bank
            </label>
            <SearchableInput<BankItem>
              endpoint="/all-banks"
              queryParam="search"
              placeholder="Search bank name (e.g. OPay, GTBank)..."
              displayKey="name"
              dataKey="data"
              fetchOnEmpty={true}
              initialValue={bankName}
              onSelect={(selected: BankItem) => {
                setBankName(selected.name);
                setBankCode(selected.code || selected.bank_code || "");
              }}
              className="w-full"
              inputContClassName="w-full text-textBlack border border-primary/10 bg-secondary rounded-lg h-11 text-xs outline-0"
            />
            {bankCode && (
              <span className="text-[10px] text-textBlack/50 font-mono">
                Bank Code: {bankCode}
              </span>
            )}
          </div>

          {/* Account Number */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-medium text-xs text-textBlack">
              Account Number
            </label>
            <input
              type="text"
              maxLength={10}
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="10-digit NUBAN account number"
              className={inputClass}
              required
            />
          </div>

          {/* Account Name with /resolve-account status */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-xs text-textBlack">
                Account Name 
              </label>
              {resolveAccountMutation.isPending ? (
                <span className="text-[10px] text-primary animate-pulse">
                  Resolving account name...
                </span>
              ) : accountName ? (
                <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                  Resolved
                </span>
              ) : null}
            </div>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account holder registered name"
              className={inputClass}
              required
              disabled
            />
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-primary/10 hover:bg-secondary text-textBlack transition cursor-pointer"
            >
              Cancel
            </button>
            <ActionButton
              text="Save Bank Account"
              loadingText="Saving..."
              loading={createAccountMutation.isPending}
              action={handleSubmit}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddBankModal;
