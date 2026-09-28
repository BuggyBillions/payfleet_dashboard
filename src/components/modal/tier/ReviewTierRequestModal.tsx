import React, { useState } from "react";
import Modal from "../Modal";
import ActionButton from "../../ui/ActionButton";
import { getTierConfig } from "../../../services/tierService";
import { useReviewTierRequest } from "../../../hooks/useTier";
import type { CompanyDetailsProps, TierUpgradeRequest } from "../../../lib/interfaces";
import { formatPrettyDate } from "../../../helpers/formatterUtility";
import { CompanyLogoAvatar } from "../../ui/CompanyLogoAvatar";
import { getCompanyLogoUrl } from "../../../helpers/logoHelper";
import {
  LuFileText,
  LuCheck,
  LuX,
  LuExternalLink,
} from "react-icons/lu";

interface ReviewTierRequestModalProps {
  request: TierUpgradeRequest;
  onClose: () => void;
}

const ReviewTierRequestModal: React.FC<ReviewTierRequestModalProps> = ({ request, onClose }) => {
  const currentPlan = getTierConfig(request.current_tier || request.currentTier);
  const requestedPlan = getTierConfig(request.requested_tier || request.requestedTier);

  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const reviewMutation = useReviewTierRequest();

  const handleApprove = () => {
    reviewMutation.mutate(
      {
        requestId: request.id,
        status: "approve",
        targetTier: requestedPlan.id,
        companyId: request.company_id || request.companyId,
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
        status: "reject",
        rejectionReason,
        companyId: request.company_id || request.companyId,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  const company = (request.company || {}) as CompanyDetailsProps;
  const companyName = company.name || request.companyName || "Company";
  const companyEmail = company.email || request.companyEmail || "N/A";
  const companyPhone = company.phone || request.companyPhone || request.directorPhone || "N/A";
  const companyAddress = company.address;
  const bvn = company.bvn || request.bvn;
  const nin = company.nin || request.nin;
  // Documents attached on company or request
  const cacUrl = getCompanyLogoUrl(company.cac || request.cac);
  const mermatUrl = getCompanyLogoUrl(company.mermat || request.mermat);
  const statusReportUrl = getCompanyLogoUrl(company.status_report || request.status_report);
  const rawDirectDoc = request.documentUrl || (typeof request.document_url === "string" ? request.document_url : undefined);
  const directDocUrl = getCompanyLogoUrl(rawDirectDoc);

  const documentsList = [
    { name: "CAC Certificate / Document", url: cacUrl, key: "cac" },
    { name: "MERMAT (Memorandum of Association)", url: mermatUrl, key: "mermat" },
    { name: "Status Report Document", url: statusReportUrl, key: "status_report" },
    { name: request.documentName || "Attached Compliance Document", url: directDocUrl, key: "direct" },
  ].filter((doc) => Boolean(doc.url));

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
        <div className="flex items-center gap-3">
          <CompanyLogoAvatar
            name={companyName}
            logo={company.logo || request.companyLogo}
            className="w-11 h-11 rounded-xl"
            textClassName="text-sm font-bold"
          />
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              Tier Application Review
            </span>
            <h2 className="text-base font-bold text-textBlack">
              {companyName}
            </h2>
            <p className="text-xs text-textBlack/60">
              Submitted on {formatPrettyDate(String(request.created_at))}
            </p>
          </div>
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
            {bvn && (
              <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
                <span className="text-textBlack/50 text-[10px] flex items-center gap-1">
                   BVN
                </span>
                <span className="font-semibold text-textBlack font-mono">
                  {bvn}
                </span>
              </div>
            )}
            {nin && (
              <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
                <span className="text-textBlack/50 text-[10px] flex items-center gap-1">
                   NIN
                </span>
                <span className="font-semibold text-textBlack font-mono">
                  {nin}
                </span>
              </div>
            )}
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
              <span className="text-textBlack/50 text-[10px] flex items-center gap-1">
                 Official Email
              </span>
              <span className="font-semibold text-textBlack truncate block">
                {companyEmail}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10">
              <span className="text-textBlack/50 text-[10px] block flex items-center gap-1">
                Contact Phone
              </span>
              <span className="font-semibold text-textBlack">
                {companyPhone}
              </span>
            </div>
          </div>

          {companyAddress && (
            <div className="p-2.5 rounded-lg bg-secondary border border-primary/10 text-xs flex items-center gap-2">
              <div>
                <span className="text-textBlack/50 text-[10px] block">Corporate Address</span>
                <span className="font-medium text-textBlack">{companyAddress}</span>
              </div>
            </div>
          )}

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
                Tier Compliance Requirements Checklist
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

          {/* Attached Documents List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-textBlack/70 uppercase tracking-wider flex items-center gap-1.5">
              Uploaded Compliance Proof & Documents ({documentsList.length})
            </span>

            {documentsList.length > 0 ? (
              <div className="space-y-2">
                {documentsList.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-secondary border border-primary/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <LuFileText size={18} />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-textBlack block truncate">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-textBlack/50">
                          Uploaded compliance file
                        </span>
                      </div>
                    </div>
                    <a
                      href={doc.url!}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1 hover:bg-primary/90 transition shadow-xs shrink-0 ml-2"
                    >
                      <span>View</span>
                      <LuExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-secondary border border-primary/10 text-xs text-textBlack/50 text-center">
                No uploaded document files found for this application.
              </div>
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
            <ActionButton
              text={`Reject`}
              loadingText="Rejecting..."
              icon={<LuX className="text-sm" />}
              loading={reviewMutation.isPending}
              action={() => setActionType("reject")}
              buttonStyle="flex items-center gap-1 p-3 text-xs font-semibold text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
              overideBg={true}
            />
            <ActionButton
              text={`${requestedPlan.badge}`}
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
