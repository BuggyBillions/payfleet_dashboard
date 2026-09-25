import React, { useState } from "react";
import Modal from "../Modal";
import ActionButton from "../../ui/ActionButton";
import { TIER_PLANS, getTierConfig } from "../../../services/tierService";
import { useUpdateCompanyTier, useAllTiers } from "../../../hooks/useTier";
import type { CompanyProps } from "../../../lib/interfaces";
import { LuShieldAlert, LuCheck } from "react-icons/lu";

interface ChangeTierModalProps {
  company: CompanyProps;
  onClose: () => void;
}

const ChangeTierModal: React.FC<ChangeTierModalProps> = ({ company, onClose }) => {
  const currentTierConfig = getTierConfig(company.tier);
  const [selectedTier, setSelectedTier] = useState<number>(currentTierConfig.id);
  const [notes, setNotes] = useState<string>("");

  const { data: dynamicTiers = [] } = useAllTiers();
  const updateMutation = useUpdateCompanyTier();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.id) return;

    updateMutation.mutate(
      {
        companyId: company.id,
        tier: selectedTier,
        notes,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const compName = company.name || company.companyName || "Selected Company";

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-xs">
            <LuShieldAlert className="text-base" />
            <span>SuperAdmin Tier Management</span>
          </div>
          <h2 className="text-lg font-bold text-textBlack mt-1">
            Modify Tier for {compName}
          </h2>
          <p className="text-xs text-textBlack/60">
            Adjust limits, capabilities, and subscription tier for this corporate client.
          </p>
        </div>

        {/* Current status pill */}
        <div className="p-3 rounded-xl bg-secondary border border-primary/10 flex items-center justify-between text-xs">
          <span className="text-textBlack/70">Current Tier Status:</span>
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
            {currentTierConfig.name} ({currentTierConfig.badge})
          </span>
        </div>

        {/* Tier Plans List */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-textBlack">
              Select New Tier Level
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {(dynamicTiers.length > 0 ? dynamicTiers : TIER_PLANS).map((plan) => {
                const planId = Number(plan.id);
                const isSelected = selectedTier === planId;
                const levelNum = "level" in plan && plan.level ? plan.level : planId;
                const staffLimit =
                  "no_of_staff" in plan && plan.no_of_staff
                    ? plan.no_of_staff
                    : "maxEmployees" in plan
                    ? plan.maxEmployees
                    : "10";
                return (
                  <div
                    key={planId}
                    onClick={() => setSelectedTier(planId)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-primary/10 hover:border-primary/30 bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-textBlack">
                          {plan.name} (Level {levelNum})
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
                          {String(staffLimit).toLowerCase() === "unlimited"
                            ? "Unlimited Staff"
                            : `Max ${staffLimit} Staff`}
                        </span>
                      </div>
                      {isSelected && (
                        <LuCheck className="text-primary text-base shrink-0" />
                      )}
                    </div>
                    {"requirements" in plan && plan.requirements && (
                      <p className="text-[11px] text-textBlack/60 mt-1">
                        Requires: {plan.requirements}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-medium text-textBlack mb-1">
              Admin Override Notes / Reason
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified corporate registration CAC status report manually..."
              className="w-full p-2.5 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition"
            >
              Cancel
            </button>
            <ActionButton
              text="Save & Update Tier"
              loadingText="Updating Tier..."
              loading={updateMutation.isPending}
              action={() => {}}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ChangeTierModal;
