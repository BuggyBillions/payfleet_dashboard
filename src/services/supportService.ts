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

export const extractMessagesList = (raw: unknown): Record<string, unknown>[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // Check if it's grouped by day: [{ day: "Yesterday", messages: [...] }, { day: "Today", messages: [...] }]
    const hasGroups = raw.some((g) => g && Array.isArray((g as { messages?: unknown[] }).messages));
    if (hasGroups) {
      return raw.flatMap((g) => (Array.isArray((g as { messages?: unknown[] }).messages) ? (g as { messages: Record<string, unknown>[] }).messages : []));
    }
    return raw as Record<string, unknown>[];
  }
  const rawObj = raw as { messages?: unknown; data?: unknown };
  if (rawObj.messages && Array.isArray(rawObj.messages)) {
    return extractMessagesList(rawObj.messages);
  }
  if (rawObj.data) {
    return extractMessagesList(rawObj.data);
  }
  return [];
};

interface RawSupportMessage {
  id?: string | number;
  message?: string;
  content?: string;
  text?: string;
  body?: string;
  msg?: string;
  sender_id?: { id?: number | string; name?: string; full_name?: string; role?: string; logo?: string | null; avatar?: string | null } | number | string;
  sender?: { id?: number | string; name?: string; full_name?: string; role?: string; logo?: string | null; avatar?: string | null };
  user?: { id?: number | string; name?: string; full_name?: string; role?: string; logo?: string | null; avatar?: string | null };
  sender_role?: string;
  sender_type?: string;
  role?: string;
  type?: string;
  is_admin?: boolean;
  is_support?: boolean;
  from_support?: boolean;
  from_admin?: boolean;
  sender_name?: string;
  is_sender?: boolean;
  is_me?: boolean;
  time?: string;
  created_at?: string;
  timestamp?: string;
  read_at?: string;
  is_read?: boolean;
  read?: boolean;
  delivered_at?: string;
  is_delivered?: boolean;
  delivered?: boolean;
  status?: string;
  logo?: string | null;
  avatar?: string | null;
}

export const mapRawMessageToChatMessage = (
  raw: unknown,
  fallbackName = "User",
  idx = 0
): ChatMessage | null => {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as RawSupportMessage;
  const text = String(
    m.message || m.content || m.text || m.body || m.msg || ""
  ).trim();
  if (!text) return null;

  const senderObj =
    m.sender_id && typeof m.sender_id === "object"
      ? m.sender_id
      : m.sender && typeof m.sender === "object"
      ? m.sender
      : m.user && typeof m.user === "object"
      ? m.user
      : null;

  const senderRole = String(
    senderObj?.role ||
    m.sender_role ||
    m.sender_type ||
    m.role ||
    m.type ||
    m.user?.role ||
    ""
  ).toLowerCase();

  const isSupportOrAdmin =
    senderRole.includes("admin") ||
    senderRole.includes("support") ||
    senderRole.includes("finance") ||
    senderRole.includes("financial") ||
    senderRole.includes("superadmin") ||
    Boolean(m.is_admin || m.is_support || m.from_support || m.from_admin);

  const senderId =
    Number(
      senderObj?.id ||
      (typeof m.sender_id === "number" || typeof m.sender_id === "string" ? m.sender_id : undefined) ||
      (isSupportOrAdmin ? 101 : 999)
    ) || (isSupportOrAdmin ? 101 : 999);

  const senderName = String(
    senderObj?.name ||
    senderObj?.full_name ||
    m.sender_name ||
    (isSupportOrAdmin ? "Payfleet Support" : fallbackName)
  );

  const isMe =
    m.is_sender !== undefined
      ? Boolean(m.is_sender)
      : m.is_me !== undefined
      ? Boolean(m.is_me)
      : isSupportOrAdmin;

  const timeStr = m.time
    ? String(m.time)
    : m.created_at
    ? new Date(String(m.created_at)).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : String(m.timestamp || "");

  const logo = (senderObj?.logo || senderObj?.avatar || m.logo || m.avatar || null) as string | null;
  const avatar = (senderObj?.avatar || senderObj?.logo || m.avatar || m.logo || null) as string | null;

  return {
    id: m.id || idx + 1,
    senderId,
    senderName,
    text,
    timestamp: timeStr,
    isMe,
    role: senderRole || (isSupportOrAdmin ? "support" : "company"),
    sender_type: senderRole || (isSupportOrAdmin ? "support" : "company"),
    status: (m.read_at || m.is_read || m.read || m.status === "read"
      ? "read"
      : m.delivered_at || m.is_delivered || m.delivered || m.status === "delivered"
      ? "delivered"
      : (m.status as "sent" | "delivered" | "read") || "sent") as
      | "sent"
      | "delivered"
      | "read",
    logo,
    avatar,
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
      .map((item: Record<string, unknown>, idx: number) =>
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

export const resolveConversationName = (item: Record<string, unknown>): string => {
  if (!item) return "User";
  const itemObj = item as Record<string, unknown> & { user?: Record<string, unknown>; client?: Record<string, unknown>; company?: Record<string, unknown> };
  const comp = (itemObj.company || itemObj.user?.company || itemObj.client?.company || {}) as Record<string, unknown>;
  const usr = (itemObj.user || itemObj.sender || itemObj.client || {}) as Record<string, unknown>;

  const userName =
    (usr.name as string) ||
    (usr.full_name as string) ||
    (usr.first_name || usr.last_name
      ? `${(usr.first_name as string) || ""} ${(usr.last_name as string) || ""}`.trim()
      : "");

  const itemName =
    (item.name as string) ||
    (item.full_name as string) ||
    (item.first_name || item.last_name
      ? `${(item.first_name as string) || ""} ${(item.last_name as string) || ""}`.trim()
      : "");

  const companyName =
    (comp.name as string) ||
    (comp.company_name as string) ||
    (comp.companyName as string) ||
    (item.company_name as string) ||
    (item.companyName as string);

  const senderName = (item.sender_name as string) || (item.client_name as string);

  const email = (comp.email as string) || (usr.email as string) || (item.email as string) || "";
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

    return rawList.map((item: Record<string, unknown>, idx: number): Conversation => {
      const itemObj = item as Record<string, unknown> & { user?: Record<string, unknown>; client?: Record<string, unknown>; company?: Record<string, unknown> };
      const usr = (itemObj.user || itemObj.sender || itemObj.client || {}) as Record<string, unknown>;
      const comp = (itemObj.company || usr.company || {}) as Record<string, unknown>;
      const name = resolveConversationName(item);
      const email = String(usr.email || comp.email || item.email || "");
      const phone = String(
        usr.phone ||
        usr.phoneNumber ||
        comp.phone ||
        comp.phoneNumber ||
        item.phone ||
        ""
      );
      const unread = Number(
        item.unread_count ?? item.unread ?? item.unreadMessages ?? 0
      );
      const lastMsg = item.last_message || item.latest_message;
      const lastMsgObj = typeof lastMsg === "object" && lastMsg !== null ? (lastMsg as Record<string, unknown>) : null;
      const lastMsgText =
        typeof lastMsg === "string"
          ? lastMsg
          : String(lastMsgObj?.message || lastMsgObj?.content || lastMsgObj?.text || "");

      const rawTime =
        lastMsgObj?.created_at ||
        item.last_activity ||
        item.last_message_time ||
        item.updated_at ||
        item.created_at;

      const lastTime = rawTime
        ? new Date(String(rawTime)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

      const logo = (comp.logo || usr.logo || usr.avatar || item.logo || item.avatar || null) as string | null;

      return {
        id: convId,
        name,
        type: "chat" as const,
        role: String(usr.role || item.role || comp.tier || "Company Client"),
        logo,
        avatar: logo,
        email,
        phone,
        department: String(item.department || "Client Account"),
        online: Boolean(item.online ?? comp.online ?? true),
        unread,
        lastMessage: lastMsgText || (messages.length > 0 ? messages[messages.length - 1].text : "No messages yet"),
        lastMessageTime: lastTime || (messages.length > 0 ? messages[messages.length - 1].timestamp : "Just now"),
        created_at: String(item.created_at || item.last_activity || ""),
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
  const item = (Array.isArray(rawData) ? (resData?.user || resData?.company || resData || {}) : rawData) as Record<string, unknown>;

  const itemUser = typeof item.user === "object" && item.user !== null ? (item.user as Record<string, unknown>) : {};
  const resDataUser = typeof resData?.user === "object" && resData?.user !== null ? (resData.user as Record<string, unknown>) : {};
  const resDataComp = typeof resData?.company === "object" && resData?.company !== null ? (resData.company as Record<string, unknown>) : {};
  const itemComp = typeof item.company === "object" && item.company !== null ? (item.company as Record<string, unknown>) : {};

  const comp = itemComp.name ? itemComp : itemUser.company ? (itemUser.company as Record<string, unknown>) : resDataComp.name ? resDataComp : {};
  const usr = itemUser.name || itemUser.email ? itemUser : resDataUser;
  const resolvedName = resolveConversationName(item) !== "User" 
    ? resolveConversationName(item) 
    : resolveConversationName(resData);
  const name = resolvedName !== "User" ? resolvedName : "";
  const email = String(comp.email || item.email || usr.email || resData?.email || "");
  const phone = String(
    comp.phone || comp.phoneNumber || item.phone || usr.phone || resData?.phone || ""
  );
  const unread = Number(item.unread_count ?? item.unread ?? resData?.unread_count ?? 0);
  const logo = (
    comp.logo ||
    usr.logo ||
    usr.avatar ||
    item.logo ||
    item.avatar ||
    resData?.logo ||
    null
  ) as string | null;

  const messages: ChatMessage[] = rawMessagesList
    .map((m, mIdx) => mapRawMessageToChatMessage(m, name || "User", mIdx))
    .filter((m): m is ChatMessage => m !== null);

  return {
    id: String(item.id || id),
    name,
    type: "chat" as const,
    role: String(item.role || usr.role || comp.tier || "Company Client"),
    logo,
    avatar: logo,
    email,
    phone,
    department: String(item.department || "Client Account"),
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
    created_at: String(item.created_at || resData?.created_at || ""),
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
