import React from "react";
import Modal from "../Modal";
import type { ViewStaffModalProps } from "../../../lib/interfaces";
import { useStaffById } from "../../../hooks/useStaff";
import StatusBadge from "../../ui/StatusBadge";
import { FiMail, FiPhone, FiCalendar, FiShield, FiUser } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa6";

const ViewStaffModal: React.FC<ViewStaffModalProps> = ({
  staff,
  onClose,
}) => {
  const staffId = staff?.id;
  const { data: fullStaff, isLoading } = useStaffById(staffId, Boolean(staffId));

  const displayStaff = fullStaff || staff;

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const displayName =
    displayStaff?.name ||
    (displayStaff?.first_name
      ? `${displayStaff.first_name} ${displayStaff.last_name || ""}`.trim()
      : displayStaff?.full_name || displayStaff?.username || "Staff Member");

  const displayEmail = displayStaff?.email || "N/A";
  const displayPhone = displayStaff?.phoneNumber || displayStaff?.phone || "N/A";
  const displayRole = displayStaff?.role || "Staff";

  const statusStr =
    typeof displayStaff?.status === "boolean"
      ? displayStaff.status
        ? "Active"
        : "Inactive"
      : displayStaff?.status !== undefined && displayStaff?.status !== null
      ? String(displayStaff.status)
      : displayStaff?.is_active ?? displayStaff?.enabled
      ? "Active"
      : "Inactive";

  return (
    <Modal onClose={onClose}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-textBlack">Staff Details</h2>
            <p className="text-xs text-textBlack/60">
              Complete profile and administrative information
            </p>
          </div>
          {isLoading && (
            <FaSpinner className="animate-spin text-primary text-sm" />
          )}
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 bg-secondary p-4 rounded-xl border border-primary/10">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xl shrink-0">
            {getInitials(displayName)}
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-base font-semibold text-textBlack truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {displayRole}
              </span>
              <StatusBadge status={statusStr} />
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10 space-y-1">
            <div className="flex items-center gap-2 text-textBlack/60 text-xs font-medium">
              <FiMail className="text-primary text-sm" />
              <span>Email Address</span>
            </div>
            <p className="text-sm font-medium text-textBlack truncate">
              {displayEmail}
            </p>
          </div>

          <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10 space-y-1">
            <div className="flex items-center gap-2 text-textBlack/60 text-xs font-medium">
              <FiPhone className="text-primary text-sm" />
              <span>Phone Number</span>
            </div>
            <p className="text-sm font-medium text-textBlack">
              {displayPhone}
            </p>
          </div>

          <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10 space-y-1">
            <div className="flex items-center gap-2 text-textBlack/60 text-xs font-medium">
              <FiShield className="text-primary text-sm" />
              <span>System Role</span>
            </div>
            <p className="text-sm font-medium text-textBlack capitalize">
              {displayRole}
            </p>
          </div>

          <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10 space-y-1">
            <div className="flex items-center gap-2 text-textBlack/60 text-xs font-medium">
              <FiCalendar className="text-primary text-sm" />
              <span>Date Registered</span>
            </div>
            <p className="text-sm font-medium text-textBlack">
              {displayStaff?.created_at
                ? new Date(displayStaff.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </div>

          {displayStaff?.id && (
            <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10 space-y-1 sm:col-span-2">
              <div className="flex items-center gap-2 text-textBlack/60 text-xs font-medium">
                <FiUser className="text-primary text-sm" />
                <span>Account ID</span>
              </div>
              <p className="text-xs font-mono text-textBlack/80">
                #{displayStaff.id}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg border border-primary/10 bg-secondary hover:bg-primary/10 text-textBlack font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewStaffModal;
