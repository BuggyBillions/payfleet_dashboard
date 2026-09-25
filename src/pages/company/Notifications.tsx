import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LuBell,
  LuBellRing,
  LuCheck,
  LuCheckCheck,
  LuLoader,
} from "react-icons/lu";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import type { TableColumnProps } from "../../lib/interfaces";
import {
  getCompanyNotifications,
  markNotificationRead,
  isNotificationRead,
  type NotificationItem,
} from "../../services/notificationService";
import { getErrorMessage } from "../../helpers/api";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import StatusBadge from "../../components/ui/StatusBadge";
import NotificationModal from "../../components/modal/NotificationModal";
import OverviewCards from "../../components/cards/OverviewCards";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<number | string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCompanyNotifications()
      .then((data) => {
        if (!mounted) return;
        setNotifications(
          [...data].sort(
            (a, b) =>
              new Date(b.created_at ?? b.date ?? 0).getTime() -
              new Date(a.created_at ?? a.date ?? 0).getTime(),
          ),
        );
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;

  const handleMarkRead = async (id: number | string) => {
    setMarkingIds((prev) => new Set(prev).add(id));
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read: true } : n,
        ),
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to mark as read"));
      throw error;
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => n.id && !isNotificationRead(n));
    if (unread.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id!)));
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read: true })),
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to mark all as read"));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleView = (id: number | string) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    setSelected(item);
    setModalOpen(true);
  };

  const getTitle = (n: NotificationItem) =>
    n.title ?? n.subject ?? n.type ?? "Notification";

  const getBody = (n: NotificationItem) =>
    n.message ?? n.body ?? n.text ?? n.description ?? "";

  const getTime = (n: NotificationItem) => {
    const dateStr = n.created_at ?? n.date ?? n.updated_at ?? n.read_at;
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      render: (n) => {
        const read = isNotificationRead(n);
        const marking = markingIds.has(n.id);
        return (
          <ActionCell
            rowId={n.id}
            onView={handleView}
            otherActions={
              read
                ? []
                : [
                    {
                      name: marking ? "Marking..." : "Mark as Read",
                      icon: marking ? (
                        <LuLoader size={13} className="animate-spin" />
                      ) : (
                        <LuCheck size={13} />
                      ),
                      action: () => {
                        if (!n.id || read) return;
                        handleMarkRead(n.id).catch(() => undefined);
                      },
                    },
                  ]
            }
          />
        );
      },
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
            disabled={markingAll}
            className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-primary hover:bg-primary/90 transition text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            {markingAll ? (
              <LuLoader size={14} className="animate-spin" />
            ) : (
              <LuCheckCheck size={14} />
            )}
            Mark All as Read
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuBellRing}
          title="Total Notifications"
          value={notifications.length.toString()}
          icon2={HiOutlineArrowTrendingUp}
        />
        <OverviewCards
          icon={LuBell}
          title="Unread Notifications"
          value={unreadCount.toString()}
          icon2={HiOutlineArrowTrendingUp}
        />
      </div>

      <div className="bg-white dark:bg-[#131217] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-sm font-bold text-textBlack">
            All Notifications
          </h3>
          <p className="text-xs text-textBlack/60">
            Review and manage your notifications.
          </p>
        </div>
        <ReusableTable
          columns={columns}
          data={notifications}
          isLoading={loading}
          error={null}
          currentPage={currentPage}
          totalPages={Math.ceil(notifications.length / itemsPerPage) || 1}
          totalItems={notifications.length}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      {modalOpen && selected && (
        <NotificationModal
          notification={selected}
          onClose={() => setModalOpen(false)}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
};

export default Notifications;