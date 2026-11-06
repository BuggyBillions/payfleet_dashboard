import React, { useMemo, useState } from "react";
import { assets } from "../assets/assets";
import { formatterUtility, formatDateTime } from "../helpers/formatterUtility";
import { copyToClipboard } from "../helpers/clipboardHelper";
import type { SalaryPayment, StatusType } from "../lib/interfaces";
import { LuDownload, LuCheck, LuX, LuShare2 } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { RxCountdownTimer } from "react-icons/rx";

export interface PaymentReceiptProps {
  /** Direct SalaryPayment object from interfaces.ts */
  payment?: SalaryPayment | null;

  /** Or explicit individual properties */
  amount?: number | string;
  currency?: string;
  reference?: string;
  status?: StatusType | string;
  date?: string | Date;
  companyName?: string;
  companyLogo?: string;
  employeeName?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  jobTitle?: string;
  paymentType?: string;
  paymentMethod?: string;
  narration?: string;
  description?: string;
  fee?: number | string;
  totalAmount?: number | string;
  receiptNumber?: string;
  sessionId?: string;

  /** Action handlers */
  showActions?: boolean;
  onDownload?: () => void;
  isDownloading?: boolean;
  onShare?: () => void;
  onClose?: () => void;
  className?: string;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  payment,
  amount,
  reference,
  status,
  date,
  companyName,
  employeeName,
  bankName,
  accountNumber,
  paymentMethod = "Bank Transfer",
  fee,
  totalAmount,
  showActions = true,
  onDownload,
  isDownloading = false,
  onShare,
  onClose,
  className = "",
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 1. Resolve Amount
  const resolvedAmount = useMemo(() => {
    if (amount !== undefined && amount !== null) {
      return typeof amount === "number"
        ? amount
        : parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
    }
    return payment?.amount ?? 0;
  }, [amount, payment?.amount]);

  // 2. Resolve Reference
  const resolvedReference = useMemo(() => {
    return reference || payment?.reference || "—";
  }, [reference, payment?.reference]);

  // 3. Resolve Status
  const resolvedStatus = useMemo(() => {
    return (status || payment?.status || "successful") as StatusType;
  }, [status, payment?.status]);

  // 4. Resolve Date
  const resolvedDate = useMemo(() => {
    return formatDateTime(
      date || payment?.payment_date || payment?.created_at || undefined,
    );
  }, [date, payment?.payment_date, payment?.created_at]);

  // 5. Resolve Company Name (Payer)
  const resolvedCompanyName = useMemo(() => {
    return companyName?.trim() || "Company Account";
  }, [companyName]);

  // 6. Resolve Beneficiary (Staff)
  const resolvedEmployeeName = useMemo(() => {
    return (
      employeeName?.trim() ||
      payment?.employee?.full_name?.trim() ||
      payment?.employee?.account_name?.trim() ||
      payment?.employee_name?.trim() ||
      "Staff Member"
    );
  }, [
    employeeName,
    payment?.employee?.full_name,
    payment?.employee?.account_name,
    payment?.employee_name,
  ]);

  // 7. Resolve Destination Bank & Account Number
  const resolvedBankName = useMemo(() => {
    return (
      bankName?.trim() ||
      payment?.employee?.bank_name?.trim() ||
      "Commercial Bank"
    );
  }, [bankName, payment?.employee?.bank_name]);

  const resolvedAccountNumber = useMemo(() => {
    return (
      accountNumber?.trim() || payment?.employee?.account_number?.trim() || "—"
    );
  }, [accountNumber, payment?.employee?.account_number]);

  const handleCopy = async (text: string, fieldName: string) => {
    if (!text || text === "—") return;
    const success = await copyToClipboard(text, fieldName);
    if (success) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment Receipt - ${resolvedReference}`,
          text: `Payfleet Payment Receipt\nPayer: ${resolvedCompanyName}\nBeneficiary: ${resolvedEmployeeName}\nAmount: ${formatterUtility(resolvedAmount)}\nRef: ${resolvedReference}`,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy(resolvedReference, "Reference");
    }
  };

  const detailsList = [
    { label: "Sender", value: resolvedCompanyName },
    {
      label: "Sender account",
      value: resolvedAccountNumber,
      copyable: resolvedAccountNumber !== "—",
    },
    { label: "Sender Bank", value: resolvedBankName },
    { label: "Payment processor", value: "Payfleet Payment Gateway" },
    { label: "Transaction type", value: paymentMethod },
    { label: "Date & Time", value: resolvedDate },
    {
      label: "Reference",
      value: resolvedReference,
      copyable: resolvedReference !== "—",
    },
  ];

  if (fee !== undefined && fee !== null && Number(fee) > 0) {
    detailsList.push({
      label: "Processing Fee",
      value: formatterUtility(Number(fee)),
    });
  }

  if (
    totalAmount !== undefined &&
    totalAmount !== null &&
    Number(totalAmount) !== resolvedAmount
  ) {
    detailsList.push({
      label: "Total Amount",
      value: formatterUtility(Number(totalAmount)),
    });
  }

  const normalizedStatus = String(resolvedStatus).toLowerCase();
  const isSuccess =
    normalizedStatus === "successful" ||
    normalizedStatus === "success" ||
    normalizedStatus === "approved";
  const isPending =
    normalizedStatus === "pending" ||
    normalizedStatus === "processing" ||
    normalizedStatus === "under_review";

  return (
    <div
      className={`relative w-full mx-auto rounded-[26px] overflow-hidden  bg-white transition-colors ${className}`}
      style={{
        color: "#111827",
        boxShadow: "0 15px 45px -15px rgba(0,0,0,0.16)",
      }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="no-capture print:hidden absolute top-1 right-2 z-30 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Close receipt"
        >
          <LuX size={19} />
        </button>
      )}

      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="transform -rotate-12 flex flex-col items-center justify-center text-center"
          style={{ opacity: 0.045 }}
        >
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-primary">
            <img src={assets.logo} alt="" />
          </div>
        </div>
      </div>

      <div
        className="relative h-70 sm:h-70 px-7 sm:px-10 pt-7 text-white overflow-hidden"
        style={{ backgroundColor: "#073f36" }}
      >
        <div
          className="absolute -left-2 -top-30 text-[100px] font-black tracking-tighter text-white/2.5 rotate-[-15deg] pointer-events-none opacity-5"
          aria-hidden="true"
        >
          <img src={assets.whiteLogo} alt="" className="w-full h-max" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">
            Transfer successful
          </span>

          {isSuccess ? (
            <div className="w-11 h-11 rounded-full bg-[#00d39a] flex items-center justify-center text-[#063d34]">
              <LuCheck size={22} strokeWidth={3} />
            </div>
          ) : isPending ? (
            <div className="w-11 h-11 rounded-full bg-[#FFF5E6] flex items-center justify-center text-amber-200/50">
              <RxCountdownTimer size={22} strokeWidth={0} />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-red-200">
              <IoClose size={22} strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center mt-9">
          <span className="text-sm font-medium text-white/55">Amount sent</span>

          <h2 className="text-[34px] sm:text-[46px] font-extrabold tracking-tight text-white mt-1 leading-tight break-all">
            {formatterUtility(resolvedAmount)}
          </h2>

          <span
            className={`mt-4 px-4 py-1.5 capitalize rounded-full ${resolvedStatus === "successful" ? "bg-white/10 text-white" : resolvedStatus === "pending" ? "bg-amber-400/10 text-amber-600" : "bg-red-500/10 text-red-600"} text-xs font-medium`}
          >
            {resolvedStatus === "successful"
              ? "Completed"
              : String(resolvedStatus)}
          </span>
        </div>
      </div>

      <div className="relative z-10 px-5 sm:px-10 pb-8 bg-white">
        <div className="-mt-5 relative z-20 rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] border border-[#f1f3f5] p-5 sm:p-6 -translate-y-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8ba0c0] mb-4">
            Recipient
          </p>

          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-base font-bold"
              style={{
                backgroundColor: "#eafbf4",
                color: "#00875a",
              }}
            >
              {resolvedEmployeeName
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-[#172033] truncate">
                {resolvedEmployeeName}
              </h3>

              <p className="text-sm text-[#71829e] mt-1">
                {resolvedBankName} - {resolvedAccountNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-bold text-[#172033] mb-3">
            Transaction details
          </h3>

          <div className="divide-y divide-[#f0f2f5]">
            {detailsList.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 py-3.75"
              >
                <span className="text-[13px] sm:text-sm text-[#8ba0c0] shrink-0">
                  {item.label}
                </span>

                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] sm:text-sm text-[#293b59] font-medium text-right break-all">
                    {item.value}
                  </span>

                  {item.copyable && item.value && item.value !== "—" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(item.value, item.label)}
                      className="no-capture print:hidden shrink-0 px-2 py-1 rounded-md bg-[#eafbf4] text-[#00875a] text-[10px] font-semibold hover:bg-[#d5f5e8] transition cursor-pointer"
                      title={`Copy ${item.label}`}
                    >
                      {copiedField === item.label ? (
                        <LuCheck size={12} />
                      ) : (
                        "Copy"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-5 p-4 rounded-xl bg-[#f7f9fb] flex items-center justify-center text-center">
          <p className="text-[11px] sm:text-xs text-[#71829e] leading-relaxed">
            This receipt was processed securely through the Payfleet payment
            gateway.
          </p>
        </div>

        {showActions && (
          <div className="no-capture print:hidden mt-12 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl border border-[#dce2eb] bg-white text-[#293b59] text-sm font-semibold hover:bg-[#f8fafc] transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              title="Share receipt"
            >
              <LuShare2 size={18} />
              <span>Share receipt</span>
            </button>

            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="flex-1 py-3 rounded-xl bg-[#006747] text-white text-sm font-semibold hover:bg-[#00563c] active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-[0_5px_12px_rgba(0,103,71,0.2)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              title="Download receipt"
            >
              {isDownloading ? (
                <>
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <LuDownload size={18} />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReceipt;
