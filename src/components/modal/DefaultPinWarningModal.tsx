import React from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import {
  LuShieldAlert,
  LuArrowRight,
  LuTriangleAlert,
  LuCheck,
} from "react-icons/lu";
import { setPinInfo } from "../../helpers/pinStorage";

interface DefaultPinWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DefaultPinWarningModal: React.FC<DefaultPinWarningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToSettings = () => {
    onClose();
    navigate("/dashboard/settings?tab=pin", {
      state: { tab: "pin" },
    });
  };

  const handleMarkAsUpdated = () => {
    setPinInfo(true);
    onClose();
  };

  return (
    <Modal onClose={onClose} showClose={true}>
      <div className="flex flex-col gap-5 text-textBlack">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <LuShieldAlert size={26} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2"></div>
            <h3 className="text-lg font-bold text-textBlack mt-0.5">
              Change Your Default Transaction PIN
            </h3>
          </div>
        </div>

        {/* Warning Callout Box */}
        <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <LuTriangleAlert
              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              size={17}
            />
            <p className="text-xs leading-relaxed text-textBlack/80">
              Your Payfleet company account was generated with a default
              transaction PIN of{" "}
              <span className="font-bold tracking-widest px-1.5 py-0.5 bg-amber-500/20 rounded text-amber-900 dark:text-amber-200">
                1234
              </span>
              . Anyone with access to this dashboard could execute salary
              disbursements using this default code.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-primary/10">
          <button
            type="button"
            onClick={handleMarkAsUpdated}
            className="text-xs text-textBlack/50 hover:text-textBlack flex items-center gap-1.5 transition cursor-pointer py-2 px-1"
            title="Mark PIN as already customized"
          >
            <LuCheck size={14} className="text-emerald-500" />
            <span>Already changed PIN</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-10 rounded-xl border border-textBlack/15 text-textBlack/70 hover:bg-secondary text-xs font-semibold transition cursor-pointer"
            >
              Remind Me Later
            </button>
            <button
              type="button"
              onClick={handleGoToSettings}
              className="w-full sm:w-auto px-5 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Change PIN Now</span>
              <LuArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DefaultPinWarningModal;
