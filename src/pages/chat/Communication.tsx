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

import {
  CompanyLogoAvatar as AvatarDisplay,
  getCompanyLogoUrl,
  getAvatarInitials,
} from "../../helpers/logoHelper";

export { AvatarDisplay, getCompanyLogoUrl, getAvatarInitials };

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
      location.pathname.startsWith("/admin")
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

  const { data: staffData } = useStaffs({
    page: 1,
    per_page: 50,
    role: "all",
    enabled: isAdminUser && openNewChatModal,
  });
  const { data: companyData } = useCompanies({
    page: 1,
    per_page: 100,
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

  // Build logo lookup map from companies list
  const companyLogoMap = useMemo(() => {
    const map = new Map<string, string>();
    (companyData?.items || []).forEach((c) => {
      const logo = c.logo;
      if (logo) {
        if (c.id) map.set(String(c.id).toLowerCase(), logo);
        if (c.name) map.set(c.name.trim().toLowerCase(), logo);
        if (c.companyName) map.set(c.companyName.trim().toLowerCase(), logo);
        if (c.email) map.set(c.email.trim().toLowerCase(), logo);
      }
    });
    return map;
  }, [companyData?.items]);

  const getConversationLogo = (conv?: Conversation | null): string | null => {
    if (!conv) return null;
    if (conv.logo) return conv.logo;
    if (conv.avatar) return conv.avatar;
    const idMatch = companyLogoMap.get(String(conv.id).toLowerCase());
    if (idMatch) return idMatch;
    const nameMatch = companyLogoMap.get(String(conv.name).trim().toLowerCase());
    if (nameMatch) return nameMatch;
    if (conv.email) {
      const emailMatch = companyLogoMap.get(conv.email.trim().toLowerCase());
      if (emailMatch) return emailMatch;
    }
    return null;
  };

  // Build real user list for New Chat Modal
  const availableUsers: ChatUser[] = useMemo(() => {
    const comps = (companyData?.items || []).map((c, idx) => ({
      id: Number(c.id || idx + 1),
      name: c.name || c.companyName || "Corporate Client",
      email: c.email || "",
      role: "Company Client",
      logo: c.logo || null,
      avatar: c.logo || null,
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
              logo: sc.logo || existing.logo || getConversationLogo(sc),
              avatar: sc.avatar || existing.avatar || getConversationLogo(sc),
              messages: [...messagesToKeep, ...existingCustomPending],
            };
          }
          return {
            ...sc,
            logo: sc.logo || getConversationLogo(sc),
            avatar: sc.avatar || getConversationLogo(sc),
          };
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
              logo: singleConvData.logo || c.logo || getConversationLogo(singleConvData),
              avatar: singleConvData.avatar || c.avatar || getConversationLogo(singleConvData),
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
        logo: selectedUser.logo || selectedUser.avatar,
        avatar: selectedUser.avatar || selectedUser.logo,
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
    <div className="flex flex-col h-full min-h-0 w-full bg-white dark:bg-[#131217] rounded-xl md:rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden font-sans">
      {/* Main Split Layout: Sidebar & Chat Window */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT SIDEBAR: Conversation List */}
        <div
          className={`w-full md:w-72 lg:w-80 xl:w-88 border-r border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#131217] flex flex-col relative shrink-0 min-h-0 ${
            tabToShow === "main" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Action Buttons */}
          <div className="flex items-center gap-2 absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20">
            <button
              onClick={() => setOpenNewChatModal(true)}
              className="text-xs bg-primary hover:bg-primary/90 text-white h-10 px-3.5 rounded-xl shadow-lg group flex items-center gap-2 transition-all cursor-pointer"
            >
              <LuPlus
                size={16}
                className="group-hover:rotate-90 transition-all duration-300"
              />
              <span className="font-semibold">
                New chat
              </span>
            </button>
          </div>

          {/* Search box */}
          <div className="p-2.5 sm:p-3.5 border-b border-gray-100 dark:border-white/10 shrink-0">
            <div className="relative">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-9 sm:h-10 pl-9 pr-3 text-xs bg-secondary dark:bg-[#1A1921] border border-primary/10 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5 styled-scrollbar">
            {isLoading && conversations.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-400 dark:text-gray-500 space-y-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-400 dark:text-gray-500 space-y-2">
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
                    className={`p-2.5 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 cursor-pointer transition ${
                      isSelected
                        ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-b-0 border-primary"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Avatar with company logo or initials */}
                    <div className="relative shrink-0">
                      <AvatarDisplay
                        name={conv.name}
                        logo={getConversationLogo(conv)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl"
                      />
                      {conv.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131217]" />
                      )}
                    </div>

                    {/* Conversation preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 gap-1">
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
          className={`flex-1 flex flex-col min-w-0 min-h-0 bg-gray-50/40 dark:bg-[#0D0C10] ${
            tabToShow === "sidebar" ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 bg-white dark:bg-[#131217] border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between shadow-2xs shrink-0 gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setTabToShow("sidebar")}
                    className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg cursor-pointer shrink-0 transition"
                    aria-label="Back to conversations"
                  >
                    <LuArrowLeft size={18} />
                  </button>

                  <div
                    onClick={() => handleOpenProfile(activeConversation)}
                    className="relative shrink-0 cursor-pointer group"
                    title="View Profile"
                  >
                    <AvatarDisplay
                      name={activeConversation.name}
                      logo={getConversationLogo(activeConversation)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl group-hover:ring-2 group-hover:ring-primary transition"
                    />
                    {activeConversation.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131217]" />
                    )}
                  </div>

                  <div
                    onClick={() => handleOpenProfile(activeConversation)}
                    className="cursor-pointer group min-w-0 flex-1"
                  >
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition flex items-center gap-1.5 truncate">
                      <span className="truncate">{activeConversation.name}</span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5 truncate">
                        {activeConversation.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(activeConversation)}
                    className="p-1.5 sm:p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="View User Profile"
                  >
                    <LuUser size={16} />
                  </button>
                  {activeConversation.email && (
                    <a
                      href={`mailto:${activeConversation.email}`}
                      className="p-1.5 sm:p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer"
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
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer"
                    title="Clear Chat Messages"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto space-y-3 sm:space-y-4 styled-scrollbar min-h-0">
                {displayedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 space-y-2 p-4">
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
                      <div className="flex items-end gap-1.5 sm:gap-2 max-w-[90%] sm:max-w-[80%] md:max-w-[75%]">
                        {!msg.isMe && (
                          <AvatarDisplay
                            name={msg.senderName}
                            logo={msg.logo || msg.avatar || getConversationLogo(activeConversation)}
                            className="w-6 h-6 rounded-lg mb-1"
                            textClassName="text-[10px] font-bold"
                          />
                        )}

                        <div
                          className={`p-2.5 sm:p-3 rounded-2xl text-xs leading-relaxed break-words [overflow-wrap:anywhere] ${
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
                  <div className="pt-2 pb-1 space-y-2 w-full max-w-full sm:max-w-lg">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-1">
                      <LuSparkles className="text-primary dark:text-emerald-400" size={13} />
                      <span>Quick assistance & FAQs:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {PRESET_OPTIONS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`text-left p-2 sm:p-2.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-between group ${
                            preset.action === "live_agent"
                              ? "bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 border-primary/30 text-primary dark:text-emerald-400 font-semibold"
                              : "bg-white dark:bg-[#1A1921] hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-2xs"
                          }`}
                        >
                          <span className="truncate pr-1 text-[11px] sm:text-xs">{preset.label}</span>
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
                className="p-2.5 sm:p-3.5 bg-tertiary dark:bg-[#131217] border-t border-gray-200/80 dark:border-white/10 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder={`Message ${activeConversation.name}...`}
                  className="flex-1 min-w-0 h-10 sm:h-11 px-3 sm:px-4 text-xs bg-secondary dark:bg-[#1A1921] border border-primary/10 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:bg-white dark:focus:bg-[#131217] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition"
                />

                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isSending}
                  className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-primary hover:bg-primary/95 text-white disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1.5 sm:gap-2 shadow-xs transition cursor-pointer shrink-0"
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 text-gray-400 dark:text-gray-500 space-y-3">
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
          <div className="bg-white dark:bg-[#131217] border border-gray-100 dark:border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full mx-auto shadow-2xl space-y-3 sm:space-y-4">
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
                className="w-full h-9 sm:h-10 pl-8 pr-3 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl outline-none focus:border-primary"
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
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AvatarDisplay
                        name={chatUser.name}
                        logo={chatUser.logo || chatUser.avatar}
                        className="w-8 h-8 rounded-lg"
                        textClassName="text-xs font-bold"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                          {chatUser.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {chatUser.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-primary dark:text-emerald-400 font-semibold shrink-0 ml-2">
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
