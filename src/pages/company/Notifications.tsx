import React, { useState, useMemo, useEffect } from "react";
import {
  LuBell,
  LuBellRing,
  LuCheckCheck,
  LuLoader,
  LuEye,
} from "react-icons/lu";
import type { TableColumnProps } from "../../lib/interfaces";
import {
  isNotificationRead,
  type NotificationItem,
} from "../../services/notificationService";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../hooks/useNotifications";
import ReusableTable from "../../utility/ReusableTable";
import StatusBadge from "../../components/ui/StatusBadge";
import NotificationModal from "../../components/modal/NotificationModal";
import OverviewCards from "../../components/cards/OverviewCards";
import { formatISODateToYYYYMMDD } from "../../helpers/formatterUtility";

const Notifications: React.FC = () => {
  const { data: notifications = [], isLoading: loading } = useNotifications({
    refetchInterval: 15000,
  });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const totalItems = notifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Keep currentPage valid if totalPages shrinks
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Client-side pagination slicing
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return notifications.slice(startIndex, startIndex + itemsPerPage);
  }, [notifications, currentPage, itemsPerPage]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !isNotificationRead(n)).length;
  }, [notifications]);

  const handleMarkRead = (id: number | string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    const unreadIds = notifications
      .filter((n) => n.id !== undefined && !isNotificationRead(n))
      .map((n) => n.id!);
    if (unreadIds.length === 0) return;
    markAllReadMutation.mutate(unreadIds);
  };

  const handleView = (id: number | string) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    setSelected(item);
    if (item.id !== undefined && !isNotificationRead(item)) {
      handleMarkRead(item.id);
    }
    setModalOpen(true);
  };

  const getTitle = (n: NotificationItem) =>
    n.title ?? n.subject ?? n.type ?? "Notification";

  const getBody = (n: NotificationItem) =>
    n.message ?? n.body ?? n.text ?? n.description ?? "";

  const getTime = (n: NotificationItem) => {
    const dateStr = n.created_at ?? n.date ?? n.updated_at ?? n.read_at;
    if (!dateStr) return "";
    return formatISODateToYYYYMMDD(dateStr);
  };

  const columns: TableColumnProps<NotificationItem>[] = [
    {
      label: "Message",
      render: (n) => {
        const body = getBody(n);
        return (
          <div className="min-w-52">
            <div>
              <p className="text-xs font-bold text-textBlack truncate">
                {getTitle(n)}
              </p>
              {body && (
                <p className="text-[10px] text-textBlack/60 mt-0.5 line-clamp-2 max-w-80">
                  {body}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      label: "Date",
      render: (n) => (
        <span className="text-[10px] text-textBlack/70 whitespace-nowrap">
          {getTime(n)}
        </span>
      ),
    },
    {
      label: "Status",
      render: (n) =>
        isNotificationRead(n) ? (
          <StatusBadge status="successful" text="Read" />
        ) : (
          <StatusBadge status="pending" text="Unread" />
        ),
    },
    {
      label: "Action",
      className: "px-3 py-2 text-center",
      tableHeadingClassName: "text-center",
      render: (n) => (
        <button
          type="button"
          onClick={() => handleView(n.id ?? -1)}
          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition cursor-pointer inline-flex items-center justify-center"
          title="View Notification Details"
        >
          <LuEye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">Notifications</h2>
          <p className="text-xs text-textBlack/60">
            Activity and platform updates for your business.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-primary hover:bg-primary/90 transition text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            {markAllReadMutation.isPending ? (
              <LuLoader size={14} className="animate-spin" />
            ) : (
              <LuCheckCheck size={14} />
            )}
            Mark All as Read
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuBellRing}
          title="Total Notifications"
          value={notifications.length.toString()}
        />
        <OverviewCards
          icon={LuBell}
          title="Unread Notifications"
          value={unreadCount.toString()}
        />
      </div>

      <div className="bg-tertiary rounded-2xl p-4 overflow-hidden">
        <ReusableTable
          columns={columns}
          data={paginatedNotifications}
          isLoading={loading}
          error={null}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      {modalOpen && selected && (
        <NotificationModal
          notification={selected}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Notifications;