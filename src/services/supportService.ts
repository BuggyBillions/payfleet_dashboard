import api from "../helpers/api";
import type { ChatMessage, Conversation } from "../lib/interfaces";

export interface SupportMessagePayload {
  message?: string;
  content?: string;
  body?: string;
  [key: string]: unknown;
}

export interface UnreadCountResponse {
  unread_count: number;
  count: number;
}

/**
 * 1. Company: Get support messages (GET /support/messages)
 */
export const getSupportMessagesService = async (): Promise<ChatMessage[]> => {
  try {
    const response = await api.get("/support/messages");
    const resData = response.data;
    const rawList =
      resData?.data?.data ||
      resData?.data ||
      resData?.messages ||
      (Array.isArray(resData) ? resData : []);

    if (!Array.isArray(rawList)) return [];

    return rawList
      .map((item: Record<string, any>, idx: number) => {
        const senderRole = String(
          item.sender_type || item.role || item.sender_role || ""
        ).toLowerCase();
        const isSupportOrAdmin =
          senderRole.includes("admin") ||
          senderRole.includes("support") ||
          senderRole.includes("finance") ||
          Boolean(item.is_admin || item.is_support || item.from_support);
        const isMe =
          item.is_me !== undefined ? Boolean(item.is_me) : !isSupportOrAdmin;

        const timeStr = item.created_at
          ? new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : item.time || item.timestamp || "";

        const text = String(
          item.message ||
            item.content ||
            item.text ||
            item.body ||
            item.msg ||
            ""
        ).trim();

        return {
          id: item.id || idx + 1,
          senderId: item.sender_id || (isMe ? 999 : 101),
          senderName:
            item.sender_name || item.user?.name || (isMe ? "Me" : "Payfleet Support"),
          text,
          timestamp: timeStr,
          isMe,
          status: (item.read_at || item.is_read || item.read
            ? "read"
            : "delivered") as "sent" | "delivered" | "read",
        };
      })
      .filter((msg) => Boolean(msg.text && msg.text.trim()));
  } catch {
    return [];
  }
};

/**
 * 2. Company: Send message to support (POST /support/messages)
 */
export const sendUserMessageService = async (
  payload: SupportMessagePayload | string
) => {
  const messageText =
    typeof payload === "string"
      ? payload
      : payload.message || payload.content || payload.body || payload.text || "";
  const body =
    typeof payload === "string"
      ? {
          message: messageText,
          content: messageText,
          text: messageText,
          body: messageText,
        }
      : {
          ...payload,
          message: messageText,
          content: messageText,
          text: messageText,
          body: messageText,
        };

  const response = await api.post("/support/messages", body);
  return response.data;
};

/**
 * 3. Company: Mark messages as read (POST /support/messages/read)
 */
export const markMessagesAsReadService = async (
  payload?: Record<string, unknown>
) => {
  try {
    const response = await api.post("/support/messages/read", payload || {});
    return response.data;
  } catch {
    try {
      const response = await api.put("/support/messages/read", payload || {});
      return response.data;
    } catch {
      const response = await api.get("/support/messages/read");
      return response.data;
    }
  }
};

/**
 * 4. Company: Get unread count (GET /support/unread-count)
 */
export const getUnreadCountService = async (): Promise<number> => {
  const response = await api.get("/support/unread-count");
  const resData = response.data;
  const count = Number(
    resData?.unread_count ??
      resData?.count ??
      resData?.data?.unread_count ??
      resData?.data?.count ??
      (typeof resData?.data === "number" ? resData.data : 0)
  );
  return isNaN(count) ? 0 : count;
};

/**
 * 5. Admin / Support / Finance: Get conversations (GET /admin/support/conversations)
 */
export const getAdminSupportConversationsService = async (
  params?: Record<string, unknown>
): Promise<Conversation[]> => {
  const response = await api.get("/admin/support/conversations", { params });
  const resData = response.data;
  const rawList =
    resData?.data?.data ||
    resData?.data ||
    resData?.conversations ||
    (Array.isArray(resData) ? resData : []);

  if (!Array.isArray(rawList)) return [];

  return rawList.map((item: Record<string, any>, idx: number) => {
    const comp = item.company || item.user?.company || {};
    const usr = item.user || {};
    const name =
      comp.name ||
      item.company_name ||
      item.companyName ||
      usr.name ||
      item.name ||
      (item.id ? `Client #${item.id}` : `Client #${idx + 1}`);
    const email = comp.email || item.email || usr.email || "";
    const phone =
      comp.phone ||
      comp.phoneNumber ||
      item.phone ||
      usr.phone ||
      usr.phoneNumber ||
      "";
    const unread = Number(
      item.unread_count ?? item.unread ?? item.unreadMessages ?? 0
    );
    const lastMsg = item.last_message || item.latest_message;
    const lastMsgText =
      typeof lastMsg === "string"
        ? lastMsg
        : lastMsg?.message || lastMsg?.content || lastMsg?.text || "";

    const lastTime =
      item.last_message_time || item.updated_at || item.created_at
        ? new Date(
            item.last_message_time || item.updated_at || item.created_at
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

    const rawMessages =
      item.messages || (item.last_message ? [item.last_message] : []);
    const messages: ChatMessage[] = Array.isArray(rawMessages)
      ? rawMessages
          .map((m: Record<string, any>, mIdx: number) => {
            const senderRole = String(
              m.sender_type || m.role || ""
            ).toLowerCase();
            const isSupportOrAdmin =
              senderRole.includes("admin") ||
              senderRole.includes("support") ||
              senderRole.includes("finance") ||
              Boolean(m.is_admin || m.is_support);
            const isMe =
              m.is_me !== undefined ? Boolean(m.is_me) : isSupportOrAdmin;

            const text = String(
              m.message || m.content || m.text || m.body || m.msg || ""
            ).trim();

            return {
              id: m.id || mIdx + 1,
              senderId: m.sender_id || (isMe ? 999 : 101),
              senderName: m.sender_name || (isMe ? "Me" : name || "User"),
              text,
              timestamp: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : m.timestamp || "",
              isMe,
              status: (m.read_at || m.is_read ? "read" : "delivered") as
                | "sent"
                | "delivered"
                | "read",
            };
          })
          .filter((msg) => Boolean(msg.text && msg.text.trim()))
      : [];

    return {
      id: String(item.id || `conv-${idx + 1}`),
      name: name || "Client",
      type: "chat" as const,
      role: item.role || comp.tier || "Client",
      email,
      phone,
      department: item.department || "Client Account",
      online: Boolean(item.online ?? comp.online ?? false),
      unread,
      lastMessage: lastMsgText,
      lastMessageTime: lastTime,
      created_at: item.created_at,
      messages,
    };
  });
};

/**
 * 6. Admin / Support / Finance: Get each user conversation & messages (GET /admin/support/conversations/{id})
 */
export const getAdminSupportConversationByIdService = async (
  id: string | number
): Promise<Conversation> => {
  const response = await api.get(`/admin/support/conversations/${id}`);
  const resData = response.data;
  const item = resData?.data || resData?.conversation || resData;

  const comp = item.company || item.user?.company || {};
  const usr = item.user || {};
  const name =
    comp.name ||
    item.company_name ||
    item.companyName ||
    usr.name ||
    item.name ||
    `Client #${id}`;
  const email = comp.email || item.email || usr.email || "";
  const phone =
    comp.phone || comp.phoneNumber || item.phone || usr.phone || "";
  const unread = Number(item.unread_count ?? item.unread ?? 0);

  const rawMessages =
    item.messages || item.chat_messages || (Array.isArray(item) ? item : []);
  const messages: ChatMessage[] = Array.isArray(rawMessages)
    ? rawMessages
        .map((m: Record<string, any>, mIdx: number) => {
          const senderRole = String(
            m.sender_type || m.role || ""
          ).toLowerCase();
          const isSupportOrAdmin =
            senderRole.includes("admin") ||
            senderRole.includes("support") ||
            senderRole.includes("finance") ||
            Boolean(m.is_admin || m.is_support);
          const isMe =
            m.is_me !== undefined ? Boolean(m.is_me) : isSupportOrAdmin;

          const text = String(
            m.message || m.content || m.text || m.body || m.msg || ""
          ).trim();

          return {
            id: m.id || mIdx + 1,
            senderId: m.sender_id || (isMe ? 999 : 101),
            senderName: m.sender_name || (isMe ? "Me" : name || "User"),
            text,
            timestamp: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : m.timestamp || "",
            isMe,
            status: (m.read_at || m.is_read ? "read" : "delivered") as
              | "sent"
              | "delivered"
              | "read",
          };
        })
        .filter((msg) => Boolean(msg.text && msg.text.trim()))
    : [];

  return {
    id: String(item.id || id),
    name,
    type: "chat" as const,
    role: item.role || comp.tier || "Company Client",
    email,
    phone,
    department: item.department || "Client Account",
    online: Boolean(item.online ?? comp.online ?? true),
    unread,
    lastMessage:
      messages.length > 0
        ? messages[messages.length - 1].text
        : "No messages yet",
    lastMessageTime:
      messages.length > 0
        ? messages[messages.length - 1].timestamp
        : "Just now",
    created_at: item.created_at,
    messages,
  };
};

/**
 * 7. Admin / Support / Finance: Reply to company (POST /admin/support/conversations/{id}/messages)
 */
export const replyToCompanyService = async (
  conversationId: string | number,
  payload: SupportMessagePayload | string
) => {
  const messageText =
    typeof payload === "string"
      ? payload
      : payload.message || payload.content || payload.body || "";
  const body =
    typeof payload === "string"
      ? {
          message: messageText,
          content: messageText,
          text: messageText,
          body: messageText,
        }
      : {
          ...payload,
          message: messageText,
          content: messageText,
          text: messageText,
          body: messageText,
        };

  const response = await api.post(
    `/admin/support/conversations/${conversationId}/messages`,
    body
  );
  return response.data;
};
