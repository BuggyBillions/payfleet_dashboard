import React, { useState } from "react";
import Modal from "../Modal";
import ActionButton from "../../ui/ActionButton";
import { TIER_PLANS, getTierConfig } from "../../../services/tierService";
import { useRequestTierUpgrade } from "../../../hooks/useTier";
import { useUser } from "../../../hooks/useUser";
import { LuShieldCheck, LuUpload, LuCheck } from "react-icons/lu";
import { toast } from "sonner";

interface UpgradeTierModalProps {
  onClose: () => void;
  defaultTier?: number;
}

const UpgradeTierModal: React.FC<UpgradeTierModalProps> = ({ onClose, defaultTier = 2 }) => {
  const { user } = useUser();
  const currentTierId = getTierConfig(user?.company_details?.tier ?? user?.tier).id;

  const [selectedTier, setSelectedTier] = useState<number>(
    defaultTier > currentTierId ? defaultTier : Math.min(3, currentTierId + 1)
  );
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
  const targetPlan = TIER_PLANS.find((p) => p.id === selectedTier) || TIER_PLANS[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTier <= currentTierId) {
      toast.error(`Please select a higher tier than your current Tier ${currentTierId}.`);
      return;
    }

    if (!rcNumber.trim() && selectedTier >= 2) {
      toast.error("Please provide your CAC RC Number for verification.");
      return;
    }

    upgradeMutation.mutate(
      {
        company_id: user?.company_details?.id || user?.id,
        company_name: user?.company_details?.name || user?.company_name || user?.name || "Company",
        company_email: user?.company_details?.email || user?.email || "",
        current_tier: currentTierId,
        requested_tier: selectedTier,
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
            Upgrade Account to {targetPlan.name} ({targetPlan.badge})
          </h2>
          <p className="text-xs text-textBlack/60">
            Submit your corporate verification documents to unlock higher payroll limits and automated capabilities.
          </p>
        </div>

        {/* Tier Selector */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {TIER_PLANS.filter((p) => p.id > 1).map((plan) => {
            const isSelected = selectedTier === plan.id;
            const isCurrent = currentTierId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                disabled={isCurrent}
                onClick={() => setSelectedTier(plan.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : isCurrent
                    ? "border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed bg-secondary"
                    : "border-primary/10 hover:border-primary/30 bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-textBlack">
                    {plan.name} ({plan.badge})
                  </span>
                  {isSelected && <LuCheck className="text-primary text-sm shrink-0" />}
                </div>
                <p className="text-[11px] text-textBlack/60 mt-1 line-clamp-2">
                  {plan.description}
                </p>
                <div className="mt-2 text-[10px] font-semibold text-primary">
                  Max: {plan.maxEmployees === "Unlimited" ? "Unlimited Staff" : `${plan.maxEmployees} Staff`}
                </div>
              </button>
            );
          })}
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
              Upload Verification Document (CAC Certificate / Utility Bill / ID)
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
                    Click or drag file to upload
                  </p>
                  <p className="text-[10px] text-textBlack/50 mt-0.5">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-medium text-textBlack mb-1">
              Reason for Upgrade (Optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Onboarding 25 new team members this quarter..."
              className="w-full p-2.5 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition"
            >
              Cancel
            </button>
            <ActionButton
              text={`Submit Upgrade to ${targetPlan.badge}`}
              loadingText="Submitting..."
              loading={upgradeMutation.isPending}
              action={() => {}}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpgradeTierModal;
