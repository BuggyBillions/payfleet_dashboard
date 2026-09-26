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

export const extractMessagesList = (raw: any): Record<string, any>[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // Check if it's grouped by day: [{ day: "Yesterday", messages: [...] }, { day: "Today", messages: [...] }]
    const hasGroups = raw.some((g) => g && Array.isArray(g.messages));
    if (hasGroups) {
      return raw.flatMap((g) => (Array.isArray(g.messages) ? g.messages : []));
    }
    return raw;
  }
  if (raw.messages && Array.isArray(raw.messages)) {
    return extractMessagesList(raw.messages);
  }
  if (raw.data) {
    return extractMessagesList(raw.data);
  }
  return [];
};

export const mapRawMessageToChatMessage = (
  m: Record<string, any>,
  fallbackName = "User",
  idx = 0
): ChatMessage | null => {
  if (!m) return null;
  const text = String(
    m.message || m.content || m.text || m.body || m.msg || ""
  ).trim();
  if (!text) return null;

  const senderRole = String(
    m.sender_type || m.role || m.sender_role || m.type || ""
  ).toLowerCase();
  const isSupportOrAdmin =
    senderRole.includes("admin") ||
    senderRole.includes("support") ||
    senderRole.includes("finance") ||
    Boolean(m.is_admin || m.is_support || m.from_support || m.from_admin);

  const isMe =
    m.is_sender !== undefined
      ? Boolean(m.is_sender)
      : m.is_me !== undefined
      ? Boolean(m.is_me)
      : m.sender_type === "company" || m.sender_type === "user" || m.sender_type === "client"
      ? true
      : isSupportOrAdmin;

  const timeStr = m.time
    ? String(m.time)
    : m.created_at
    ? new Date(m.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : m.timestamp || "";

  return {
    id: m.id || idx + 1,
    senderId: m.sender_id || (isMe ? 999 : 101),
    senderName: m.sender_name || (isMe ? "Me" : fallbackName),
    text,
    timestamp: timeStr,
    isMe,
    status: (m.read_at || m.is_read || m.read ? "read" : "delivered") as
      | "sent"
      | "delivered"
      | "read",
  };
};

/**
 * 1. Company: Get support messages (GET /support/messages)
 */
export const getSupportMessagesService = async (): Promise<ChatMessage[]> => {
  try {
    let response;
    try {
      response = await api.get("/support/messages");
    } catch {
      try {
        response = await api.get("/support/message");
      } catch {
        response = await api.get("/messages");
      }
    }
    const resData = response.data;
    const rawData =
      resData?.data ||
      resData?.messages ||
      resData?.support_messages ||
      resData;

    const rawList = extractMessagesList(rawData);

    return rawList
      .map((item: Record<string, any>, idx: number) =>
        mapRawMessageToChatMessage(item, "Payfleet Support", idx)
      )
      .filter((msg): msg is ChatMessage => msg !== null);
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

  try {
    const response = await api.post("/support/messages", body);
    return response.data;
  } catch (err) {
    try {
      const response = await api.post("/support/message", body);
      return response.data;
    } catch {
      try {
        const response = await api.post("/support/send", body);
        return response.data;
      } catch {
        try {
          const response = await api.post("/support", body);
          return response.data;
        } catch {
          throw err;
        }
      }
    }
  }
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
      try {
        const response = await api.post("/support/read", payload || {});
        return response.data;
      } catch {
        const response = await api.get("/support/messages/read");
        return response.data;
      }
    }
  }
};

/**
 * 4. Company: Get unread count (GET /support/unread-count)
 */
export const getUnreadCountService = async (): Promise<number> => {
  try {
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
  } catch {
    return 0;
  }
};

export const resolveConversationName = (item: Record<string, any>): string => {
  if (!item) return "User";
  const comp = item.company || item.user?.company || item.client?.company || {};
  const usr = item.user || item.sender || item.client || {};

  const userName =
    usr.name ||
    usr.full_name ||
    (usr.first_name || usr.last_name
      ? `${usr.first_name || ""} ${usr.last_name || ""}`.trim()
      : "");

  const itemName =
    item.name ||
    item.full_name ||
    (item.first_name || item.last_name
      ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
      : "");

  const companyName =
    comp.name ||
    comp.company_name ||
    comp.companyName ||
    item.company_name ||
    item.companyName;

  const senderName = item.sender_name || item.client_name;

  const email = comp.email || usr.email || item.email || "";
  const emailName = email ? email.split("@")[0] : "";

  return userName || companyName || itemName || senderName || emailName || "User";
};

/**
 * 5. Admin / Support / Finance: Get conversations (GET /admin/support/conversations)
 */
export const getAdminSupportConversationsService = async (
  params?: Record<string, unknown>
): Promise<Conversation[]> => {
  try {
    let response;
    try {
      response = await api.get("/admin/support/conversations", { params });
    } catch {
      try {
        response = await api.get("/support/conversations", { params });
      } catch {
        response = await api.get("/admin/conversations", { params });
      }
    }
    const resData = response.data;
    const rawList =
      resData?.data?.data ||
      resData?.data?.conversations ||
      resData?.data?.items ||
      resData?.data ||
      resData?.conversations ||
      (Array.isArray(resData) ? resData : []);

    if (!Array.isArray(rawList)) return [];

    return rawList.map((item: Record<string, any>, idx: number) => {
      const usr = item.user || item.sender || item.client || {};
      const comp = item.company || usr.company || {};
      const name = resolveConversationName(item);
      const email = usr.email || comp.email || item.email || "";
      const phone =
        usr.phone ||
        usr.phoneNumber ||
        comp.phone ||
        comp.phoneNumber ||
        item.phone ||
        "";
      const unread = Number(
        item.unread_count ?? item.unread ?? item.unreadMessages ?? 0
      );
      const lastMsg = item.last_message || item.latest_message;
      const lastMsgText =
        typeof lastMsg === "string"
          ? lastMsg
          : lastMsg?.message || lastMsg?.content || lastMsg?.text || "";

      const rawTime =
        lastMsg?.created_at ||
        item.last_activity ||
        item.last_message_time ||
        item.updated_at ||
        item.created_at;

      const lastTime = rawTime
        ? new Date(rawTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

      const convId = String(
        usr.id ||
        item.id ||
        item.conversation_id ||
        item.company_id ||
        comp.id ||
        item.user_id ||
        item.client_id ||
        idx + 1
      );

      const rawMessagesList = extractMessagesList(
        item.messages || (item.last_message ? [item.last_message] : [])
      );
      const messages: ChatMessage[] = rawMessagesList
        .map((m, mIdx) => mapRawMessageToChatMessage(m, name, mIdx))
        .filter((m): m is ChatMessage => m !== null);

      return {
        id: convId,
        name,
        type: "chat" as const,
        role: usr.role || item.role || comp.tier || "Company Client",
        email,
        phone,
        department: item.department || "Client Account",
        online: Boolean(item.online ?? comp.online ?? true),
        unread,
        lastMessage: lastMsgText || (messages.length > 0 ? messages[messages.length - 1].text : "No messages yet"),
        lastMessageTime: lastTime || (messages.length > 0 ? messages[messages.length - 1].timestamp : "Just now"),
        created_at: item.created_at || item.last_activity,
        messages,
      };
    });
  } catch {
    return [];
  }
};

/**
 * 6. Admin / Support / Finance: Get each user conversation & messages (GET /admin/support/conversations/{id})
 */
export const getAdminSupportConversationByIdService = async (
  id: string | number
): Promise<Conversation> => {
  let response;
  try {
    response = await api.get(`/admin/support/conversations/${id}`);
  } catch {
    try {
      response = await api.get(`/support/conversations/${id}`);
    } catch {
      response = await api.get(`/admin/support/conversation/${id}`);
    }
  }
  const resData = response.data;
  const rawData = resData?.data || resData?.conversation || resData;

  const rawMessagesList = extractMessagesList(rawData);
  const item = Array.isArray(rawData) ? (resData?.user || resData?.company || resData || {}) : rawData;

  const comp = item.company || item.user?.company || resData?.company || resData?.user?.company || {};
  const usr = item.user || resData?.user || resData?.client || {};
  const resolvedName = resolveConversationName(item) !== "User" 
    ? resolveConversationName(item) 
    : resolveConversationName(resData);
  const name = resolvedName !== "User" ? resolvedName : "";
  const email = comp.email || item.email || usr.email || resData?.email || "";
  const phone =
    comp.phone || comp.phoneNumber || item.phone || usr.phone || resData?.phone || "";
  const unread = Number(item.unread_count ?? item.unread ?? resData?.unread_count ?? 0);

  const messages: ChatMessage[] = rawMessagesList
    .map((m, mIdx) => mapRawMessageToChatMessage(m, name || "User", mIdx))
    .filter((m): m is ChatMessage => m !== null);

  return {
    id: String(item.id || id),
    name,
    type: "chat" as const,
    role: item.role || usr.role || comp.tier || "Company Client",
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
    created_at: item.created_at || resData?.created_at,
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
          conversation_id: conversationId,
          company_id: conversationId,
          user_id: conversationId,
        }
      : {
          ...payload,
          message: messageText,
          content: messageText,
          text: messageText,
          body: messageText,
          conversation_id: conversationId,
          company_id: conversationId,
          user_id: conversationId,
        };

  try {
    const response = await api.post(
      `/admin/support/conversations/${conversationId}/messages`,
      body
    );
    return response.data;
  } catch (err) {
    try {
      const response = await api.post(
        `/admin/support/conversations/${conversationId}/reply`,
        body
      );
      return response.data;
    } catch {
      try {
        const response = await api.post(`/admin/support/messages`, body);
        return response.data;
      } catch {
        try {
          const response = await api.post(`/support/messages`, body);
          return response.data;
        } catch {
          throw err;
        }
      }
    }
  }
};
