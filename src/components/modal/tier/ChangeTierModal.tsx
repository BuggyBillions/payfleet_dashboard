import React, { useState } from "react";
import Modal from "../Modal";
import ActionButton from "../../ui/ActionButton";
import { useUpdateCompanyTier, useAllTiers } from "../../../hooks/useTier";
import type { CompanyProps } from "../../../lib/interfaces";
import { LuShieldAlert, LuCheck } from "react-icons/lu";

interface ChangeTierModalProps {
  company: CompanyProps;
  onClose: () => void;
}

const ChangeTierModal: React.FC<ChangeTierModalProps> = ({ company, onClose }) => {
  const { data: dynamicTiers = [], isLoading: loadingTiers } = useAllTiers();
  const [selectedTier, setSelectedTier] = useState<number | string>(() => {
    if (typeof company.tier === "object" && company.tier !== null) {
      return (company.tier as { id?: number | string }).id || 1;
    }
    return (company.tier as number | string) || 1;
  });
  const [notes, setNotes] = useState<string>("");

  const updateMutation = useUpdateCompanyTier();

  const handleUpdate = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
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
      <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-xs">
            <LuShieldAlert className="text-base" />
            <span>Admin Tier Management</span>
          </div>
          <h2 className="text-lg font-bold text-textBlack mt-1">
            Modify Tier for {compName}
          </h2>
          <p className="text-xs text-textBlack/60">
            Reassign subscription tier and employee capacity for this corporate client.
          </p>
        </div>

        {/* Current status pill */}
        <div className="p-3 rounded-xl bg-secondary border border-primary/10 flex items-center justify-between text-xs">
          <span className="text-textBlack/70">Current Assigned Tier:</span>
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
            {typeof company.tier === "object" && company.tier !== null
              ? (company.tier as { name?: string }).name || "Active Tier"
              : `Tier #${company.tier || "1"}`}
          </span>
        </div>

        {/* Tier Plans List */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-textBlack">
              Select Target Tier
            </label>
            {loadingTiers ? (
              <div className="py-4 text-center text-xs text-textBlack/50 animate-pulse">
                Loading platform tiers...
              </div>
            ) : dynamicTiers.length === 0 ? (
              <div className="p-4 rounded-xl bg-secondary border border-primary/10 text-xs text-textBlack/70 text-center">
                No platform tiers found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {dynamicTiers.map((plan) => {
                  const planId = Number(plan.id);
                  const isSelected = Number(selectedTier) === planId;
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
                            {plan.name} (Level {plan.level})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
                            {String(plan.no_of_staff).toLowerCase() === "unlimited"
                              ? "Unlimited Staff"
                              : `Max ${plan.no_of_staff} Staff`}
                          </span>
                        </div>
                        {isSelected && (
                          <LuCheck className="text-primary text-base shrink-0" />
                        )}
                      </div>
                      {plan.requirements && (
                        <p className="text-[11px] text-textBlack/60 mt-1">
                          Requirements: {plan.requirements}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
              placeholder="e.g. Approved manual tier adjustment based on verified documents..."
              className="w-full p-2.5 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40 resize-none"
            />
          </div>

          {/* Action buttons */}
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
              text="Save & Reassign Tier"
              loadingText="Updating Tier..."
              loading={updateMutation.isPending}
              action={handleUpdate}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ChangeTierModal;
