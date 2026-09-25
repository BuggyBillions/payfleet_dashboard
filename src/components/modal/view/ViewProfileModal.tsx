import React from "react";
import Modal from "../Modal";
import type { ViewProfileModalProps } from "../../../lib/interfaces";
import StatusBadge from "../../ui/StatusBadge";
import { FiMail, FiPhone, FiCalendar, FiShield, FiMessageSquare, FiCopy } from "react-icons/fi";
import { formatShortDate } from "../../../helpers/formatterUtility";
import { toast } from "sonner";

const ViewProfileModal: React.FC<ViewProfileModalProps> = ({
  conversation,
  onClose,
}) => {
  if (!conversation) return null;

  const getInitials = (name?: string) => {
    if (!name) return "PF";
    const parts = name.replace("#", "").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const displayName = conversation.name || "User";
  const displayEmail = conversation.email || "";
  const displayPhone = conversation.phoneNumber || conversation.phone || "";
  const displayRole = conversation.role || "";
  const isOnline = Boolean(conversation.online);
  const totalMessages = conversation.messages?.length || 0;
  const lastActive = conversation.lastMessageTime || "";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-textBlack">Member Profile</h2>
            <p className="text-xs text-textBlack/60">
              User communication and verified contact details
            </p>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-2xl border border-primary/10">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 border border-primary/20 flex items-center justify-center font-bold text-xl shadow-xs">
              {getInitials(displayName)}
            </div>
            {isOnline ? (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131217] shadow-xs" title="Online now" />
            ) : (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gray-400 border-2 border-white dark:border-[#131217]" title="Offline" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="text-base font-bold text-textBlack truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                {displayRole}
              </span>
              <StatusBadge status={isOnline ? "Active" : "Inactive"} />
            </div>
            <p className="text-[11px] text-textBlack/50">
              {isOnline ? "Active in chat now" : `Last message: ${lastActive}`}
            </p>
          </div>
        </div>

        {/* Contact & Administrative Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Email Address */}
          <div className="bg-secondary/40 p-3 rounded-xl border border-primary/10 flex flex-col justify-between group">
            <div className="flex items-center justify-between text-textBlack/60 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <FiMail className="text-primary text-sm" />
                <span>Official Email</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(displayEmail, "Email")}
                className="opacity-0 group-hover:opacity-100 hover:text-primary transition cursor-pointer p-0.5"
                title="Copy Email"
              >
                <FiCopy size={12} />
              </button>
            </div>
            <p className="text-xs font-semibold text-textBlack truncate mt-1">
              {displayEmail || "Not provided"}
            </p>
          </div>

          {/* Phone Number */}
          <div className="bg-secondary/40 p-3 rounded-xl border border-primary/10 flex flex-col justify-between group">
            <div className="flex items-center justify-between text-textBlack/60 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <FiPhone className="text-primary text-sm" />
                <span>Phone Number</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(displayPhone, "Phone Number")}
                className="opacity-0 group-hover:opacity-100 hover:text-primary transition cursor-pointer p-0.5"
                title="Copy Phone"
              >
                <FiCopy size={12} />
              </button>
            </div>
            <p className="text-xs font-semibold text-textBlack truncate mt-1">
              {displayPhone || "Not provided"}
            </p>
          </div>

          {/* Role & Access */}
          <div className="bg-secondary/40 p-3 rounded-xl border border-primary/10">
            <div className="flex items-center gap-1.5 text-textBlack/60 text-xs font-medium">
              <FiShield className="text-primary text-sm" />
              <span>Assigned Department</span>
            </div>
            <p className="text-xs font-semibold text-textBlack mt-1 capitalize">
              {conversation.department || displayRole}
            </p>
          </div>

          {/* Message Stats */}
          <div className="bg-secondary/40 p-3 rounded-xl border border-primary/10">
            <div className="flex items-center gap-1.5 text-textBlack/60 text-xs font-medium">
              <FiMessageSquare className="text-primary text-sm" />
              <span>Total Messages</span>
            </div>
            <p className="text-xs font-semibold text-textBlack mt-1">
              {totalMessages} message{totalMessages === 1 ? "" : "s"} exchanged
            </p>
          </div>
        </div>

        {/* Member Since / Security Note */}
        <div className="p-3 bg-secondary/30 rounded-xl border border-primary/10 flex items-center justify-between text-xs text-textBlack/60">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-primary text-sm" />
            <span>Registration Status</span>
          </div>
          <span className="font-semibold text-textBlack">
            {conversation.created_at ? formatShortDate(conversation.created_at) : "Verified User"}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-primary/10 bg-secondary hover:bg-primary/10 text-textBlack transition cursor-pointer"
          >
            Close Profile
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              toast.info(`Chat with ${displayName} is active`);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition shadow-sm cursor-pointer"
          >
            Continue Chatting
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewProfileModal;
