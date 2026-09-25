import api from "../helpers/api";

export interface NotificationItem {
  id?: number | string;
  title?: string;
  subject?: string;
  message?: string;
  body?: string;
  text?: string;
  description?: string;
  type?: string;
  is_read?: boolean | number;
  read?: boolean | number;
  read_at?: string;
  created_at?: string;
  date?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export const getCompanyNotifications = async (): Promise<NotificationItem[]> => {
  const res = await api.get("/company-notifications");
  let data = res.data?.data ?? res.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const { notifications, items, results } = data as Record<string, unknown>;
    data = notifications ?? items ?? results ?? [];
  }
  return (Array.isArray(data) ? data : []) as NotificationItem[];
};

export const markNotificationRead = async (
  id: number | string,
): Promise<void> => {
  await api.patch(`/read-notification/${id}`);
};

export const isNotificationRead = (n: NotificationItem): boolean => {
  if (typeof n.is_read === "boolean") return n.is_read;
  if (typeof n.is_read === "number") return n.is_read === 1;
  if (typeof n.read === "boolean") return n.read;
  if (typeof n.read === "number") return n.read === 1;
  if (n.read_at) return true;
  return false;
};