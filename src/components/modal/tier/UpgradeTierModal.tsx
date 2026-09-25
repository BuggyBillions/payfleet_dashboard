import React, { useState } from "react";
import Modal from "../Modal";
import ActionButton from "../../ui/ActionButton";
import { useRequestTierUpgrade, useAllTiers } from "../../../hooks/useTier";
import { useUser } from "../../../hooks/useUser";
import { LuShieldCheck, LuUpload, LuCheck, LuLayers } from "react-icons/lu";
import { toast } from "sonner";
import type { TierItem } from "../../../lib/interfaces";

interface UpgradeTierModalProps {
  onClose: () => void;
  defaultTier?: number | string;
}

const UpgradeTierModal: React.FC<UpgradeTierModalProps> = ({ onClose, defaultTier }) => {
  const { user } = useUser();
  const { data: allTiers = [], isLoading: loadingTiers } = useAllTiers();

  const rawTier = user?.company_details?.tier ?? user?.tier;
  const currentTier = allTiers.find((t) => {
    if (typeof rawTier === "object" && rawTier !== null) {
      return String(t.id) === String((rawTier as { id?: number | string }).id);
    }
    return (
      String(t.id) === String(rawTier) ||
      String(t.level) === String(rawTier) ||
      String(t.name).toLowerCase() === String(rawTier).toLowerCase()
    );
  });

  const currentLevel = Number(currentTier?.level ?? currentTier?.id ?? 1) || 1;

  // Higher tiers available for upgrade
  const upgradeableTiers = allTiers.filter(
    (t) => Number(t.level ?? t.id) > currentLevel
  );

  const initialSelectedId = defaultTier
    ? Number(defaultTier)
    : upgradeableTiers.length > 0
    ? Number(upgradeableTiers[0].id)
    : undefined;

  const [selectedTierId, setSelectedTierId] = useState<number | undefined>(initialSelectedId);
  const [rcNumber, setRcNumber] = useState<string>("");
  const [tinNumber, setTinNumber] = useState<string>("");
  const [directorName, setDirectorName] = useState<string>(
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
  );
  const [directorPhone, setDirectorPhone] = useState<string>(
    typeof user?.phone === "string" ? user.phone : ""
  );
  const [reason, setReason] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const upgradeMutation = useRequestTierUpgrade();

  const targetPlan: Partial<TierItem> | undefined =
    allTiers.find((p) => Number(p.id) === selectedTierId) || upgradeableTiers[0];

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!selectedTierId) {
      toast.error("Please select a target tier for upgrade.");
      return;
    }

    if (!rcNumber.trim()) {
      toast.error("Please provide your CAC RC Number for verification.");
      return;
    }

    upgradeMutation.mutate(
      {
        company_id: user?.company_details?.id || user?.id,
        company_name:
          user?.company_details?.name ||
          user?.company_name ||
          user?.name ||
          "Company",
        company_email: user?.company_details?.email || user?.email || "",
        current_tier: currentTier?.id ?? currentLevel,
        requested_tier: selectedTierId,
        rc_number: rcNumber,
        tin_number: tinNumber,
        director_name: directorName,
        director_phone: directorPhone,
        reason,
        document: file,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-xs">
            <LuShieldCheck className="text-base" />
            <span>Tier Upgrade Application</span>
          </div>
          <h2 className="text-xl font-bold text-textBlack mt-1">
            {targetPlan ? `Upgrade Account to ${targetPlan.name}` : "Upgrade Account Tier"}
          </h2>
          <p className="text-xs text-textBlack/60">
            Submit your corporate verification documents to unlock higher payroll limits and employee capacity.
          </p>
        </div>

        {/* Tier Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-textBlack">
            Select Target Upgrade Tier
          </label>
          {loadingTiers ? (
            <div className="py-4 text-center text-xs text-textBlack/50 animate-pulse">
              Loading platform tiers...
            </div>
          ) : upgradeableTiers.length === 0 ? (
            <div className="p-4 rounded-xl bg-secondary border border-primary/10 text-xs text-textBlack/70 text-center">
              Your account is currently on the highest tier level available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upgradeableTiers.map((plan) => {
                const isSelected = selectedTierId === Number(plan.id);
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedTierId(Number(plan.id))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-primary/10 hover:border-primary/30 bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-textBlack">
                        {plan.name} (Level {plan.level})
                      </span>
                      {isSelected && <LuCheck className="text-primary text-sm shrink-0" />}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-textBlack/70">
                      <LuLayers size={13} className="text-primary" />
                      <span>
                        Capacity:{" "}
                        <strong className="text-textBlack">
                          {String(plan.no_of_staff).toLowerCase() === "unlimited"
                            ? "Unlimited Staff"
                            : `Max ${plan.no_of_staff} Staff`}
                        </strong>
                      </span>
                    </div>
                    {plan.requirements && (
                      <p className="text-[10px] text-textBlack/50 mt-1 line-clamp-1">
                        Requires: {plan.requirements}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Upgrade Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-textBlack mb-1">
                CAC RC Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                placeholder="e.g. RC-129485"
                className="w-full h-10 px-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-textBlack mb-1">
                Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                placeholder="e.g. TIN-94029102"
                className="w-full h-10 px-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-textBlack mb-1">
                Authorized Director Name
              </label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="Director Full Name"
                className="w-full h-10 px-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-textBlack mb-1">
                Director Phone Number
              </label>
              <input
                type="tel"
                value={directorPhone}
                onChange={(e) => setDirectorPhone(e.target.value)}
                placeholder="080XXXXXXXX"
                className="w-full h-10 px-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-xs font-medium text-textBlack mb-1">
              Upload Verification Document (CAC Certificate / Utility Bill / Director ID)
            </label>
            <div className="border-2 border-dashed border-primary/20 hover:border-primary/40 rounded-xl p-4 text-center bg-secondary transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <LuUpload className="mx-auto text-2xl text-primary mb-1" />
              {file ? (
                <p className="text-xs font-semibold text-primary">{file.name}</p>
              ) : (
                <>
                  <p className="text-xs font-medium text-textBlack">
                    Click or drag file to upload document
                  </p>
                  <p className="text-[10px] text-textBlack/50 mt-0.5">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Business Justification */}
          <div>
            <label className="block text-xs font-medium text-textBlack mb-1">
              Upgrade Justification / Additional Notes
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for requiring higher tier limits..."
              className="w-full p-2.5 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition cursor-pointer"
            >
              Cancel
            </button>
            <ActionButton
              type="submit"
              text="Submit Upgrade Application"
              loadingText="Submitting Application..."
              loading={upgradeMutation.isPending}
              action={handleSubmit}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpgradeTierModal;
