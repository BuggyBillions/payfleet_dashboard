import React from "react";
import Modal from "../Modal";
import { useTierById } from "../../../hooks/useTier";
import type { TierItem } from "../../../lib/interfaces";
import {
  LuShieldCheck,
  LuUsers,
  LuFileText,
  LuLayers,
  LuPencil,
  LuCalendar,
  LuHash,
} from "react-icons/lu";
import { formatPrettyDate } from "../../../helpers/formatterUtility";

interface ViewTierDetailsModalProps {
  tierId: number | string;
  onClose: () => void;
  onEdit?: (tier: TierItem) => void;
}

const ViewTierDetailsModal: React.FC<ViewTierDetailsModalProps> = ({
  tierId,
  onClose,
  onEdit,
}) => {
  const { data: tier, isLoading, error } = useTierById(tierId);

  const reqTags = String(tier?.requirements || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    <Modal onClose={onClose}>
      <div className="space-y-5 max-h-[85vh] overflow-y-auto pr-1">
        <div className="flex items-center justify-between pb-3 border-b border-primary/10">
          <div>
            <div className="flex items-center gap-2 text-primary font-medium text-xs">
              <LuShieldCheck className="text-base" />
              <span>Subscription Tier Details</span>
            </div>
            <h2 className="text-lg font-bold text-textBlack mt-1">
              {isLoading ? "Loading Tier..." : tier?.name || `Tier #${tierId}`}
            </h2>
          </div>
          {tier && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary font-mono">
              Level {tier.level}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-textBlack/60 animate-pulse">
            Fetching tier details from server...
          </div>
        ) : error || !tier ? (
          <div className="py-8 text-center text-xs text-red-500">
            Failed to load tier details. Please try again.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <LuHash size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-textBlack/50 uppercase tracking-wider font-semibold">
                    Tier ID
                  </span>
                  <span className="text-xs font-bold text-textBlack font-mono">
                    #{tier.id}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <LuLayers size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-textBlack/50 uppercase tracking-wider font-semibold">
                    Hierarchy Level
                  </span>
                  <span className="text-xs font-bold text-textBlack">
                    Level {tier.level}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <LuUsers size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-textBlack/50 uppercase tracking-wider font-semibold">
                    Employee / Staff Limit
                  </span>
                  <span className="text-xs font-bold text-textBlack">
                    {String(tier.no_of_staff).toLowerCase() === "unlimited"
                      ? "Unlimited Employees"
                      : `Max ${tier.no_of_staff} Employees`}
                  </span>
                </div>
              </div>

              {tier.created_at && (
                <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <LuCalendar size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-textBlack/50 uppercase tracking-wider font-semibold">
                      Date Created
                    </span>
                    <span className="text-xs font-medium text-textBlack">
                      {formatPrettyDate(tier.created_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* KYC Requirements */}
            <div className="p-4 rounded-xl bg-secondary border border-primary/10 space-y-2">
              <span className="text-[11px] font-semibold text-textBlack/70 flex items-center gap-1.5 uppercase tracking-wider">
                <LuFileText className="text-primary text-sm" /> Compliance & Verification Requirements
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {reqTags.length > 0 ? (
                  reqTags.map((req, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-tertiary border border-primary/10 text-xs font-medium text-textBlack"
                    >
                      {req}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-textBlack/50">
                    No specific KYC document requirements configured.
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-textBlack/70 hover:text-textBlack bg-secondary rounded-lg border border-primary/10 transition cursor-pointer"
              >
                Close
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(tier);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition cursor-pointer"
                >
                  <LuPencil size={13} />
                  <span>Edit Tier</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewTierDetailsModal;
