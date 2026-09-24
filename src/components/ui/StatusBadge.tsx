import React from "react";
import { formatUnderScores } from "../../helpers/formatterUtility";

export interface StatusBadgeProps {
  status?: string;
  type?: string;
  text?: string;
  className?: string;
  withDot?: boolean;
}

export const getStatusConfig = (statusStr: string) => {
  const s = statusStr.toLowerCase().replace(/\s+/g, "_");

  // Green / Successful / Approved / Active / Verified
  if (["successful", "success", "approved", "active", "verified"].includes(s)) {
    return {
      bg: "bg-green-500/10 dark:bg-green-500/15",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-500/20 dark:border-green-500/30",
      dot: "bg-green-500",
      label: s === "active" ? "Active" : s === "verified" ? "Verified" : s === "approved" ? "Approved" : "Successful",
    };
  }

  // Amber / Pending / Processing / Under Review
  if (["pending", "pending_verification", "under_review", "processing"].includes(s)) {
    return {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20 dark:border-amber-500/30",
      dot: "bg-amber-500 animate-pulse",
      label: s === "pending_verification" ? "Pending Verification" : s === "under_review" ? "Under Review" : s === "processing" ? "Processing" : "Pending",
    };
  }

  // Red / Failed / Declined / Inactive / Cancelled / Action Required
  if (["failed", "declined", "inactive", "action_required", "cancelled"].includes(s)) {
    return {
      bg: "bg-red-500/10 dark:bg-red-500/15",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-500/20 dark:border-red-500/30",
      dot: "bg-red-500",
      label: s === "action_required" ? "Action Required" : s === "declined" ? "Declined" : s === "inactive" ? "Inactive" : s === "cancelled" ? "Cancelled" : "Failed",
    };
  }

  // Default / Neutral
  return {
    bg: "bg-gray-500/10 dark:bg-gray-500/15",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-500/20 dark:border-gray-500/30",
    dot: "bg-gray-400",
    label: formatUnderScores(statusStr, true),
  };
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  text,
  className = "",
  withDot = true,
}) => {
  const rawStatus = (status || type || "pending").toString();
  const config = getStatusConfig(rawStatus);
  const displayText = text || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium tracking-tight ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      )}
      <span>{displayText}</span>
    </span>
  );
};

export default StatusBadge;
