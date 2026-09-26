import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Modal from "../../components/modal/Modal";
import { toast } from "sonner";
import {
  LuSearch,
  LuSend,
  LuArrowLeft,
  LuPlus,
  LuCheck,
  LuCheckCheck,
  LuMessageSquare,
  LuTrash2,
  LuUser,
  LuSparkles,
  LuHeadphones,
} from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { BsEnvelope } from "react-icons/bs";
import type { ChatUser, ChatMessage, Conversation } from "../../lib/interfaces";
import ViewProfileModal from "../../components/modal/view/ViewProfileModal";
import { useUser } from "../../hooks/useUser";
import {
  useAdminSupportConversations,
  useAdminSupportConversationById,
  useReplyToCompany,
  useSupportMessages,
  useSendUserMessage,
  useMarkMessagesAsRead,
} from "../../hooks/useSupportChat";
import { useStaffs } from "../../hooks/useStaff";
import { useCompanies } from "../../hooks/useCompany";

export type { ChatUser, ChatMessage, Conversation };

export interface PresetOption {
  id: string;
  label: string;
  question: string;
  answer: string;
  action?: "live_agent";
}

export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: "deposit-guide",
    label: "How to make a deposit",
    question: "How do I deposit funds or top up my wallet?",
    answer:
      "To fund your wallet: Go to Deposits > 'Deposit Funds', enter your amount, and select your payment method (Bank Transfer, Card, or Virtual Account). If paying via transfer, upload your payment receipt for instant verification.",
  },
  {
    id: "payroll-guide",
    label: "How to disburse payroll",
    question: "How do I process payroll for my staff?",
    answer:
      "To process payroll: Open the Payroll menu, verify your employee list and salary amounts, confirm your wallet has sufficient balance, and click 'Run Payroll'. Payouts are dispatched directly to employee bank accounts.",
  },
  {
    id: "pending-check",
    label: "Check pending deposit / payout",
    question: "Why is my deposit or payroll transaction pending?",
    answer:
      "Deposits and payroll transfers are processed automatically and typically settle within 5–15 minutes. If your transaction is delayed, please share your Transaction Reference ID here so our finance team can expedite it.",
  },
  {
    id: "live-agent-request",
    label: "Speak with Live Support Agent",
    question: "I would like to speak with a live support agent.",
    answer:
      "Connecting you with an active Payfleet support representative. Please describe your question or issue in the chat box below to begin.",
    action: "live_agent",
  },
];

const INITIAL_SUPPORT_MESSAGE: ChatMessage = {
  id: "support-greeting-root",
  senderId: 101,
  senderName: "Payfleet Support",
  text: "Hello! Welcome to Payfleet Support. How can we assist you with your payroll or deposit today?",
  timestamp: "Just now",
  isMe: false,
  status: "read",
};

const Communication: React.FC = () => {
  const { user, role } = useUser();
  const location = useLocation();

  const currentRole = (role || user?.role || "").toLowerCase();
  const isStaffUser = useMemo(() => {
    return (
      currentRole.includes("admin") ||
      currentRole.includes("support") ||
      currentRole.includes("finance") ||
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/support") ||
      location.pathname.startsWith("/financial")
    );
  }, [currentRole, location.pathname]);

  const isAdminUser = useMemo(() => {
    return (
      currentRole.includes("admin") ||
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/superadmin")
    );
  }, [currentRole, location.pathname]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMsg, setInputMsg] = useState("");
  const [tabToShow, setTabToShow] = useState<"sidebar" | "main">("sidebar");

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] =
    useState<Conversation | null>(null);

  // New Chat Modal State
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Live queries for available contact list in modal (only fetch when modal is open)
  const { data: staffData } = useStaffs({
    page: 1,
    per_page: 50,
    role: "all",
    enabled: isAdminUser && openNewChatModal,
  });
  const { data: companyData } = useCompanies({
    page: 1,
    per_page: 50,
    enabled: openNewChatModal,
  });

  // Staff live queries (GET /admin/support/conversations, GET /admin/support/conversations/{id})
  const { data: serverConversations, isLoading: loadingConversations } =
    useAdminSupportConversations(undefined, {
      enabled: isStaffUser,
      refetchInterval: isStaffUser ? 10000 : false,
      staleTime: 5000,
    });

  const { data: singleConvData } = useAdminSupportConversationById(
    isStaffUser && activeChatId ? activeChatId : null,
    {
      enabled: isStaffUser && Boolean(activeChatId),
      refetchInterval: isStaffUser && Boolean(activeChatId) ? 8000 : false,
      staleTime: 4000,
    }
  );

  const replyToCompanyMutation = useReplyToCompany();

  // Company live queries (GET /support/messages, POST /support/messages, POST /support/messages/read)
  const { data: companyMessages, isLoading: loadingCompanyMessages } =
    useSupportMessages({
      enabled: !isStaffUser,
      refetchInterval: !isStaffUser ? 10000 : false,
      staleTime: 5000,
    });
  const sendUserMessageMutation = useSendUserMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  // Build real user list for New Chat Modal
  const availableUsers: ChatUser[] = useMemo(() => {
    const comps = (companyData?.items || []).map((c, idx) => ({
      id: Number(c.id || idx + 1),
      name: c.name || c.companyName || "Corporate Client",
      email: c.email || "",
      role: "Company Client",
      online: Boolean(c.status === "active" || c.is_active),
    }));

    return comps;
  }, [companyData?.items, staffData?.items, isAdminUser]);

  // Synchronize server conversation threads
  useEffect(() => {
    if (isStaffUser && serverConversations && serverConversations.length > 0) {
      const serverConvs = serverConversations;
      setConversations((prev) => {
        // Merge server conversations with current local state to preserve message history & local chats
        const updated = serverConvs.map((sc) => {
          const existing = prev.find((p) => String(p.id) === String(sc.id));
          if (existing) {
            const messagesToKeep =
              existing.messages.length > (sc.messages || []).length
                ? existing.messages
                : sc.messages || [];

            const existingCustomPending = existing.messages.filter(
              (m) =>
                m.isMe &&
                typeof m.id === "number" &&
                m.id > 1000000000 &&
                !messagesToKeep.some((srv) => srv.text === m.text)
            );

            return {
              ...sc,
              name:
                existing.name &&
                existing.name !== "User" &&
                !existing.name.startsWith("Client #")
                  ? existing.name
                  : sc.name,
              messages: [...messagesToKeep, ...existingCustomPending],
            };
          }
          return sc;
        });

        // Retain any custom / new local conversation that hasn't synced to server yet
        const customLocal = prev.filter(
          (p) => !serverConvs.some((sc) => String(sc.id) === String(p.id))
        );

        return [...updated, ...customLocal];
      });

      if (!activeChatId && serverConvs[0]?.id) {
        setActiveChatId(String(serverConvs[0].id));
      }
    } else if (!isStaffUser && companyMessages !== undefined) {
      // Company support conversation thread
      const compMsgs = companyMessages || [];
      const mergedMessages =
        compMsgs.length > 0
          ? [INITIAL_SUPPORT_MESSAGE, ...compMsgs]
          : [INITIAL_SUPPORT_MESSAGE];

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === "support-desk");
        const existingCustomPending =
          existing?.messages.filter(
            (m) =>
              m.isMe &&
              typeof m.id === "number" &&
              m.id > 1000000000 &&
              !compMsgs.some((srv) => srv.text === m.text)
          ) || [];

        const fullList = [...mergedMessages, ...existingCustomPending];
        const lastMsg = fullList[fullList.length - 1];

        const supportConv: Conversation = {
          id: "support-desk",
          name: "Payfleet Support Desk",
          type: "chat",
          role: "Official Support Representative",
          email: "support@payfleet.ng",
          phone: "+234 800 72935338",
          department: "Customer Support & Operations",
          online: true,
          unread: 0,
          lastMessage: lastMsg?.text || "Support channel open",
          lastMessageTime: lastMsg?.timestamp || "Just now",
          created_at: "2024-01-01",
          messages: fullList,
        };

        const otherConvs = prev.filter((c) => c.id !== "support-desk");
        return [supportConv, ...otherConvs];
      });

      if (!activeChatId) {
        setActiveChatId("support-desk");
      }
    }
  }, [serverConversations, companyMessages, isStaffUser]);

  // Mark messages as read when opening company chat
  useEffect(() => {
    if (!isStaffUser && activeChatId === "support-desk") {
      markAsReadMutation.mutate();
    }
  }, [activeChatId, isStaffUser]);

  // Synchronize single conversation messages and details when loaded from API
  useEffect(() => {
    if (singleConvData && singleConvData.id) {
      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.id) === String(singleConvData.id)) {
            const serverMsgs = singleConvData.messages || [];
            const pendingMsgs = c.messages.filter(
              (m) =>
                m.isMe &&
                typeof m.id === "number" &&
                m.id > 1000000000 &&
                !serverMsgs.some((s) => s.text === m.text)
            );
            return {
              ...c,
              ...(singleConvData.name &&
              !singleConvData.name.startsWith("Client #") &&
              singleConvData.name !== "User"
                ? { name: singleConvData.name }
                : {}),
              ...(singleConvData.email ? { email: singleConvData.email } : {}),
              ...(singleConvData.phone ? { phone: singleConvData.phone } : {}),
              ...(singleConvData.role ? { role: singleConvData.role } : {}),
              messages:
                serverMsgs.length > 0
                  ? [...serverMsgs, ...pendingMsgs]
                  : c.messages,
            };
          }
          return c;
        })
      );
    }
  }, [singleConvData]);

  // Active Conversation Object
  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => String(c.id) === String(activeChatId)) ||
      conversations[0] ||
      null
    );
  }, [conversations, activeChatId]);

  // Combined messages to display in active conversation
  const displayedMessages: ChatMessage[] = useMemo(() => {
    if (!activeConversation) return [];

    let baseMsgs = activeConversation.messages || [];

    if (
      isStaffUser &&
      singleConvData &&
      String(singleConvData.id) === String(activeChatId) &&
      singleConvData.messages &&
      singleConvData.messages.length > 0
    ) {
      const serverMsgs = singleConvData.messages;
      const pendingMsgs = baseMsgs.filter(
        (m) =>
          m.isMe &&
          typeof m.id === "number" &&
          m.id > 1000000000 &&
          !serverMsgs.some((s) => s.text === m.text)
      );
      baseMsgs = [...serverMsgs, ...pendingMsgs];
    }

    return baseMsgs.filter((m) => Boolean(m && m.text && m.text.trim()));
  }, [activeConversation, singleConvData, activeChatId, isStaffUser]);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(conv.role || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [conversations, searchQuery]);

  // Scroll to bottom of message view
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages.length, activeChatId]);

  const isSending = isStaffUser
    ? replyToCompanyMutation.isPending
    : sendUserMessageMutation.isPending;

  // Send Message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || !activeConversation || isSending) return;

    const messageText = inputMsg.trim();
    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg: ChatMessage = {
      id: Date.now(),
      senderId: 999,
      senderName: user?.name || "Me",
      text: messageText,
      timestamp: timeString,
      isMe: true,
      status: "sent",
    };

    // Optimistically update conversation state
    setConversations((prev) =>
      prev.map((conv) => {
        if (String(conv.id) === String(activeConversation.id)) {
          return {
            ...conv,
            lastMessage: messageText,
            lastMessageTime: timeString,
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );

    setInputMsg("");
    setTimeout(scrollToBottom, 50);

    // Dispatch API mutation based on role
    if (isStaffUser) {
      replyToCompanyMutation.mutate(
        {
          conversationId: activeConversation.id,
          payload: {
            message: messageText,
            content: messageText,
            text: messageText,
            body: messageText,
            conversation_id: activeConversation.id,
            company_id: activeConversation.id,
            user_id: activeConversation.id,
          },
        },
        {
          onSuccess: () => {
            setTimeout(scrollToBottom, 50);
          },
        }
      );
    } else {
      sendUserMessageMutation.mutate(
        {
          message: messageText,
          content: messageText,
          text: messageText,
          body: messageText,
          conversation_id:
            activeConversation.id === "support-desk"
              ? undefined
              : activeConversation.id,
          recipient_id:
            activeConversation.id === "support-desk"
              ? undefined
              : activeConversation.id,
        },
        {
          onSuccess: () => {
            setTimeout(scrollToBottom, 50);
          },
        }
      );
    }
  };

  const handleSelectPreset = (preset: PresetOption) => {
    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMessage = {
      id: Date.now(),
      senderId: 999,
      senderName: user?.first_name || user?.name || "Me",
      text: preset.question,
      timestamp: timeString,
      isMe: true,
      status: "sent",
    };

    const botReply: ChatMessage = {
      id: Date.now() + 1,
      senderId: 101,
      senderName: "Payfleet Support",
      text: preset.answer,
      timestamp: timeString,
      isMe: false,
      status: "read",
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === "support-desk" || String(conv.id) === String(activeChatId)) {
          return {
            ...conv,
            lastMessage: preset.answer,
            lastMessageTime: timeString,
            messages: [...conv.messages, userMsg, botReply],
          };
        }
        return conv;
      })
    );

    if (preset.action === "live_agent") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }

    setTimeout(() => {
      scrollToBottom();
    }, 50);
  };

  // Start direct conversation with selected user from API list
  const handleStartDM = (selectedUser: ChatUser) => {
    const existing = conversations.find(
      (c) =>
        c.name.toLowerCase() === selectedUser.name.toLowerCase() ||
        String(c.id) === String(selectedUser.id)
    );

    if (existing) {
      setActiveChatId(String(existing.id));
    } else {
      const newConv: Conversation = {
        id: String(selectedUser.id),
        name: selectedUser.name,
        type: "chat",
        role: selectedUser.role,
        email: selectedUser.email,
        phone: "",
        department: selectedUser.role,
        online: selectedUser.online,
        unread: 0,
        lastMessage: "Conversation opened",
        lastMessageTime: "Just now",
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveChatId(newConv.id);
    }

    setOpenNewChatModal(false);
    setTabToShow("main");
    toast.success(`Chat with ${selectedUser.name} opened`);
  };

  const getAvatarInitials = (name: string) => {
    if (!name) return "PF";
    const parts = name.replace("#", "").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const filteredNewChatUsers = useMemo(() => {
    if (!userSearchTerm.trim()) return availableUsers;
    const term = userSearchTerm.toLowerCase();
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [userSearchTerm, availableUsers]);

  const handleOpenProfile = (conv: Conversation) => {
    setSelectedProfileUser(conv);
    setProfileModalOpen(true);
  };

  const isLoading = isStaffUser ? loadingConversations : loadingCompanyMessages;

  return (
    <div className="flex flex-col h-[calc(100vh-115px)] w-full bg-white dark:bg-[#131217] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden font-sans">
      {/* Main Split Layout: Sidebar & Chat Window */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-88 border-r border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#131217] flex flex-col relative ${
            tabToShow === "main" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Action Buttons */}
          <div className="flex items-center gap-2 absolute bottom-5 right-5 z-20">
            <button
              onClick={() => setOpenNewChatModal(true)}
              className="text-xs bg-primary hover:bg-primary/90 text-white h-10 px-3.5 rounded-xl shadow-md group flex items-center gap-2 transition-all cursor-pointer"
            >
              <LuPlus
                size={16}
                className="group-hover:rotate-90 transition-all duration-300"
              />
              <span className="font-semibold group-hover:flex hidden">
                New chat
              </span>
            </button>
          </div>

          {/* Search box */}
          <div className="p-3.5 border-b border-gray-100 dark:border-white/10">
            <div className="relative">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-secondary dark:bg-[#1A1921] border border-primary/10 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5 styled-scrollbar">
            {isLoading && conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 space-y-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 space-y-2">
                <LuMessageSquare className="mx-auto text-2xl text-gray-300 dark:text-gray-600" />
                <p className="text-xs">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = String(conv.id) === String(activeChatId);
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveChatId(String(conv.id));
                      setTabToShow("main");
                      // Clear unread
                      setConversations((prev) =>
                        prev.map((c) =>
                          String(c.id) === String(conv.id)
                            ? { ...c, unread: 0 }
                            : c
                        )
                      );
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                      isSelected
                        ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-b-0 border-primary"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {getAvatarInitials(conv.name)}
                      </div>
                      {conv.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131217]" />
                      )}
                    </div>

                    {/* Conversation preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {conv.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.unread > 0 && (
                          <span className="w-4.5 h-4.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT MAIN PANEL: Active Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-gray-50/40 dark:bg-[#0D0C10] ${
            tabToShow === "sidebar" ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 bg-white dark:bg-[#131217] border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTabToShow("sidebar")}
                    className="md:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-lg cursor-pointer"
                  >
                    <LuArrowLeft size={18} />
                  </button>

                  <div
                    onClick={() => handleOpenProfile(activeConversation)}
                    className="relative cursor-pointer group"
                    title="View Profile"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:ring-2 group-hover:ring-primary transition">
                      {getAvatarInitials(activeConversation.name)}
                    </div>
                    {activeConversation.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131217]" />
                    )}
                  </div>

                  <div
                    onClick={() => handleOpenProfile(activeConversation)}
                    className="cursor-pointer group"
                  >
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition flex items-center gap-1.5">
                      <span>{activeConversation.name}</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                      <span className="capitalize font-medium text-primary">
                        {activeConversation.role || "Participant"}
                      </span>
                      <span>•</span>
                      <span>
                        {activeConversation.online ? "Online" : "Offline"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(activeConversation)}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="View User Profile"
                  >
                    <LuUser size={16} />
                  </button>
                  {activeConversation.email && (
                    <a
                      href={`mailto:${activeConversation.email}`}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer"
                      title="Send Email"
                    >
                      <BsEnvelope size={15} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setConversations((prev) =>
                        prev.map((c) =>
                          String(c.id) === String(activeConversation.id)
                            ? { ...c, messages: [] }
                            : c
                        )
                      );
                      toast.info("Conversation cleared locally");
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer"
                    title="Clear Chat Messages"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 styled-scrollbar">
                {displayedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 space-y-2">
                    <LuMessageSquare className="text-3xl text-gray-300 dark:text-gray-600" />
                    <p className="text-xs">
                      No messages exchanged yet. Send a message to begin.
                    </p>
                  </div>
                ) : (
                  displayedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!msg.isMe && (
                          <div className="w-6 h-6 rounded-lg bg-primary/20 dark:bg-primary/30 text-primary dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mb-1">
                            {getAvatarInitials(msg.senderName)}
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.isMe
                              ? "bg-primary text-white rounded-br-xs shadow-xs"
                              : "bg-white dark:bg-[#1A1921] text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-white/10 rounded-bl-xs shadow-xs"
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                      </div>

                      {/* Timestamp & delivery status */}
                      <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <span>{msg.timestamp}</span>
                        {msg.isMe && (
                          <span>
                            {msg.status === "read" ? (
                              <LuCheckCheck
                                size={12}
                                className="text-primary dark:text-emerald-400"
                              />
                            ) : (
                              <LuCheck size={12} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Preset Quick Options for Company Support */}
                {!isStaffUser && (
                  <div className="pt-2 pb-1 space-y-2 max-w-lg">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-1">
                      <LuSparkles className="text-primary dark:text-emerald-400" size={13} />
                      <span>Quick assistance & FAQs:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRESET_OPTIONS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`text-left p-2.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-between group ${
                            preset.action === "live_agent"
                              ? "bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 border-primary/30 text-primary dark:text-emerald-400 font-semibold"
                              : "bg-white dark:bg-[#1A1921] hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-2xs"
                          }`}
                        >
                          <span className="truncate pr-1">{preset.label}</span>
                          {preset.action === "live_agent" && (
                            <LuHeadphones size={13} className="text-primary dark:text-emerald-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 bg-white dark:bg-[#131217] border-t border-gray-200/80 dark:border-white/10 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder={`Message ${activeConversation.name}...`}
                  className="flex-1 h-11 px-4 text-xs bg-secondary dark:bg-[#1A1921] border border-primary/10 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:bg-white dark:focus:bg-[#131217] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition"
                />

                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isSending}
                  className="h-11 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Send</span>
                  {isSending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LuSend size={14} />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-gray-500 space-y-3">
              <LuMessageSquare
                size={48}
                className="text-gray-300 dark:text-gray-600"
              />
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Select a Conversation
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Choose a chat from the left or start a new conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* START NEW CHAT MODAL */}
      {openNewChatModal && (
        <Modal onClose={() => setOpenNewChatModal(false)} customMode>
          <div className="bg-white dark:bg-[#131217] border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Start a New Chat
              </h3>
              <button
                type="button"
                onClick={() => setOpenNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
              >
                <IoMdClose size={18} />
              </button>
            </div>

            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search staff, support or clients..."
                className="w-full h-10 pl-8 pr-3 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl outline-none focus:border-primary"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 styled-scrollbar divide-y divide-gray-50 dark:divide-white/5">
              {filteredNewChatUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No users found
                </div>
              ) : (
                filteredNewChatUsers.map((chatUser) => (
                  <div
                    key={chatUser.id}
                    onClick={() => handleStartDM(chatUser)}
                    className="p-2.5 flex items-center justify-between hover:bg-primary/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                        {getAvatarInitials(chatUser.name)}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
                          {chatUser.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {chatUser.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-primary dark:text-emerald-400 font-semibold">
                      Message
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW PROFILE MODAL */}
      {profileModalOpen && selectedProfileUser && (
        <ViewProfileModal
          conversation={selectedProfileUser}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedProfileUser(null);
          }}
        />
      )}
    </div>
  );
};

export default Communication;
