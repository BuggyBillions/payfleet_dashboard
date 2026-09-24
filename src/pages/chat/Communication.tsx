import React, { useState, useMemo, useRef, useEffect } from "react";
import ActionButton from "../../components/ui/ActionButton";
import Modal from "../../components/modal/Modal";
import { toast } from "sonner";
import {
  LuSearch,
  LuSend,
  LuArrowLeft,
  LuPlus,
  LuCheck,
  LuCheckCheck,
  LuUsers,
  LuMessageSquare,
  LuTrash2,
} from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { BsEnvelope } from "react-icons/bs";
import type { ChatUser, ChatMessage, Conversation } from "../../lib/interfaces";
export type { ChatUser, ChatMessage, Conversation };

const MOCK_USERS: ChatUser[] = [
  { id: 101, name: "Sarah Jenkins", email: "sarah.j@payfleet.io", role: "Super Admin", online: true },
  { id: 102, name: "Michael Adebayo", email: "michael.a@payfleet.io", role: "Finance Manager", online: true },
  { id: 103, name: "Chiamaka Eze", email: "chiamaka.e@payfleet.io", role: "Support Specialist", online: false },
  { id: 104, name: "David Johnson", email: "david.j@payfleet.io", role: "HR & Operations", online: true },
  { id: 105, name: "Fatima Aliyu", email: "fatima.a@payfleet.io", role: "Compliance Lead", online: false },
  { id: 106, name: "Acme Tech Support", email: "support@acmetech.io", role: "Client Rep", online: true },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    name: "Sarah Jenkins",
    type: "chat",
    role: "Super Admin",
    online: true,
    unread: 2,
    lastMessage: "Please review the batch salary disbursement for review.",
    lastMessageTime: "12:45 PM",
    messages: [
      {
        id: 1,
        senderId: 101,
        senderName: "Sarah Jenkins",
        text: "Hi there! Welcome to the Payfleet team communication channel.",
        timestamp: "12:30 PM",
        isMe: false,
        status: "read",
      },
      {
        id: 2,
        senderId: 999,
        senderName: "Me",
        text: "Hello Sarah! Thanks. Working on the deposit verifications now.",
        timestamp: "12:35 PM",
        isMe: true,
        status: "read",
      },
      {
        id: 3,
        senderId: 101,
        senderName: "Sarah Jenkins",
        text: "Please review the batch salary disbursement for review.",
        timestamp: "12:45 PM",
        isMe: false,
        status: "delivered",
      },
    ],
  },
  {
    id: "conv-2",
    name: "Michael Adebayo",
    type: "chat",
    role: "Finance Manager",
    online: true,
    unread: 0,
    lastMessage: "Deposit PF-DEP-849202 has been verified and settled.",
    lastMessageTime: "11:20 AM",
    messages: [
      {
        id: 1,
        senderId: 102,
        senderName: "Michael Adebayo",
        text: "Deposit PF-DEP-849202 has been verified and settled.",
        timestamp: "11:20 AM",
        isMe: false,
        status: "read",
      },
    ],
  },
  {
    id: "conv-3",
    name: "Chiamaka Eze",
    type: "chat",
    role: "Support Specialist",
    online: false,
    unread: 0,
    lastMessage: "Let me know if the client requires another payment link.",
    lastMessageTime: "Yesterday",
    messages: [
      {
        id: 1,
        senderId: 103,
        senderName: "Chiamaka Eze",
        text: "Let me know if the client requires another payment link.",
        timestamp: "Yesterday, 4:15 PM",
        isMe: false,
        status: "read",
      },
    ],
  },
];

const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "groups" | "announcements">("chat");
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string>("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [tabToShow, setTabToShow] = useState<"sidebar" | "main">("sidebar");

  // Modals
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Active Conversation Object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || conversations[0] || null;
  }, [conversations, activeChatId]);

  // Filter conversations by search and active tab
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesTab = conv.type === activeTab;
      const matchesSearch =
        searchQuery.trim() === "" ||
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [conversations, activeTab, searchQuery]);

  // Scroll to bottom of message view
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  // Send Message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || !activeConversation) return;

    const messageText = inputMsg.trim();
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: Date.now(),
      senderId: 999,
      senderName: "Me",
      text: messageText,
      timestamp: timeString,
      isMe: true,
      status: "sent",
    };

    // Update conversation state
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversation.id) {
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

    // Simulate smart auto-reply if direct chat
    if (activeConversation.type === "chat") {
      setTimeout(() => {
        setIsTyping(true);
      }, 600);

      setTimeout(() => {
        setIsTyping(false);
        const replyMsg: ChatMessage = {
          id: Date.now() + 1,
          senderId: 101,
          senderName: activeConversation.name,
          text: `Got it! Thanks for the update regarding "${messageText.slice(0, 30)}${messageText.length > 30 ? "..." : ""}". I am on it.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
          status: "read",
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === activeConversation.id) {
              return {
                ...conv,
                lastMessage: replyMsg.text,
                lastMessageTime: replyMsg.timestamp,
                messages: [...conv.messages, replyMsg],
              };
            }
            return conv;
          })
        );
      }, 2000);
    }
  };

  // Start direct conversation with selected user
  const handleStartDM = (user: ChatUser) => {
    const existing = conversations.find(
      (c) => c.type === "chat" && c.name.toLowerCase() === user.name.toLowerCase()
    );

    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        name: user.name,
        type: "chat",
        role: user.role,
        online: user.online,
        unread: 0,
        lastMessage: "Started new conversation",
        lastMessageTime: "Just now",
        messages: [
          {
            id: Date.now(),
            senderId: user.id,
            senderName: user.name,
            text: `Hi! This is ${user.name} (${user.role}). How can I help you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: false,
            status: "read",
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveChatId(newConv.id);
    }

    setOpenNewChatModal(false);
    setTabToShow("main");
    toast.success(`Chat with ${user.name} opened`);
  };


  const getAvatarInitials = (name: string) => {
    const parts = name.replace("#", "").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const filteredNewChatUsers = useMemo(() => {
    if (!userSearchTerm.trim()) return MOCK_USERS;
    const term = userSearchTerm.toLowerCase();
    return MOCK_USERS.filter(
      (u) => u.name.toLowerCase().includes(term) || u.role.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [userSearchTerm]);

  return (
    <div className="flex flex-col h-[calc(100vh-115px)] w-full bg-white dark:bg-[#131217] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden font-sans">
      {/* Top Header Bar with Tabs & Action Buttons */}
      <div className="px-5 py-3.5 bg-white dark:bg-[#131217] border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-secondary dark:bg-[#1A1921] rounded-xl border border-primary/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "chat"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <LuMessageSquare size={14} />
            <span>Direct Chats</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("groups")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "groups"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <LuUsers size={14} />
            <span>Team Members</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <ActionButton
            text="New Chat"
            icon={<LuPlus size={15} />}
            onClick={() => setOpenNewChatModal(true)}
            overideBg={true}
            buttonStyle="text-xs bg-primary hover:bg-primary/90 text-white h-9 py-1 px-3 rounded-xl shadow-xs"
          />
        </div>
      </div>

      {/* Main Split Layout: Sidebar & Chat Window */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-88 border-r border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#131217] flex flex-col ${
            tabToShow === "main" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search box */}
          <div className="p-3.5 border-b border-gray-100 dark:border-white/10">
            <div className="relative">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages & people..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-secondary dark:bg-[#1A1921] border border-primary/10 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5 styled-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 space-y-2">
                <LuMessageSquare className="mx-auto text-2xl text-gray-300 dark:text-gray-600" />
                <p className="text-xs">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeChatId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveChatId(conv.id);
                      setTabToShow("main");
                      // Clear unread
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
                      );
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                      isSelected
                        ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {getAvatarInitials(conv.name)}
                      </div>
                      {conv.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-[#131217]" />
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

        {/* RIGHT AREA: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-[#F9FAFB]/60 dark:bg-[#1A1921]/60 ${
            tabToShow === "sidebar" ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 bg-white dark:bg-[#131217] border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTabToShow("sidebar")}
                    className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer"
                  >
                    <LuArrowLeft size={18} />
                  </button>

                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {getAvatarInitials(activeConversation.name)}
                    </div>
                    {activeConversation.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-[#131217]" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      {activeConversation.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {activeConversation.online ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Send Email / Message"
                    onClick={() => {
                      toast.info("Voice call connecting...");
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <BsEnvelope size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConversations((prev) =>
                        prev.filter((c) => c.id !== activeConversation.id)
                      );
                      toast.success("Conversation cleared");
                    }}
                    title="Clear conversation"
                    className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition cursor-pointer"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Message Bubbles Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 styled-scrollbar">
                {activeConversation.messages.map((msg) => (
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
                            : "bg-white dark:bg-[#1A1921] text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-white/10 rounded-bl-xs shadow-2xs"
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
                            <LuCheckCheck size={12} className="text-primary dark:text-emerald-400" />
                          ) : (
                            <LuCheck size={12} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing status */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1 bg-white dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 px-3 py-2 rounded-2xl shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {activeConversation.name} is typing...
                    </span>
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
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder={`Message ${activeConversation.name}...`}
                  className="flex-1 h-11 px-4 text-xs bg-secondary dark:bg-[#1A1921] border border-primary/10 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:bg-white dark:focus:bg-[#131217] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition"
                />

                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="h-11 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Send</span>
                  <LuSend size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-gray-500 space-y-3">
              <LuMessageSquare size={48} className="text-gray-300 dark:text-gray-600" />
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Start a New Chat</h3>
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
                placeholder="Search staff, support or admins..."
                className="w-full h-10 pl-8 pr-3 text-xs bg-gray-50 dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl outline-none focus:border-primary"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 styled-scrollbar divide-y divide-gray-50 dark:divide-white/5">
              {filteredNewChatUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartDM(user)}
                  className="p-2.5 flex items-center justify-between hover:bg-primary/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {getAvatarInitials(user.name)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
                        {user.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary dark:text-emerald-400 font-semibold">
                    Message
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Communication;
