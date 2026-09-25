import React from "react";
import Modal from "./Modal";
import type { NotificationItem } from "../../services/notificationService";
import { FaXmark } from "react-icons/fa6";

interface NotificationModalProps {
  notification: NotificationItem;
  onClose: () => void;
  onMarkRead?: (id: number | string) => Promise<void> | void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
}) => {
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


  return (
    <Modal customMode onClose={onClose}>
      <div className="flex flex-col gap-6 bg-tertiary rounded-xl p-6 w-1/3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-textBlack">{title}</h2>
            <p className="text-xs text-textBlack/60 capitalize">{meta}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className=" text-textBlack text-xs rounded-md font-medium  w-5 h-5 inline-flex items-center justify-center cursor-pointer"
          >
            <FaXmark />
          </button>
        </div>

        <div className="bg-secondary  rounded-lg p-4">
          {body ? (
            <p className="text-sm text-textBlack/80 leading-relaxed">{body}</p>
          ) : (
            <p className="text-sm text-textBlack/50">No additional details.</p>
          )}
        </div>


        <div className="flex flex-col sm:flex-row gap-3 border-t border-black/5 pt-5">
          {time && (
            <p className="text-xs text-textBlack/50 -mt-2">{time}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;