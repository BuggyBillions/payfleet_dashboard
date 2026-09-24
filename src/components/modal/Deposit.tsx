import React, { useState, useEffect, useId } from "react";
import Modal from "./Modal";
import { toast } from "sonner";
import { assets } from "../../assets/assets";
import { formatterUtility } from "../../helpers/formatterUtility";
import type { DemoDeposit } from "../../services/demoDepositService";
import {
  LuCreditCard,
  LuBuilding,
  LuCopy,
  LuCheck,
  LuLock,
  LuX,
  LuArrowRight,
  LuShieldCheck,
} from "react-icons/lu";
import { BsArrowLeftRight } from "react-icons/bs";
import { RiSmartphoneLine } from "react-icons/ri";
import { IoRadioButtonOnOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import FormattedInput from "../ui/FormattedInput";

interface DepositModalProps {
  onClose: () => void;
  onDepositSuccess?: (deposit: DemoDeposit) => void;
  defaultAmount?: number;
}

type PaymentMethod = "zap" | "card" | "transfer" | "bank" | "ussd" | "opay";
type ModalView = "amount" | "transfer_details" | "waiting_confirmation" | "success";

const Deposit: React.FC<DepositModalProps> = ({
  onClose,
  onDepositSuccess,
  defaultAmount,
}) => {
  // Start with 'amount' view since there is no default amount
  const [view, setView] = useState<ModalView>(defaultAmount && defaultAmount > 0 ? "transfer_details" : "amount");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("transfer");
  const [amount, setAmount] = useState<number>(defaultAmount || 0);
  const [customAmountStr, setCustomAmountStr] = useState<string>(
    defaultAmount && defaultAmount > 0 ? defaultAmount.toString() : ""
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const inputId = useId();

  // Expiry countdown for transfer details (starts at 29:19 = 1759 seconds)
  const [expirySeconds, setExpirySeconds] = useState(1759);

  // Countdown timer for waiting screen (starts at 9:50 = 590 seconds)
  const [waitingSeconds, setWaitingSeconds] = useState(590);

  // Simulation verification state in waiting screen
  const [isReceived, setIsReceived] = useState(false);
  const [reference, setReference] = useState("");

  const accountNumber = "9903723754";
  const bankName = "Paystack-Titan";
  const userEmail = "company@payfleet.io";

  // Generate transaction reference
  useEffect(() => {
    const randomRef = `PF-DEP-${Math.floor(100000 + Math.random() * 900000)}`;
    setReference(randomRef);
  }, []);

  // Expiry timer
  useEffect(() => {
    if (view !== "transfer_details") return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  // Waiting screen countdown and automated confirmation simulation
  useEffect(() => {
    if (view !== "waiting_confirmation") return;

    const interval = setInterval(() => {
      setWaitingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Simulate verification arriving after 4.5 seconds
    const confirmTimer = setTimeout(() => {
      setIsReceived(true);

      // Transition to success screen after 1.2 seconds of showing Received checkmark
      setTimeout(() => {
        setView("success");
        const newDeposit: DemoDeposit = {
          id: Date.now(),
          reference,
          amount,
          method: "Bank Transfer",
          status: "successful",
          date: new Date().toISOString(),
        };
        onDepositSuccess?.(newDeposit);
        toast.success("Payment confirmed! Wallet credited.");
      }, 1200);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(confirmTimer);
    };
  }, [view, amount, onDepositSuccess, reference]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const handleMethodSelect = (method: PaymentMethod) => {
    if (method === "transfer") {
      setSelectedMethod("transfer");
      if (view === "amount" && amount >= 100) setView("transfer_details");
    } else {
      toast.info(`Please use Transfer. ${method.toUpperCase()} channel is currently in maintenance.`);
    }
  };

  const handleProceedToDetails = () => {
    const parsed = parseFloat(customAmountStr.replace(/,/g, ""));
    if (isNaN(parsed) || parsed < 100) {
      toast.error("Please enter a valid deposit amount (min ₦100)");
      return;
    }
    setAmount(parsed);
    setView("transfer_details");
    setExpirySeconds(1759);
  };

  const formattedAmountText = amount > 0 ? `NGN ${amount.toLocaleString()}` : "NGN 0";

  return (
    <Modal customMode onClose={onClose}>
      <div className="flex flex-col items-center justify-center p-2 w-full max-w-2xl mx-auto">
        {/* Main Modal Card */}
        <div className="relative w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[490px]">
          
          {/* LEFT SIDEBAR: PAY WITH */}
          <div className="w-full md:w-52 bg-[#F9FAFB] border-b md:border-b-0 md:border-r border-gray-200/80 p-5 flex flex-col">
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-4">
              PAY WITH
            </p>

            <nav className="flex flex-col space-y-1">
              {/* Zap */}
              <button
                type="button"
                onClick={() => handleMethodSelect("zap")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedMethod === "zap"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-700 hover:bg-gray-200/60"
                }`}
              >
                <span className="bg-red-500 text-white text-[9px] font-extrabold px-1 py-0.5 rounded">
                  NEW
                </span>
                <span>Zap</span>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => handleMethodSelect("card")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedMethod === "card"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-700 hover:bg-gray-200/60"
                }`}
              >
                <LuCreditCard size={16} className="text-gray-500" />
                <span>Card</span>
              </button>

              {/* Transfer (Active / Working) */}
              <button
                type="button"
                onClick={() => handleMethodSelect("transfer")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedMethod === "transfer"
                    ? "bg-white text-[#00A859] shadow-2xs border-l-3 border-[#00A859]"
                    : "text-gray-700 hover:bg-gray-200/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#00A859] text-white p-1 rounded">
                    <BsArrowLeftRight size={11} />
                  </div>
                  <span className="text-[#00A859] font-bold">Transfer</span>
                </div>
              </button>

              {/* Bank */}
              <button
                type="button"
                onClick={() => handleMethodSelect("bank")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedMethod === "bank"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-700 hover:bg-gray-200/60"
                }`}
              >
                <LuBuilding size={16} className="text-gray-500" />
                <span>Bank</span>
              </button>

              {/* USSD */}
              <button
                type="button"
                onClick={() => handleMethodSelect("ussd")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedMethod === "ussd"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-700 hover:bg-gray-200/60"
                }`}
              >
                <RiSmartphoneLine size={16} className="text-gray-500" />
                <span>USSD</span>
              </button>

              {/* OPay */}
              <button
                type="button"
                onClick={() => handleMethodSelect("opay")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedMethod === "opay"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-700 hover:bg-gray-200/60"
                }`}
              >
                {/* <IoRadioButtonOnOutline size={16} className="text-gray-500" /> */}
                <img src="data:image/png;base64,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" alt="" width={16}/>
                <span>OPay</span>
              </button>
            </nav>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative bg-white">
            {/* Top Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer p-1"
            >
              <LuX size={18} />
            </button>

            {/* Top Merchant / User Info */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img
                  src={assets.favicon || assets.logo}
                  alt="Merchant Logo"
                  className="w-8 h-8 rounded object-contain"
                />
              </div>

              <div className="text-right pr-6">
                <p className="text-xs text-gray-500 truncate max-w-[200px]" title={userEmail}>
                  {userEmail}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-xs text-gray-600">Pay</span>
                  {amount > 0 ? (
                    <button
                      type="button"
                      onClick={() => setView("amount")}
                      className="text-xs font-bold text-[#00A859] hover:underline cursor-pointer"
                      title="Click to edit amount"
                    >
                      {formattedAmountText}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">--</span>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT VIEWS */}
            <div className="py-3 my-auto">
              <AnimatePresence mode="wait">
                {/* VIEW 1: AMOUNT INPUT (First Screen when opened) */}
                {view === "amount" && (
                  <motion.div
                    key="amount-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Enter Deposit Amount
                      </h3>
                      <p className="text-xs text-gray-500">
                        Input the amount you wish to deposit to generate your dedicated bank transfer details.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor={inputId} className="text-xs font-medium text-gray-700 block">
                        Amount to Pay (NGN)
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-gray-500 font-bold text-base">₦</span>
                        <FormattedInput
                          id={inputId}
                          type="number"
                          min={100}
                          value={customAmountStr}
                          name="amount"
                          onChange={(e) => {
                            setCustomAmountStr(e.target.value);
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) setAmount(val);
                          }}
                          placeholder="e.g. 50,000"
                          className="w-full h-12 pl-8 pr-3 text-lg font-bold text-gray-800 bg-[#F9FAFB] border border-gray-200 rounded-lg focus:bg-white focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] outline-none transition"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Quick amount chips */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Quick Select</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[10000, 50000, 100000, 250000, 500000, 1000000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setAmount(amt);
                              setCustomAmountStr(amt.toString());
                            }}
                            className={`py-1.5 px-2 text-xs font-semibold rounded border transition cursor-pointer text-center ${
                              customAmountStr === amt.toString()
                                ? "border-[#00A859] bg-[#00A859]/10 text-[#00A859]"
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
                        onClick={handleProceedToDetails}
                        disabled={!customAmountStr || parseFloat(customAmountStr) < 100}
                        className="w-full h-11 bg-[#00A859] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg hover:bg-[#008f4c] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <span>
                          {customAmountStr && parseFloat(customAmountStr) >= 100
                            ? `Proceed with NGN ${parseFloat(customAmountStr).toLocaleString()}`
                            : "Enter an amount to continue"}
                        </span>
                        <LuArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* VIEW 2: TRANSFER DETAILS (Matches Screenshot 1) */}
                {view === "transfer_details" && (
                  <motion.div
                    key="transfer-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-bold text-gray-800 text-center">
                      Transfer {formattedAmountText} to PAYSTACK CHECKOUT
                    </h3>

                    {/* Transfer Details Card */}
                    <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-3.5 border border-gray-100">
                      {/* Bank Name */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          BANK NAME
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                          {bankName}
                        </p>
                      </div>

                      {/* Account Number */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          ACCOUNT NUMBER
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-sm font-bold text-gray-900 tracking-wide font-mono">
                            {accountNumber}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy(accountNumber, "Account number")}
                            className="text-gray-400 hover:text-gray-700 transition cursor-pointer p-1"
                            title="Copy Account Number"
                          >
                            {copiedField === "Account number" ? (
                              <LuCheck size={14} className="text-[#00A859]" />
                            ) : (
                              <LuCopy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          AMOUNT
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-sm font-bold text-gray-900">
                            {formattedAmountText}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy(amount.toString(), "Amount")}
                            className="text-gray-400 hover:text-gray-700 transition cursor-pointer p-1"
                            title="Copy Amount"
                          >
                            {copiedField === "Amount" ? (
                              <LuCheck size={14} className="text-[#00A859]" />
                            ) : (
                              <LuCopy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dashed line */}
                    <div className="border-b border-dashed border-gray-200" />

                    {/* Instruction text */}
                    <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                      Search for Paystack-Titan or Titan-Paystack in your bank app. This account is for this transaction only and expires in{" "}
                      <span className="text-[#00A859] font-bold">{formatTime(expirySeconds)}</span>
                    </p>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setView("waiting_confirmation");
                          setWaitingSeconds(590);
                          setIsReceived(false);
                        }}
                        className="w-full py-3 px-4 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer text-center shadow-2xs"
                      >
                        I've sent the money
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* VIEW 3: WAITING TO CONFIRM TRANSFER (Matches Screenshot 2) */}
                {view === "waiting_confirmation" && (
                  <motion.div
                    key="waiting-view"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="py-4 flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-gray-800">
                        We're waiting to confirm your transfer.
                      </h3>
                      <p className="text-xs text-gray-500">
                        This can take a few minutes
                      </p>
                    </div>

                    {/* Progress Stepper with Animated Bar */}
                    <div className="w-full max-w-xs flex flex-col items-center">
                      <div className="flex items-center justify-between w-full px-4">
                        {/* Sent Step */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-[#00A859] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            <LuCheck size={14} className="stroke-[3]" />
                          </div>
                          <span className="text-[11px] font-semibold text-[#00A859]">
                            Sent
                          </span>
                        </div>

                        {/* Progress Bar Line */}
                        <div className="flex-1 mx-3 h-1 bg-gray-200 rounded-full overflow-hidden relative">
                          <motion.div
                            className="h-full bg-[#00A859] rounded-full"
                            initial={{ width: "20%" }}
                            animate={{ width: isReceived ? "100%" : ["20%", "70%", "45%", "85%"] }}
                            transition={{
                              duration: isReceived ? 0.4 : 3,
                              repeat: isReceived ? 0 : Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </div>

                        {/* Received Step */}
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                              isReceived
                                ? "bg-[#00A859] text-white shadow-xs"
                                : "border-2 border-dashed border-gray-300 text-transparent"
                            }`}
                          >
                            {isReceived && <LuCheck size={14} className="stroke-[3]" />}
                          </div>
                          <span
                            className={`text-[11px] font-medium transition-colors ${
                              isReceived ? "text-[#00A859] font-bold" : "text-gray-400"
                            }`}
                          >
                            Received
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Please wait countdown box */}
                    <div className="w-full max-w-xs py-2.5 px-4 bg-white border border-gray-300 rounded-md text-center text-xs font-medium text-gray-600 shadow-2xs">
                      Please wait for {formatTime(waitingSeconds)} minutes
                    </div>

                    {/* Return link */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setView("transfer_details")}
                        className="text-xs text-gray-500 hover:text-gray-800 hover:underline transition cursor-pointer font-medium"
                      >
                        Show account number
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* VIEW 4: SUCCESS CONFIRMATION */}
                {view === "success" && (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="py-4 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-green-100 text-[#00A859] flex items-center justify-center shadow-inner">
                      <LuCheck size={28} className="stroke-[3]" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900">
                        Transfer Confirmed!
                      </h3>
                      <p className="text-xs text-gray-500">
                        Your deposit of <strong className="text-[#00A859]">{formattedAmountText}</strong> has been credited to your Payfleet wallet.
                      </p>
                    </div>

                    <div className="w-full bg-[#F8F9FA] rounded-lg p-3 text-xs text-left space-y-1.5 border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reference:</span>
                        <span className="font-mono font-semibold text-gray-800">{reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Channel:</span>
                        <span className="font-medium text-gray-800">Bank Transfer (Paystack-Titan)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="text-[#00A859] font-bold">SUCCESSFUL</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 bg-[#00A859] text-white text-xs font-bold rounded-lg hover:bg-[#008f4c] transition cursor-pointer shadow-sm"
                    >
                      Done & Return to Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom empty spacing or subtle note */}
            <div />
          </div>
        </div>

        {/* Footer Secured By Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
          <LuLock size={12} className="text-gray-700" />
          <span>Secured by</span>
          <span className="font-bold text-gray-900 tracking-tight">paystack</span>
        </div>
      </div>
    </Modal>
  );
};

export default Deposit;