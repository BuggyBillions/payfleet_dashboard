import React, { useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";
import { LuBell, LuCheck, LuLoader } from "react-icons/lu";
import {
  isNotificationRead,
  type NotificationItem,
} from "../../services/notificationService";
import { getErrorMessage } from "../../helpers/api";

interface NotificationModalProps {
  notification: NotificationItem;
  onClose: () => void;
  onMarkRead?: (id: number | string) => Promise<void> | void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
  onMarkRead,
}) => {
  const [marking, setMarking] = useState(false);

  const read = isNotificationRead(notification);
  const title =
    notification.title ??
    notification.subject ??
    notification.type ??
    "Notification";
  const body =
    notification.message ??
    notification.body ??
    notification.text ??
    notification.description ??
    "";

  const meta = notification.type ?? "System notification";

  const time = (() => {
    const dateStr =
      notification.created_at ?? notification.date ?? notification.read_at;
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  const handleMarkRead = async () => {
    if (!notification.id || read) return;
    setMarking(true);
    try {
      await onMarkRead?.(notification.id);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to mark as read"));
    } finally {
      setMarking(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <LuBell size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-textBlack">{title}</h2>
            <p className="text-xs text-textBlack/60 capitalize">{meta}</p>
          </div>
        </div>

        <div className="bg-secondary border border-primary/10 rounded-lg p-4">
          {body ? (
            <p className="text-sm text-textBlack/80 leading-relaxed">{body}</p>
          ) : (
            <p className="text-sm text-textBlack/50">No additional details.</p>
          )}
        </div>

        {time && (
          <p className="text-xs text-textBlack/50 -mt-2">{time}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 border-t border-black/5 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="bg-secondary text-xs rounded-md font-medium border border-black/10 w-full sm:w-40 h-11 cursor-pointer"
          >
            Close
          </button>
          {!read && onMarkRead && notification.id && (
            <button
              type="button"
              onClick={handleMarkRead}
              disabled={marking}
              className="action-btn text-white text-xs rounded-md font-medium w-full sm:w-40 h-11 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {marking ? (
                <LuLoader size={14} className="animate-spin" />
              ) : (
                <LuCheck size={14} />
              )}
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;