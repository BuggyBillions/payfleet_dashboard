import React, { useState, useEffect, useId } from "react";
import { toast } from "sonner";
import { assets } from "../../assets/assets";
import type { DemoDeposit } from "../../lib/interfaces";
import {
  LuCreditCard,
  LuBuilding,
  LuCopy,
  LuCheck,
  LuLock,
  LuX,
  LuArrowRight,
  LuLoader,
  LuChevronRight,
  LuChevronLeft,
  LuClock,
} from "react-icons/lu";
import { BsArrowLeftRight } from "react-icons/bs";
import { RiSmartphoneLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import type { DepositModalProps, PaymentMethod, ModalView } from "../../lib/interfaces";
import { useAccount } from "../../hooks/useBank";
import { companyFunding, getEachCompanyDeposit, getCompanyDeposits } from "../../services/depositService";
import { getErrorMessage } from "../../helpers/api";
import Modal from "../../components/modal/Modal";
import FormattedInput from "../../components/ui/FormattedInput";
import { HiHashtag } from "react-icons/hi2";
import { useUser } from "../../hooks/useUser";

const opayLogoBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAACUCAMAAAAanWP/AAAAk1BMVEX///8dz58hEGAdzqAAAEb8+/wAAFa1sMV0bpT0//8AxJTJ+O4mxZr29fkAAFEAAE7v6/iDfqAeC18Aypin49bb+vdw2bzo+vdJ0azR8+yp6dnY9O552r+D3MM1zKNCyqZX0K+16t/B7+Wf59S28OBn2biR48yY3cxu0rl80bzFwtDc2uKcmLAAADUAADw1KWCLh6NzkUexAAAGyElEQVR4nO1da5ejNgxl6t22dpjtwwHzNK+QTHfb7f7/X9dA5kFngvySgZyTe2a+zcC1kGVJSCII7rjjDkxQKvK0bfYXtDsh6NqUNEGjtntKJGGM84cRnHMWyrrI2mjTi6Bi18XVG+//47wIJuMu3eaDoPm+SM7UJ4TJ+PNuDWFSHvKtrSDPioRcFfqVx0CSshFrM56gHbm/l7RiBenarC+gTW1A/BUkrNu1qQeByCSzID8+AlYd1tUhcajeyFs8A1avuAlo09tK/u0JxO1KZigtpKatARcgy3wN9p18sFKYKwvoFief1gjEXxfQL7sDRBci6M2Ev8wW3AF54bplP4CUiz2ANhlFj6H3b+D9QqdYhmFwrvCXi/DvcKU+QZh5Jy8KL6K/gB09b2Aae2R/ViC//EXplf1ggDzy96o5F3B//GnpbddO+B+9sfcu+wHk5If9cRH2Z/6dD/3J0B2FOfg4v9JwKfYPPEEP4yPTeHzISoUjhryVtt6RC39k9aFKkzldHedhXWZtGo1I0+b4JN9ybxpywDY/CkeHTDgR2e+vJDNFW0j5oPsUGKr700r1HYcFcJIU87kD2pZjKk5HDTHVX/R6UiN9p7hr1PR6uURe4IUvndYdWZ1p3FJoZlcImvrkOvfjoW64KrJKRxwyQqIPqw4Zf41iVVpqCISXOOz36q3GTdOtrUaehe0w2Av1nUhhnCgTau+V1xiHV6a6D7fysWin9EJI485e1Ip9xqWdjaCtcgPU7sZT5WhyaS2jRsXf3XiKZE74zzrlcjyqDnPuLH6F8B1zS42Cv6v2U4XmM8fIQmEXeOFmfHaw8JlzZl4RgYZunhvs5rsK5wwKH+lujr8AbbP7zhpuAau/dLnFHhSNRPHJd6D6s4P9lWkPSgYnooPTRzy2v3I692BHgVVIAUWaQDIK7bfXCXquHMEjuQAMpLm9aW5CNo8ai32QQ+Lnf9lfONrNAzEVAx5eyZZqZ66CVhemV1dBNlI5AwDMBSz/zt0U4PFYrM1OjXnnhGAELb5xjrxmt29lrPyPX39R4RsqfVHNS9/Y6f/89z+fFPj+7yMmfchz4KZ79/GPLz8p8Odvv2PSD/bzgYWx07wC/Vn3avDaDPfuCvSBfIxxWLEGfSCuSwxzeCvQD07z9E3DojXoA26bqdezBn0gZWWajdkYfdPAaA36kOU0DNdXoT8fcnHDTO2d/p3+bdEHtu5t02c3YDhv/Ng63LbTcNsuG1QnILfvMAM1N7cQrsymaclNBIvt/M41rgt+/PH9ZwW+fEJNlEBZTuNESfDtx68qfEVlL4DXUBalAZ+VQGUfpMD7Y5w3gF4BZci3n6KlsynOM+Kt9VZ/AFja46cgHhM1UJxKHKo+6DzwyAcp9GrOviwgrcJ54FVJ0xhg/2D/Wv0EXZah2bOGAGXNfG99XbBYi2NZBLhCmtkX01KwhBOryhiuqKodrnyELmycuL6OCCzoMXd4JsjhciT3YiplG2HoVIgNl2q5l7Kd3QWwWo67vZMGKkUJSottC8iHuJ1ZgbLSjFeO6r9TXN+1B1/ROOFYjZfX/FL+Pyd8V+OWz4uHOMvn+XUimbWctattU3Yq8t7aNuSz9dEvcHc2gdzjM//a0nuIlC0sCAcLPSrbDyor89AqZc8xPH24TnG8jcWMC9qpxyU4VdC+QqNP13jGRVRo9PPg+FQUEv8zC0MFaqV6lBVO502giERfwGJdC0SjJ50LOta+T6A1nIHLTmfeGk2PGtNlCGbPa643lYQnx1SxANqWmhNOnE+sCTQa58a/IDKG2i5FFuuRtyhgg2Aw4+C8gsO1R0BF08tJU7LiMkgNi8+IVM1nU3BWPWVtJMSQTqFUiKjdFxUzGOqDZnVeoNMvPb0/52FV1X0c93Ulw5khkbNwi7GuQdm6OLMKi/96CDEV/xlWIz6M1zx2vPsoulZ1oKEBs019At2Ge1f2pm/idJEvIX9v7IdReH75E6RWtjl4lz/H9BWu8Pczk23AaHN6z9Mh1eG1AzzLfoB48sN/EL4fi/mOv68BW96Hyl1AkadZDiBLDhVttYaMGMF4zoYL8phdZIbGfgm1fwPNzBxoBZj9+zdLpDGa7MnCo2hH0E6ZftMCr5ecQztBenQ/g4f0yirkgyFnUzKnBXCyzgzpV+yeLBcweJesUOWF/CMt7IwQD0v0gNwK+VH7ywcv1Dmpj9spkhJNabCCzX29YfhyRvP+yxkDPpwNnLMz9819OyO4fLekhzJSZ+pV3O22+eWSC8RuX9byw2NgnMj6eFjf0OiAirQ5nYoiHlGUp32z0a/F3HHHbeI/ljGdtRpkUUcAAAAASUVORK5CYII=";

// Total countdown is 10 minutes (600s); approval takes about 5 minutes (300s)
const TOTAL_WAITING_SECONDS = 600;
const APPROVAL_WAIT_SECONDS = 300;

const Deposit: React.FC<DepositModalProps> = ({
  onClose,
  onDepositSuccess,
  defaultAmount,
  companyId,
}) => {
  // 5-second initial loading state before modal content reveals
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { user } = useUser();
  const effectiveCompanyId =
    companyId ||
    (user as unknown as { company_id?: string | number; company?: { id?: string | number } })?.company_id ||
    (user as unknown as { company?: { id?: string | number } })?.company?.id ||
    user?.id;

  // Start with 'amount' view unless defaultAmount is provided
  const [view, setView] = useState<ModalView>(
    defaultAmount && defaultAmount > 0 ? "transfer_details" : "amount"
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("transfer");
  const [amount, setAmount] = useState<number>(defaultAmount || 0);
  const [customAmountStr, setCustomAmountStr] = useState<string>(
    defaultAmount && defaultAmount > 0 ? defaultAmount.toString() : ""
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const inputId = useId();

  // Expiry countdown for transfer details (starts at 29:19 = 1759 seconds)
  const [expirySeconds, setExpirySeconds] = useState(1759);

  // Countdown timer for waiting screen (starts at 10:00 = 600 seconds)
  const [waitingSeconds, setWaitingSeconds] = useState(TOTAL_WAITING_SECONDS);

  // Simulation verification state in waiting screen
  const [isReceived, setIsReceived] = useState(false);
  const [reference, setReference] = useState("");
  const [depositId, setDepositId] = useState<number | string | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState<number | null>(null);

  const { data: activeAccount, isLoading: loadingAccount } = useAccount();

  const accountNumber = activeAccount?.account_number || "";
  const bankName = activeAccount?.bank_name || "";
  const accountName = activeAccount?.account_name || "";
  const userEmail = user?.email;

  // Trigger 5-second initial loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const randomRef = `PF-DEP-${Math.floor(100000 + Math.random() * 900000)}`;
    setReference(randomRef);
  }, []);

  // Expiry timer for transfer details
  useEffect(() => {
    if (view !== "transfer_details") return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  // Function to check payment status from backend
  const checkPaymentStatus = async (isManual = false) => {
    if (isCheckingStatus || isReceived) return;
    setIsCheckingStatus(true);

    try {
      let isApproved = false;

      // 1. Check by depositId (/each-company-deposit/{id})
      if (depositId) {
        try {
          const eachRes = await getEachCompanyDeposit(depositId);
          const rawStatus = String(
            eachRes?.status ||
            eachRes?.transaction?.status ||
            (eachRes as Record<string, any>)?.data?.status ||
            ""
          ).toLowerCase();

          if (
            rawStatus === "successful" ||
            rawStatus === "approved" ||
            rawStatus === "completed" ||
            rawStatus === "success" ||
            rawStatus === "1"
          ) {
            isApproved = true;
          }
        } catch {
          // fallback to list check
        }
      }

      // 2. Check by company deposits list (/company-deposit)
      if (!isApproved && (effectiveCompanyId || reference)) {
        try {
          const list = await getCompanyDeposits(effectiveCompanyId);
          const matching = list.find(
            (d) =>
              (reference &&
                (d.reference === reference ||
                  d.reference_no === reference ||
                  d.transaction_reference === reference ||
                  d.ref === reference)) ||
              (depositId && String(d.id) === String(depositId))
          );

          if (matching) {
            const rawStatus = String(
              matching.status || matching.transaction?.status || ""
            ).toLowerCase();

            if (
              rawStatus === "successful" ||
              rawStatus === "approved" ||
              rawStatus === "completed" ||
              rawStatus === "success" ||
              rawStatus === "1"
            ) {
              isApproved = true;
            }
          }
        } catch {
          // ignore error
        }
      }

      if (isApproved) {
        setIsReceived(true);

        setTimeout(() => {
          setView("success");
          const approvedDeposit: DemoDeposit = {
            id: Number(depositId) || Date.now(),
            reference,
            amount: checkoutAmount || amount,
            method: activeAccount?.bank_name ? `Bank Transfer (${activeAccount?.bank_name})` : "Bank Transfer",
            status: "successful",
            date: new Date().toISOString(),
          };
          onDepositSuccess?.(approvedDeposit);
          toast.success("Deposit approved by Finance team! Wallet credited successfully.");
        }, 1000);
      } else {
        if (isManual) {
          const elapsedSeconds = TOTAL_WAITING_SECONDS - waitingSeconds;
          const remainingForApproval = Math.max(0, APPROVAL_WAIT_SECONDS - elapsedSeconds);
          toast.info(
            `Transaction is under review by Finance team (Pending). Estimated approval in ${formatTime(
              remainingForApproval
            )}.`
          );
        }
      }
    } catch {
      if (isManual) {
        toast.info("Transaction is under review by Finance team (Pending).");
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Waiting screen countdown and automated status polling
  useEffect(() => {
    if (view !== "waiting_confirmation" || isReceived) return;

    // 1-second countdown timer from 600 down to 0
    const interval = setInterval(() => {
      setWaitingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Periodically poll payment status every 6 seconds
    const statusPollInterval = setInterval(() => {
      checkPaymentStatus(false);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearInterval(statusPollInterval);
    };
  }, [view, isReceived, depositId, reference, effectiveCompanyId]);

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
    if (view === "waiting_confirmation" || view === "success") {
      return;
    }
    setSelectedMethod(method);
    setIsMobileSidebarOpen(false);
    if (method === "transfer" || method === "bank") {
      if (view === "amount" && amount >= 100) setView("transfer_details");
    }
  };

  const handleProceedToDetails = async () => {
    const parsed = parseFloat(customAmountStr.replace(/,/g, ""));
    if (isNaN(parsed) || parsed < 100) {
      toast.error("Please enter a valid deposit amount (min ₦100)");
      return;
    }
    setAmount(parsed);

    // If effectiveCompanyId is present, register funding and capture checkout_amount & reference
    if (effectiveCompanyId) {
      setIsSubmitting(true);
      try {
        const res = await companyFunding({
          company_id: effectiveCompanyId,
          amount: parsed,
        });
        const dataObj = res?.data || (typeof res === "object" ? res : {});
        const ref =
          dataObj?.reference ||
          res?.reference ||
          res?.reference_no ||
          res?.transaction_reference ||
          res?.ref;
        const depId = dataObj?.id || res?.id;
        const chkAmt =
          res?.checkout_amount ??
          dataObj?.checkout_amount ??
          res?.amount ??
          dataObj?.amount ??
          parsed;

        if (ref) setReference(String(ref));
        if (depId) setDepositId(depId);
        if (chkAmt) setCheckoutAmount(Number(chkAmt));
      } catch (error) {
        console.warn(
          "Backend funding notification error (proceeding in simulation mode):",
          getErrorMessage(error)
        );
      } finally {
        setIsSubmitting(false);
      }
    }

    setView("transfer_details");
    setExpirySeconds(1759);
  };

  const handleSentMoney = () => {
    setView("waiting_confirmation");
    setWaitingSeconds(TOTAL_WAITING_SECONDS);
    setIsReceived(false);

    // Immediately record the pending deposit
    const pendingDeposit: DemoDeposit = {
      id: Number(depositId) || Date.now(),
      reference,
      amount: checkoutAmount || amount,
      method: activeAccount?.bank_name ? `Bank Transfer (${activeAccount?.bank_name})` : "Bank Transfer",
      status: "pending",
      date: new Date().toISOString(),
    };
    onDepositSuccess?.(pendingDeposit);
    toast.info("Deposit logged with status: PENDING. Awaiting Finance verification.");

    // Trigger initial status verification
    setTimeout(() => {
      checkPaymentStatus(false);
    }, 1500);
  };

  const handleCheckStatus = () => {
    checkPaymentStatus(true);
  };

  const displayAmount =
    view === "transfer_details" || view === "waiting_confirmation" || view === "success"
      ? (checkoutAmount && checkoutAmount > 0 ? checkoutAmount : amount)
      : amount;

  const formattedAmountText = displayAmount > 0 ? `NGN ${displayAmount.toLocaleString()}` : "NGN 0";
  const isLockedView = view === "waiting_confirmation" || view === "success";

  // Calculate elapsed progress for 5-minute approval window
  const elapsedSeconds = TOTAL_WAITING_SECONDS - waitingSeconds;
  const progressPercent = isReceived
    ? 100
    : Math.min(92, 10 + Math.floor((elapsedSeconds / APPROVAL_WAIT_SECONDS) * 82));

  const paymentChannels: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    {
      id: "card",
      label: "Card",
      icon: <LuCreditCard size={16} className="text-gray-500" />,
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: (
        <div className="bg-primary text-white p-1 rounded">
          <BsArrowLeftRight size={11} />
        </div>
      ),
    },
    {
      id: "bank",
      label: "Bank",
      icon: <LuBuilding size={16} className="text-gray-500" />,
    },
    {
      id: "ussd",
      label: "USSD",
      icon: <HiHashtag size={16} className="text-gray-500" />,
    },
    {
      id: "opay",
      label: "OPay",
      icon: <img src={opayLogoBase64} alt="OPay" className="w-4 h-4 object-contain" />,
    },
  ];

  const renderNavButtons = () => (
    <nav className="flex flex-col space-y-1.5">
      {paymentChannels.map((item) => {
        const isSelected = selectedMethod === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={isLockedView}
            onClick={() => handleMethodSelect(item.id)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition group ${isLockedView ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              } ${isSelected
                ? "bg-white text-primary shadow-xs font-bold ring-1 ring-black/5"
                : "text-gray-700 hover:bg-gray-200/60"
              }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className={isSelected ? "text-primary font-bold" : "text-gray-700"}>
                {item.label}
              </span>
            </div>
            {isSelected && <span className="w-1.5 h-4 bg-primary rounded-full" />}
          </button>
        );
      })}
    </nav>
  );

  return (
    <Modal customMode onClose={onClose}>
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-2xl mx-auto">
        <div className="relative w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-h-[500px] flex">
          <AnimatePresence mode="wait">
            {/* 5-SECOND INITIAL LOADING SCREEN */}
            {isInitialLoading ? (
              <motion.div
                key="initial-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative bg-white"
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  type="button"
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer p-1"
                  title="Close modal"
                >
                  <LuX size={18} />
                </button>

                <LuLoader size={16} className="animate-spin text-primary" />
              </motion.div>
            ) : (
              /* MAIN MODAL CONTENT AFTER 5-SEC LOADING */
              <motion.div
                key="main-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full flex"
              >
                {/* DESKTOP PERMANENT SIDEBAR */}
                <div className="hidden md:flex w-52 bg-[#F9FAFB] border-r border-gray-200/80 p-5 flex-col justify-between shrink-0">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-4">
                      PAY WITH
                    </p>
                    {renderNavButtons()}
                  </div>

                </div>

                {/* MOBILE SLIDE-IN OVERLAY DRAWER & BACKDROP */}
                <AnimatePresence>
                  {isMobileSidebarOpen && (
                    <>
                      {/* Overlay backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="md:hidden absolute inset-0 bg-black/40 backdrop-blur-[2px] z-30"
                      />

                      {/* Sliding Drawer on top of Main */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 280 }}
                        className="md:hidden absolute inset-y-0 left-0 z-40 w-64 max-w-[82%] bg-[#F9FAFB] border-r border-gray-200 shadow-2xl p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                              PAY WITH
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsMobileSidebarOpen(false)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition cursor-pointer"
                              title="Hide channels"
                            >
                              <LuChevronLeft size={20} />
                            </button>
                          </div>
                          {renderNavButtons()}
                        </div>


                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* MOBILE PEEK TAB (Visible on left when drawer is closed) */}
                {!isMobileSidebarOpen && !isLockedView && (
                  <div className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20">
                    <button
                      type="button"
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="flex flex-col items-center gap-2 py-3 px-1.5 bg-white/95 border-y border-r border-gray-200/90 rounded-r-xl shadow-md hover:shadow-lg text-gray-700 hover:text-primary transition-all duration-200 active:scale-95 group cursor-pointer"
                      title="Change payment method"
                    >
                      <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {selectedMethod === "card" && <LuCreditCard size={13} />}
                        {selectedMethod === "transfer" && <BsArrowLeftRight size={13} />}
                        {selectedMethod === "bank" && <LuBuilding size={13} />}
                        {selectedMethod === "ussd" && <RiSmartphoneLine size={13} />}
                        {selectedMethod === "opay" && (
                          <img src={opayLogoBase64} alt="OPay" className="w-3.5 h-3.5 object-contain" />
                        )}
                      </div>
                      <span className="[writing-mode:vertical-rl] text-[9px] font-bold tracking-widest uppercase text-gray-400 group-hover:text-primary transition-colors">
                        Channels
                      </span>
                      <LuChevronRight
                        size={13}
                        className="text-gray-400 group-hover:text-primary transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 p-5 sm:p-7 md:p-8 flex flex-col justify-between relative bg-white min-w-0">
                  {/* Top Close Button */}
                  <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 z-10"
                    title="Close modal"
                  >
                    <LuX size={18} />
                  </button>

                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={assets.favicon || assets.logo}
                        alt="Merchant Logo"
                        className="w-8 h-8 rounded object-contain"
                      />

                      {/* Mobile Quick Method Selector Button */}
                      {!isLockedView && (
                        <button
                          type="button"
                          onClick={() => setIsMobileSidebarOpen(true)}
                          className="md:hidden flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200/80 rounded text-[11px] font-bold text-primary transition cursor-pointer"
                          title="Switch payment channel"
                        >
                          <span className="capitalize">{selectedMethod}</span>
                          <LuChevronRight size={11} className="text-gray-400" />
                        </button>
                      )}
                    </div>

                    <div className="text-right pr-6">
                      <p
                        className="text-xs text-gray-500 truncate max-w-[130px] sm:max-w-[200px]"
                        title={userEmail}
                      >
                        {userEmail}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-gray-600">Pay</span>
                        {amount > 0 ? (
                          view === "transfer_details" ? (
                            <button
                              type="button"
                              onClick={() => setView("amount")}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer"
                              title="Click to edit amount"
                            >
                              {formattedAmountText}
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {formattedAmountText}
                            </span>
                          )
                        ) : (
                          <span className="text-xs font-bold text-gray-400">--</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Views Container */}
                  <div className="py-3 my-auto">
                    <AnimatePresence mode="wait">
                      {/* VIEW 1: AMOUNT INPUT */}
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
                                name="amount"
                                min={100}
                                max={1000000}
                                value={customAmountStr}
                                onChange={(e) => {
                                  const inputValue = String(e.target.value);
                                  setCustomAmountStr(inputValue);
                                  const val = parseFloat(inputValue);
                                  if (!isNaN(val)) setAmount(val);
                                  if (val > 1000000) {
                                    toast.error("Maximum deposit amount is ₦1,000,000");
                                    setTimeout(() => {
                                      setCustomAmountStr("1000000");
                                      setAmount(1000000);
                                    }, 100);
                                  }
                                }}
                                placeholder="500,000"
                                className="w-full h-11 sm:h-12 pl-8 pr-3 text-base sm:text-lg font-bold text-gray-800 bg-[#F9FAFB] border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* Quick amount chips */}
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Quick Select</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[50000, 100000, 250000, 500000, 700000, 1000000].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => {
                                    setAmount(amt);
                                    setCustomAmountStr(amt.toString());
                                  }}
                                  className={`py-1.5 px-2 md:text-xs text-[10px] font-semibold rounded border transition cursor-pointer text-center ${customAmountStr === amt.toString()
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
                              onClick={handleProceedToDetails}
                              disabled={isSubmitting || !customAmountStr || parseFloat(customAmountStr) < 100}
                              className="w-full h-11 bg-primary disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg hover:bg-[#234d47] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                              {isSubmitting ? (
                                <>
                                  <LuLoader size={14} className="animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <span>
                                    {customAmountStr && parseFloat(customAmountStr) >= 100
                                      ? `Proceed with NGN ${parseFloat(customAmountStr).toLocaleString()}`
                                      : "Enter an amount to continue"}
                                  </span>
                                  <LuArrowRight size={14} />
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 2: TRANSFER DETAILS */}
                      {view === "transfer_details" && (
                        <motion.div
                          key="transfer-view"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-4"
                        >
                          <h3 className="text-sm font-bold text-gray-800 text-center">
                            Transfer {formattedAmountText} {accountName ? `to ${accountName.toUpperCase()}` : ""}
                          </h3>

                          {/* Transfer Details Card */}
                          {loadingAccount ? (
                            <div className="p-8 text-center text-xs text-primary animate-pulse bg-tertiary rounded-lg border border-primary/10">
                              Loading settlement account details (/get-account)...
                            </div>
                          ) : (
                            <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-3.5 border border-gray-100">
                              {/* Bank Name */}
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  BANK NAME
                                </p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                  {bankName || "Settlement Bank"}
                                </p>
                              </div>

                              {/* Account Number */}
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
                                      onClick={() => handleCopy(displayAmount.toString(), "Amount")}
                                      className="text-gray-400 hover:text-gray-700 transition cursor-pointer p-1"
                                      title="Copy Amount"
                                    >
                                      {copiedField === "Amount" ? (
                                        <LuCheck size={14} className="text-primary" />
                                      ) : (
                                        <LuCopy size={14} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                            </div>
                          )}

                          {/* Dashed line */}
                          <div className="border-b border-dashed border-gray-200" />

                          {/* Instruction text */}
                          <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                            Search for {bankName || "the settlement bank"} in your bank app. This account is for this transaction only and expires in{" "}
                            <span className="text-primary font-bold">{formatTime(expirySeconds)}</span>
                          </p>

                          {/* Action Button */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleSentMoney}
                              className="w-full py-3 px-4 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer text-center shadow-2xs"
                            >
                              I've sent the money
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 3: WAITING TO CONFIRM TRANSFER (5-MIN REVIEW STATUS) */}
                      {view === "waiting_confirmation" && (
                        <motion.div
                          key="waiting-view"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          className="py-2 flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className="space-y-1">

                            <h3 className="text-sm font-bold text-gray-800">
                              Reconciling Transfer with Finance Team
                            </h3>
                            <p className="text-xs text-gray-500 max-w-sm">
                              Your transfer notification has been submitted. Review and approval typically takes ~5 minutes.
                            </p>
                          </div>

                          {/* Progress Stepper with Animated Bar */}
                          <div className="w-full max-w-sm px-2">
                            <div className="flex items-center justify-between relative">
                              {/* Sent Step */}
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                  <LuCheck size={15} className="stroke-[3]" />
                                </div>
                                <span className="text-[11px] font-bold text-primary">
                                  Sent
                                </span>
                              </div>

                              {/* Progress Bar Line */}
                              <div className="flex-1 mx-3 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                                <motion.div
                                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>

                              {/* Received / Approved Step */}
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${isReceived
                                      ? "bg-primary text-white shadow-xs"
                                      : "bg-amber-50 border-2 border-dashed border-amber-300 text-amber-600"
                                    }`}
                                >
                                  {isReceived ? (
                                    <LuCheck size={15} className="stroke-[3]" />
                                  ) : (
                                    <LuLoader size={13} className="animate-spin text-amber-600" />
                                  )}
                                </div>
                                <span
                                  className={`text-[11px] font-medium transition-colors ${isReceived ? "text-primary font-bold" : "text-amber-700 font-semibold"
                                    }`}
                                >
                                  {isReceived ? "Approved" : "Verifying"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Countdown box */}
                          <div className="w-full max-w-sm py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs text-gray-600 shadow-2xs">
                            <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <LuClock size={13} className="text-primary" />
                              <span>Session timer:</span>
                            </span>
                            <span className="font-mono font-bold text-gray-800">{formatTime(waitingSeconds)}</span>
                          </div>

                          {/* Action & Exit options */}
                          <div className="w-full max-w-sm space-y-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCheckStatus}
                              className="w-full py-2.5 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#234d47] transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <LuLoader size={13} className="animate-spin" />
                              <span>Check Approval Status</span>
                            </button>

                            <button
                              type="button"
                              onClick={onClose}
                              className="w-full py-2 px-3 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition cursor-pointer"
                            >
                              Close & Track in Transactions
                            </button>
                          </div>

                          {/* Return link */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setView("transfer_details")}
                              className="text-xs text-gray-400 hover:text-gray-700 hover:underline transition cursor-pointer"
                            >
                              Back to transfer account details
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 4: SUCCESS CONFIRMATION (WHEN APPROVED BY FINANCE) */}
                      {view === "success" && (
                        <motion.div
                          key="success-view"
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          className="py-4 flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className="w-14 h-14 rounded-full bg-green-100 text-primary flex items-center justify-center shadow-inner">
                            <LuCheck size={28} className="stroke-[3]" />
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-gray-900">
                              Deposit Approved & Credited!
                            </h3>
                            <p className="text-xs text-gray-500">
                              Your deposit of <strong className="text-primary">{formattedAmountText}</strong> has been confirmed by Finance and credited to your wallet.
                            </p>
                          </div>

                          <div className="w-full bg-[#F8F9FA] rounded-lg p-3 text-xs text-left space-y-1.5 border border-gray-100">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Reference:</span>
                              <span className="font-mono font-semibold text-gray-800">{reference}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Channel:</span>
                              <span className="font-medium text-gray-800">
                                Bank Transfer {bankName ? `(${bankName})` : ""}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status:</span>
                              <span className="text-primary font-bold">SUCCESSFUL</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#234d47] transition cursor-pointer shadow-sm"
                          >
                            Done & Return to Dashboard
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Secured By Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-secondary font-medium">
          <LuLock size={12} className="text-primary" />
          <span>Secured by</span>
          <span className="font-bold text-primary tracking-tight text-base">payfleet</span>
        </div>
      </div>
    </Modal>
  );
};

export default Deposit;