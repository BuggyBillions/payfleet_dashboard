import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import ActionButton from "../../ui/ActionButton";
import { useCreateTier, useUpdateTier } from "../../../hooks/useTier";
import type { TierItem, TierFormData } from "../../../lib/interfaces";
import { LuShieldCheck, LuUsers, LuFileText, LuLayers } from "react-icons/lu";
import { toast } from "sonner";

interface CreateEditTierModalProps {
  tier?: TierItem | null;
  onClose: () => void;
}

const CreateEditTierModal: React.FC<CreateEditTierModalProps> = ({ tier, onClose }) => {
  const isEdit = Boolean(tier?.id);

  const [name, setName] = useState(tier?.name || "");
  const [level, setLevel] = useState<number>(tier?.level ?? 1);
  const [noOfStaff, setNoOfStaff] = useState<string>(
    tier?.no_of_staff ? String(tier.no_of_staff) : "10"
  );
  const [requirements, setRequirements] = useState<string>(
    tier?.requirements || "CAC,MERMAT,Address"
  );

  useEffect(() => {
    if (tier) {
      setName(tier.name || "");
      setLevel(Number(tier.level || 1));
      setNoOfStaff(tier.no_of_staff ? String(tier.no_of_staff) : "10");
      setRequirements(tier.requirements || "");
    }
  }, [tier]);

  const createMutation = useCreateTier();
  const updateMutation = useUpdateTier();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a tier name.");
      return;
    }

    if (!noOfStaff.trim()) {
      toast.error("Please specify the employee / staff limit.");
      return;
    }

    const payload: TierFormData = {
      name: name.trim(),
      level: Number(level),
      no_of_staff: noOfStaff.trim(),
      requirements: requirements.trim(),
    };

    if (isEdit && tier?.id) {
      updateMutation.mutate(
        { id: tier.id, data: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
        <div>
          <h2 className="text-lg font-bold text-textBlack mt-1">
            {isEdit ? `Edit Tier: ${tier?.name}` : "Create Subscription Tier"}
          </h2>
          <p className="text-xs text-textBlack/60">
            Define subscription rules, staff limits, and KYC document requirements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Tier Name & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-textBlack mb-1">
                Tier Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Starter, Business, Enterprise"
                  className="w-full h-10 px-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-textBlack mb-1">
                Tier Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LuLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40 cursor-pointer"
                >
                  <option value={1}>Level 1 (Starter)</option>
                  <option value={2}>Level 2 (Business)</option>
                  <option value={3}>Level 3 (Enterprise)</option>
                  <option value={4}>Level 4 (Custom/VIP)</option>
                  <option value={5}>Level 5 (Partner)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Number of Staff */}
          <div>
            <label className="block text-xs font-medium text-textBlack mb-1">
              Number of Staff / Employee Capacity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LuUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
              <input
                type="text"
                required
                value={noOfStaff}
                onChange={(e) => setNoOfStaff(e.target.value)}
                placeholder='e.g. "10", "50", or "Unlimited"'
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40"
              />
            </div>
            <p className="text-[10px] text-textBlack/50 mt-1">
              Specify the maximum employee enrollment limit allowed for companies on this tier.
            </p>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-medium text-textBlack mb-1">
              KYC & Compliance Requirements <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LuFileText className="absolute left-3 top-3 text-textBlack/40 text-sm" />
              <textarea
                rows={3}
                required
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. CAC,MERMAT,Address,Director ID,Utility Bill"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none focus:border-primary/40 resize-none font-mono"
              />
            </div>
            <p className="text-[10px] text-textBlack/50 mt-1">
              Separate requirement tags with commas (e.g. <span className="font-mono text-primary font-medium">CAC,MERMAT,Address</span>).
            </p>
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
              text={isEdit ? "Update Tier" : "Create Tier"}
              loadingText={isEdit ? "Updating..." : "Creating..."}
              loading={isPending}
              action={() => {}}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateEditTierModal;
