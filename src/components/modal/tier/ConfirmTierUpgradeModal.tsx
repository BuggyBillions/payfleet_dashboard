import React from "react";
import Modal from "../Modal";
import type { Tier } from "../../../services/tierService";
import { getTierRequirements } from "../../../services/tierService";
import {
  LuCrown,
  LuUsersRound,
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuFileText,
  LuLoader,
  LuInfo,
} from "react-icons/lu";

export interface ConfirmTierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onGoToProfile?: () => void;
  targetTier: Tier;
  currentTier: Tier | null;
  currentLevel: number | string | null;
  missingRequirements?: string[];
  isLoading?: boolean;
}

const humanize = (value: string): string =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getTierName = (t: Partial<Tier>): string => String(t.name ?? "Tier");
const getTierLevel = (t: Partial<Tier>): string => String(t.level ?? "—");
const getTierStaff = (t: Partial<Tier>): string => String(t.no_of_staff ?? "—");

const ConfirmTierUpgradeModal: React.FC<ConfirmTierUpgradeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onGoToProfile,
  targetTier,
  currentTier,
  currentLevel,
  missingRequirements = [],
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const targetName = getTierName(targetTier);
  const targetLevel = getTierLevel(targetTier);
  const targetStaff = getTierStaff(targetTier);

  const currentName = currentTier
    ? getTierName(currentTier)
    : currentLevel !== null
      ? `Level ${currentLevel}`
      : "Basic Plan";
  const currentStaff = currentTier ? getTierStaff(currentTier) : "—";
  const currentLevelDisplay =
    currentLevel !== null ? String(currentLevel) : "1";

  const allRequirements = getTierRequirements(targetTier);
  const hasMissing = missingRequirements.length > 0;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4 w-full max-h-[85vh] overflow-y-auto styled-scrollbar pr-1">
        <div className="flex items-center gap-3 border-b border-primary/10 pb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <LuCrown size={22} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-textBlack">
              Review Tier Upgrade
            </h3>
            <p className="text-xs text-textBlack/60">
              Review plan changes and requirements before requesting upgrade
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
          <div className="p-3.5 rounded-xl border border-primary/10 bg-secondary/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-textBlack/50">
                Current Plan
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-textBlack/60 font-semibold border border-primary/10">
                Active
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-textBlack capitalize">
                {currentName}
              </h4>
              <p className="text-xs text-textBlack/60">
                Level {currentLevelDisplay}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-textBlack/70 pt-1 border-t border-primary/5">
              <LuUsersRound size={13} className="text-textBlack/50 shrink-0" />
              <span>
                <strong>{currentStaff} Staff</strong>
              </span>
            </div>
          </div>

          {/* Target Tier Box */}
          <div className="p-3.5 rounded-xl border-2 border-primary/30 bg-primary/5 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                Upgrading To
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-textBlack capitalize">
                {targetName}
              </h4>
              <p className="text-xs text-primary font-semibold">
                Level {targetLevel}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-textBlack/80 pt-1 border-t border-primary/10">
              <LuUsersRound size={13} className="text-primary shrink-0" />
              <span>
                {" "}
                <strong className="text-primary">{targetStaff} Staff</strong>
              </span>
            </div>
          </div>
        </div>

        {/* <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-secondary/70 p-3 rounded-lg border border-primary/10 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <LuLayers size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-textBlack/60 font-medium">
                New Tier Level
              </span>
              <span className="text-xs font-bold text-textBlack">
                Level {targetLevel}
              </span>
            </div>
          </div>

          <div className="bg-secondary/70 p-3 rounded-lg border border-primary/10 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <LuUsersRound size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-textBlack/60 font-medium">
                Max Staff Limit
              </span>
              <span className="text-xs font-bold text-primary">
                {targetStaff} Staff
              </span>
            </div>
          </div>
        </div> */}

        {/* Requirements & Compliance Checklist */}
        <div className="bg-secondary/50 rounded-xl p-3.5 border border-primary/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-textBlack flex items-center gap-1.5">
              <LuFileText size={14} className="text-primary" />
              Tier Requirements
            </span>
            <span className="text-[10px] text-textBlack/50">
              {allRequirements.length}{" "}
              {allRequirements.length === 1 ? "Requirement" : "Requirements"}
            </span>
          </div>

          {allRequirements.length === 0 ? (
            <p className="text-xs text-textBlack/60 italic">
              No special documentation requirements for this tier.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 pt-1">
              {allRequirements.map((req, idx) => {
                const isMissing = missingRequirements.some(
                  (m) =>
                    m.toLowerCase().includes(req.toLowerCase()) ||
                    req.toLowerCase().includes(m.toLowerCase()),
                );

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-primary/10 text-xs"
                  >
                    <span className="font-medium text-textBlack">
                      {humanize(req)}
                    </span>
                    {isMissing ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <LuCircleAlert size={12} />
                        Missing on Profile
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <LuCheck size={12} />
                        Verified
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Alert Banner */}
        {hasMissing ? (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs flex items-start gap-2.5">
            <LuCircleAlert
              size={18}
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <div className="flex flex-col gap-1 text-[11px] text-amber-900">
              <span className="font-bold text-amber-800">
                Action Required Before Upgrading
              </span>
              <p className="leading-relaxed">
                Before upgrading to <strong>{targetName}</strong>, please upload
                the following documents on your company profile:{" "}
                <strong>{missingRequirements.map(humanize).join(", ")}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs flex items-start gap-2.5">
            <LuCircleCheck
              size={18}
              className="text-emerald-600 shrink-0 mt-0.5"
            />
            <div className="flex flex-col gap-0.5 text-[11px] text-emerald-900">
              <span className="font-bold text-emerald-800">
                All Requirements Satisfied
              </span>
              <p className="leading-relaxed">
                Your profile meets all the documentation criteria for{" "}
                {targetName}. Once requested, our compliance team will review
                and approve your upgrade.
              </p>
            </div>
          </div>
        )}

        {/* Informative Note */}
        <p className="text-[11px] text-textBlack/50 flex items-center gap-1.5">
          <LuInfo className="text-primary shrink-0" size={14} />
          Your request will be submitted to the Payfleet review team and appear
          under "My Tier Requests".
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 h-10 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>

          {hasMissing ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToProfile?.();
              }}
              className="px-5 h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <LuFileText size={14} />
              Go to Profile to Upload Documents
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LuLoader size={14} className="animate-spin" />
                  <span>Submitting Upgrade...</span>
                </>
              ) : (
                <>
                  <LuCrown size={14} />
                  <span>Confirm & Request Upgrade</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmTierUpgradeModal;
