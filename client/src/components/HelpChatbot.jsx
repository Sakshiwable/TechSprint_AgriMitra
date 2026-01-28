// src/components/HelpChatbot.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HelpChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "👋 Hello! I'm your TravelSync assistant. How can I help you with group traveling and navigation today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Knowledge base for travel-related questions
  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    const words = lowerMessage.split(/\s+/);

    // Create groups
    if (
      lowerMessage.includes("create group") ||
      lowerMessage.includes("how to create") ||
      lowerMessage.includes("new group") ||
      (lowerMessage.includes("group") && lowerMessage.includes("create"))
    ) {
      return {
        text: "To create a group:\n1. Click on 'Create' in the navigation bar\n2. Fill in the group name and destination\n3. Invite friends by email\n4. Click 'Create Group'\n\nWould you like me to take you there?",
        action: () => navigate("/create-group"),
        actionLabel: "Go to Create Group",
      };
    }

    // Join groups
    if (
      lowerMessage.includes("join group") ||
      lowerMessage.includes("accept invite") ||
      lowerMessage.includes("invitation")
    ) {
      return {
        text: "To join a group:\n1. Go to 'Requests' in the navigation bar\n2. View pending invitations\n3. Click 'Accept' to join the group\n\nWould you like me to show you?",
        action: () => navigate("/invites"),
        actionLabel: "Go to Invites",
      };
    }

    // Navigation/Live Map
    if (
      lowerMessage.includes("map") ||
      lowerMessage.includes("navigation") ||
          lowerMessage.includes("route") ||
          lowerMessage.includes("directions") ||
          lowerMessage.includes("live map") ||
          lowerMessage.includes("track location")
    ) {
      return {
        text: "Live Map features:\n• View all group members' locations in real-time\n• See routes to destination\n• Get directions and ETAs\n• Share your location with the group\n\nOpen a group chat and click 'Live Map & Directions' button!",
        action: null,
      };
    }

    // Carpool
    if (
      lowerMessage.includes("carpool") ||
      lowerMessage.includes("ride together") ||
          lowerMessage.includes("share ride") ||
          lowerMessage.includes("travel together")
    ) {
      return {
        text: "Carpool feature:\n• Automatically detects if your starting location is on another member's route\n• Suggests meeting points\n• Sends notifications when carpool opportunities are found\n\nJust enable location sharing on the Live Map!",
        action: null,
      };
    }

    // Chat/Messages
    if (
      lowerMessage.includes("chat") ||
      lowerMessage.includes("message") ||
          lowerMessage.includes("send message") ||
          lowerMessage.includes("talk")
    ) {
      return {
        text: "Messaging features:\n• Group chat in each group\n• Direct messages with friends\n• Voice messages\n• Location sharing\n• Real-time notifications\n\nGo to 'Groups' to start chatting!",
        action: () => navigate("/groups"),
        actionLabel: "Go to Groups",
      };
    }

    // SOS Alert
    if (
      lowerMessage.includes("sos") ||
      lowerMessage.includes("emergency") ||
          lowerMessage.includes("help") ||
          lowerMessage.includes("danger")
    ) {
      return {
        text: "🚨 SOS Alert:\n• Click the red SOS button in the navigation bar\n• This sends an alert to all group members with your location\n• Use in emergencies only\n\nStay safe!",
        action: null,
      };
    }

    // Friends
    if (
      lowerMessage.includes("friend") ||
      lowerMessage.includes("add friend") ||
          lowerMessage.includes("invite friend") ||
          lowerMessage.includes("connect")
    ) {
      return {
        text: "To add friends:\n1. Go to 'Invite' in the navigation bar\n2. Enter your friend's email\n3. Send the invitation\n\nTo see your friends, go to 'Friends'!",
        action: () => navigate("/friends"),
        actionLabel: "Go to Friends",
      };
    }

    // Voice messages
    if (
      lowerMessage.includes("voice") ||
      lowerMessage.includes("record") ||
          lowerMessage.includes("audio")
    ) {
      return {
        text: "Voice messages:\n• Click the microphone icon in chat\n• Record your message\n• Send it to the group or friend\n• Perfect for hands-free communication while traveling!",
        action: null,
      };
    }

    // Location sharing
    if (
      lowerMessage.includes("location") ||
      lowerMessage.includes("share location") ||
          lowerMessage.includes("where") ||
          lowerMessage.includes("track")
    ) {
      return {
        text: "Location sharing:\n• Click 'Share Your Location' in group chat\n• Your location updates in real-time\n• Members can see where you are on the Live Map\n• Great for coordinating meetups!",
        action: null,
      };
    }

    // Profile
    if (
      lowerMessage.includes("profile") ||
      lowerMessage.includes("edit profile") ||
          lowerMessage.includes("settings") ||
          lowerMessage.includes("account")
    ) {
      return {
        text: "Profile management:\n• View your profile by clicking your profile icon\n• Edit profile, bio, and avatar\n• See your groups and friends\n• Manage privacy settings",
        action: () => navigate("/profile"),
        actionLabel: "Go to Profile",
      };
    }

    // Notifications
    if (
      lowerMessage.includes("notification") ||
      lowerMessage.includes("alert") ||
          lowerMessage.includes("bell")
    ) {
      return {
        text: "Notifications:\n• Click the bell icon in the navbar\n• Get real-time alerts for:\n  - New messages\n  - Group invites\n  - Carpool suggestions\n  - SOS alerts\n• Mark as read when viewed",
        action: null,
      };
    }

    // General help
    if (
      lowerMessage.includes("what") ||
      lowerMessage.includes("how") ||
          lowerMessage.includes("help") ||
          lowerMessage.includes("guide") ||
          words.includes("?")
    ) {
      return {
        text: "TravelSync helps you:\n✓ Create and manage travel groups\n✓ Track locations in real-time\n✓ Navigate together\n✓ Chat with voice and text\n✓ Find carpool opportunities\n✓ Send emergency SOS alerts\n\nWhat would you like to know more about?",
        action: null,
      };
    }

    // Default responses
    const defaultResponses = [
      "I'm here to help with TravelSync! Try asking about:\n• Creating groups\n• Navigation\n• Chat features\n• Carpool\n• SOS alerts",
      "Hmm, I'm not sure about that. Could you ask about group travel, navigation, or chat features?",
      "I can help with:\n• Group management\n• Live maps\n• Messaging\n• Location sharing\n• Emergency alerts\n\nWhat would you like to know?",
    ];
    return {
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      action: null,
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage.text);
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: botResponse.text,
        timestamp: new Date(),
        action: botResponse.action,
        actionLabel: botResponse.actionLabel,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAction = (action, actionLabel) => {
    if (action) {
      setIsOpen(false);
      action();
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  const quickQuestions = [
    "How do I create a group?",
    "How does navigation work?",
    "What is carpool feature?",
    "How do I send SOS?",
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            aria-label="Open help chatbot"
          >
            <MessageCircle size={24} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col border border-cyan-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">TravelSync Assistant</h3>
                  <p className="text-xs text-white/90">Online • Here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition"
                  aria-label="Minimize"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line break-words">{msg.text}</p>
                    {msg.action && msg.actionLabel && (
                      <button
                        onClick={() => handleAction(msg.action, msg.actionLabel)}
                        className="mt-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-full transition"
                      >
                        {msg.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pt-2 pb-2 bg-white border-t border-gray-100">
                <p className="text-xs text-slate-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-xs px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-full transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-slate-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-200"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpChatbot;

