import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";
import { LuLoader, LuWallet } from "react-icons/lu";
import StatusBadge from "../ui/StatusBadge";
import type { CompanyDeposit } from "../../services/depositService";
import { getEachCompanyDeposit } from "../../services/depositService";
import { getErrorMessage } from "../../helpers/api";
import { formatterUtility } from "../../helpers/formatterUtility";

interface EachCompanyDepositModalProps {
  depositId: number | string;
  onClose: () => void;
}

const formatDate = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getReference = (d: Partial<CompanyDeposit>): string =>
  String(
    d.transaction?.reference ??
      d.reference ??
      d.reference_no ??
      d.transaction_reference ??
      d.ref ??
      d.id ??
      "—",
  );

const getStatus = (d: Partial<CompanyDeposit>): string => {
  const status = d.transaction?.status ?? d.status;
  if (typeof status === "number") return status === 1 ? "successful" : "pending";
  if (typeof status === "boolean") return status ? "successful" : "pending";
  return String(status ?? "pending");
};

const EachCompanyDepositModal: React.FC<EachCompanyDepositModalProps> = ({
  depositId,
  onClose,
}) => {
  const [deposit, setDeposit] = useState<Partial<CompanyDeposit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getEachCompanyDeposit(depositId)
      .then((data) => {
        if (mounted) setDeposit(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(getErrorMessage(err, "Failed to load deposit details"));
          toast.error(getErrorMessage(err, "Failed to load deposit details"));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [depositId]);

  const amount = Number(deposit?.transaction?.amount ?? deposit?.amount) || 0;
  const displayName = deposit?.company?.name || deposit?.company_name || "";
  const displayEmail = deposit?.company?.email || deposit?.email || "";
  const transactionDescription = deposit?.transaction?.description || "";

  const details: Array<{ label: string; value: string }> = [
    { label: "Reference", value: getReference(deposit || {}) },
    { label: "Amount", value: formatterUtility(amount) },
    {
      label: "Method",
      value: deposit?.method ? String(deposit.method) : "—",
    },
    {
      label: "Type",
      value:
        deposit?.transaction?.transaction_type
          ? String(deposit.transaction.transaction_type)
          : "—",
    },
    {
      label: "Description",
      value: transactionDescription || "—",
    },
    { label: "Bank Name", value: deposit?.bank_name ? String(deposit.bank_name) : "—" },
    {
      label: "Account Number",
      value: deposit?.account_number ? String(deposit.account_number) : "—",
    },
    {
      label: "Account Name",
      value: deposit?.account_name ? String(deposit.account_name) : "—",
    },
    {
      label: "Date",
      value: formatDate(
        deposit?.created_at ??
          deposit?.date ??
          deposit?.settled_at ??
          deposit?.transaction?.updated_at ??
          deposit?.transaction?.created_at,
      ),
    },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <LuWallet size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-textBlack">Deposit Details</h2>
            <p className="text-xs text-textBlack/60">
              {displayName || "Deposit transaction"}{" "}
              {displayEmail && `· ${displayEmail}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <LuLoader size={20} className="animate-spin" />
            <span className="text-xs">Loading deposit details...</span>
          </div>
        ) : error && !deposit ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-500 gap-2">
            <span className="text-xs">{error}</span>
          </div>
        ) : (
          <>
            <div className="bg-secondary border border-primary/10 rounded-xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-textBlack/60 font-medium">Amount</p>
                <p className="text-2xl font-bold text-textBlack">
                  {formatterUtility(amount)}
                </p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <StatusBadge status={getStatus(deposit || {})} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="bg-secondary/50 p-3 rounded-lg border border-primary/10 space-y-1"
                >
                  <p className="text-xs text-textBlack/60 font-medium">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-textBlack truncate">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg border border-primary/10 bg-secondary hover:bg-primary/10 text-textBlack font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EachCompanyDepositModal;