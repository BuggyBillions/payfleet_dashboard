import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompanyNotifications,
  markNotificationRead,
  isNotificationRead,
  type NotificationItem,
} from "../services/notificationService";

export const NOTIFICATIONS_QUERY_KEY = ["company-notifications"];

export const useNotifications = (options?: {
  refetchInterval?: number | false;
}) => {
  return useQuery<NotificationItem[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const items = await getCompanyNotifications();
      return [...items].sort(
        (a, b) =>
          new Date(b.created_at ?? b.date ?? 0).getTime() -
          new Date(a.created_at ?? a.date ?? 0).getTime()
      );
    },
    refetchInterval: options?.refetchInterval ?? 15000,
  });
};

export const useUnreadNotificationsCount = (options?: {
  refetchInterval?: number | false;
}) => {
  const { data: notifications = [] } = useNotifications(options);
  return notifications.filter((n) => !isNotificationRead(n)).length;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => markNotificationRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<NotificationItem[]>(
        NOTIFICATIONS_QUERY_KEY,
        (old) =>
          old
            ? old.map((n) =>
                n.id === id ? { ...n, is_read: true, read: true } : n
              )
            : []
      );
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (unreadIds: (number | string)[]) => {
      await Promise.all(unreadIds.map((id) => markNotificationRead(id)));
    },
    onSuccess: () => {
      queryClient.setQueryData<NotificationItem[]>(
        NOTIFICATIONS_QUERY_KEY,
        (old) =>
          old ? old.map((n) => ({ ...n, is_read: true, read: true })) : []
      );
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};
