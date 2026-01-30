import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Bot, User, RefreshCw, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { generateResponse } from "../utils/chatbotLogic";

export default function ChatbotPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: language === "hi" ? "नमस्ते! मैं एग्री-मित्र, आपका एआई सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?" 
           : language === "mr" ? "नमस्कार! मी ॲग्री-मित्र, तुमचा एआय सहाय्यक. मी तुम्हाला कशी मदत करू?"
           : "Hello! I am Agri-Mitra, your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Call Python Chatbot API
    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: userMsg.text,
        language: language // passed from context
      });
      
      const botMsg = {
        id: Date.now() + 1,
        text: res.data.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I am having trouble connecting to the server.",
        sender: "bot",
        timestamp: new Date(),
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-10 px-4 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="p-2 bg-white/20 rounded-full">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Agri-Mitra AI</h2>
              <p className="text-xs text-cyan-100 opacity-90">Always here to help</p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([])}
            className="p-2 hover:bg-white/20 rounded-full transition"
            title="Clear Chat"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-tr from-teal-500 to-cyan-500 text-white rounded-br-sm" 
                      : "bg-white border border-gray-200 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className={`text-[10px] mt-2 block text-right ${msg.sender === "user" ? "text-white/80" : "text-slate-400"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("askSomething") || "Ask something..."}
            className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-full text-white shadow-md transition-all ${
              !input.trim() || isTyping 
                ? "bg-slate-300 cursor-not-allowed" 
                : "bg-teal-600 hover:bg-teal-700 hover:scale-105 active:scale-95"
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
