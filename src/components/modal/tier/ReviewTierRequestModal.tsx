import React, { useState } from "react";
import Modal from "../Modal";
import ActionButton from "../../ui/ActionButton";
import { getTierConfig } from "../../../services/tierService";
import { useReviewTierRequest } from "../../../hooks/useTier";
import type { TierUpgradeRequest } from "../../../lib/interfaces";
import { formatPrettyDate } from "../../../helpers/formatterUtility";
import { LuFileText, LuCheck, LuX, LuBuilding2, LuPhone, LuMail } from "react-icons/lu";

interface ReviewTierRequestModalProps {
  request: TierUpgradeRequest;
  onClose: () => void;
}

const ReviewTierRequestModal: React.FC<ReviewTierRequestModalProps> = ({ request, onClose }) => {
  const currentPlan = getTierConfig(request.currentTier);
  const requestedPlan = getTierConfig(request.requestedTier);

  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const reviewMutation = useReviewTierRequest();

  const handleApprove = () => {
    reviewMutation.mutate(
      {
        requestId: request.id,
        status: "approved",
        targetTier: requestedPlan.id,
        companyId: request.companyId,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }
    reviewMutation.mutate(
      {
        requestId: request.id,
        status: "rejected",
        rejectionReason,
        companyId: request.companyId,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
        <div>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            Tier Application Review
          </span>
          <h2 className="text-lg font-bold text-textBlack mt-0.5">
            {request.companyName}
          </h2>
          <p className="text-xs text-textBlack/60">
            Submitted on {formatPrettyDate(request.createdAt)}
          </p>
        </div>

        {/* Tier Upgrade Summary Box */}
        <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-textBlack/50 uppercase font-semibold">Current Tier</span>
            <p className="text-xs font-semibold text-textBlack mt-0.5">
              {currentPlan.name} ({currentPlan.badge})
            </p>
          </div>
          <div className="text-primary font-bold text-sm">→</div>
          <div className="text-right">
            <span className="text-[10px] text-textBlack/50 uppercase font-semibold">Requested Tier</span>
            <p className="text-xs font-semibold text-primary mt-0.5">
              {requestedPlan.name} ({requestedPlan.badge})
            </p>
          </div>
        </div>

        {/* Verification Details Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-textBlack uppercase tracking-wider">
            Corporate Verification Data
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
              <span className="text-textBlack/50 text-[10px] block">CAC RC Number</span>
              <span className="font-semibold text-textBlack font-mono">
                {request.rcNumber || "Not Provided"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
              <span className="text-textBlack/50 text-[10px] block">Tax ID (TIN)</span>
              <span className="font-semibold text-textBlack font-mono">
                {request.tinNumber || "Not Provided"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
              <span className="text-textBlack/50 text-[10px] block flex items-center gap-1">
                <LuBuilding2 className="text-primary" /> Director Name
              </span>
              <span className="font-semibold text-textBlack">
                {request.directorName || "N/A"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
              <span className="text-textBlack/50 text-[10px] block flex items-center gap-1">
                <LuPhone className="text-primary" /> Director Phone
              </span>
              <span className="font-semibold text-textBlack">
                {request.directorPhone || "N/A"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-secondary border border-primary/10 text-xs">
            <span className="text-textBlack/50 text-[10px] block flex items-center gap-1">
              <LuMail className="text-primary" /> Official Email
            </span>
            <span className="font-semibold text-textBlack">
              {request.companyEmail || "N/A"}
            </span>
          </div>

          {request.reason && (
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10 text-xs">
              <span className="text-textBlack/50 text-[10px] block">Business Justification / Notes</span>
              <p className="text-textBlack/80 mt-1 italic">
                "{request.reason}"
              </p>
            </div>
          )}

          {/* Tier Required Documents Checklist */}
          {requestedPlan.requirements && (
            <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-2">
              <span className="text-[11px] font-semibold text-textBlack/70 uppercase tracking-wider flex items-center gap-1.5">
                <LuFileText className="text-primary text-xs" /> Tier Compliance Requirements Checklist
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {requestedPlan.requirements.split(",").map((req, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-tertiary border border-primary/10 text-xs font-medium text-textBlack"
                  >
                    {req.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attached Document */}
          <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <LuFileText size={18} />
              </div>
              <div>
                <span className="font-semibold text-textBlack block">
                  {request.documentName || "Uploaded CAC & Verification Proof.pdf"}
                </span>
                <span className="text-[10px] text-textBlack/50">
                  Uploaded document attached by company
                </span>
              </div>
            </div>
            {request.documentUrl ? (
              <a
                href={request.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1 hover:bg-primary/90 transition shadow-xs"
              >
                <span>View Document</span>
              </a>
            ) : (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                Document Attached
              </span>
            )}
          </div>
        </div>

        {/* Action Decision Form */}
        {actionType === "reject" ? (
          <div className="space-y-3 pt-2 border-t border-primary/10">
            <label className="block text-xs font-medium text-textBlack">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete RC registration document or mismatched company TIN..."
              className="w-full p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-secondary text-xs text-textBlack outline-none focus:border-red-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="px-3 py-1.5 text-xs text-textBlack/70 hover:text-textBlack"
              >
                Back
              </button>
              <button
                type="button"
                disabled={reviewMutation.isPending || !rejectionReason.trim()}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
              >
                {reviewMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
            <button
              type="button"
              onClick={() => setActionType("reject")}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
            >
              <LuX className="text-sm" /> Reject Application
            </button>
            <ActionButton
              text={`Approve ${requestedPlan.badge} Upgrade`}
              loadingText="Approving..."
              icon={<LuCheck className="text-sm" />}
              loading={reviewMutation.isPending}
              action={handleApprove}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReviewTierRequestModal;
