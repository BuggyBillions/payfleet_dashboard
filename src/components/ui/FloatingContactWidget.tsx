import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LuX,
  LuSend,
  LuPhone,
  LuMail,
  LuClock,
  LuCircleCheck,
} from "react-icons/lu";
import { BsChatDotsFill } from "react-icons/bs";
import { RiCustomerService2Fill } from "react-icons/ri";

interface Message {
  id: number;
  sender: "user" | "support";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    sender: "support",
    text: "Hello! Welcome to Payfleet Support. How can we assist you with your payroll or deposit today?",
    time: "Just now",
  },
];

const FloatingContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "contact">("chat");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate smart support automated reply
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: Message = {
        id: Date.now() + 1,
        sender: "support",
        text: "Thank you for reaching out! A Payfleet support representative has been assigned and will reply shortly. You can also reach us via support@payfleet.io.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Drawer / Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-90 sm:w-95 h-130 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="bg-primary text-white px-5 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white">
                    <RiCustomerService2Fill size={22} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight text-white">Payfleet Help Desk</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span>Support Agents Online</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <LuX size={18} />
              </button>
            </div>

            {/* Navigation tabs */}
            <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`py-2.5 text-center transition border-b-2 cursor-pointer ${
                  activeTab === "chat"
                    ? "border-primary text-primary bg-white font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Live Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contact")}
                className={`py-2.5 text-center transition border-b-2 cursor-pointer ${
                  activeTab === "contact"
                    ? "border-primary text-primary bg-white font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Contact Channels
              </button>
            </div>

            {/* TAB 1: LIVE CHAT */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-gray-50/50">
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 styled-scrollbar">
                  <div className="text-center my-1">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-primary text-white rounded-br-xs shadow-xs"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs shadow-2xs"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-1 bg-white border border-gray-100 px-3 py-2 rounded-2xl w-14 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 h-10 px-3.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition cursor-pointer shrink-0 shadow-xs"
                  >
                    <LuSend size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CONTACT CHANNELS */}
            {activeTab === "contact" && (
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/50">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-800">Direct Support Lines</h4>
                  <p className="text-[11px] text-gray-500">
                    Get in touch directly with our business operations and support team.
                  </p>
                </div>

                {/* Email Support */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <LuMail size={15} />
                      <span>Email Support</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("support@payfleet.io");
                        toast.success("Support email copied!");
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">support@payfleet.io</p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1">
                    <LuClock size={11} />
                    <span>Response within 1 business hour</span>
                  </div>
                </div>

                {/* Phone Hotline */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <LuPhone size={15} />
                      <span>Phone Hotline</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("+234 800 PAYFLEET");
                        toast.success("Phone number copied!");
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">+234 800 PAYFLEET (0800 72935338)</p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1">
                    <LuCircleCheck size={11} className="text-green-600" />
                    <span>Mon - Fri, 8:00 AM - 6:00 PM WAT</span>
                  </div>
                </div>

                {/* SLA Notice */}
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-[11px] text-gray-600 leading-relaxed">
                  💡 <strong>Dedicated Business Support:</strong> Priority routing is enabled for all salary disbursements and deposit verifications.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative group h-14 px-4 rounded-full bg-primary hover:bg-primary/95 text-white shadow-xl hover:shadow-2xl flex items-center gap-2.5 transition cursor-pointer border-2 border-white/20"
      >
        {/* Pulsing online indicator */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400 border border-white" />
        </span>

        {isOpen ? (
          <>
            <LuX size={20} className="text-white" />
            <span className="text-xs font-bold pr-1">Close</span>
          </>
        ) : (
          <>
            <BsChatDotsFill size={18} className="text-white" />
            <span className="text-xs font-bold pr-1">Support Chat</span>
          </>
        )}

        {/* Hover Tooltip (when closed) */}
        {!isOpen && (
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
            Need help? Contact Payfleet Support
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingContactWidget;
