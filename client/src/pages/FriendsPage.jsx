// src/pages/FriendsPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, UserCheck, Mail, Instagram, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import { useNotifications } from "../contexts/NotificationContext";
import VoiceRecorder from "../components/VoiceRecorder";
import VoicePlayer from "../components/VoicePlayer";

const API_URL = "http://localhost:4000/api";
const SOCKET_URL = "http://localhost:4000";

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { setActiveDirectChat } = useNotifications();

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userId = res.data.user?._id || res.data.user?.id;
          setCurrentUserId(userId);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Setup socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    const handleNewDirectMessage = (msg) => {
      const msgFromId = msg.fromUserId?._id?.toString() || msg.fromUserId?.toString();
      const msgToId = msg.toUserId?._id?.toString() || msg.toUserId?.toString();
      const friendId = selectedFriend?._id?.toString();
      const currentUserIdStr = currentUserId?.toString();
      
      console.log("New direct message received:", { 
        msgFromId, 
        msgToId, 
        friendId, 
        currentUserIdStr, 
        messageType: msg.messageType,
        hasVoiceUrl: !!msg.voiceUrl 
      });
      
      // Check if this message is for the currently selected friend
      if (
        selectedFriend &&
        friendId &&
        (msgFromId === friendId || msgToId === friendId) &&
        (msgFromId === currentUserIdStr || msgToId === currentUserIdStr)
      ) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some(m => m._id?.toString() === msg._id?.toString());
          if (exists) {
            console.log("Message already exists, skipping");
            return prev;
          }
          console.log("Adding new message to chat");
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    s.on("newDirectMessage", handleNewDirectMessage);

    s.on("directTyping", ({ userId, isTyping }) => {
      if (
        selectedFriend &&
        (userId?.toString() === selectedFriend._id?.toString() ||
          userId === selectedFriend._id)
      ) {
        setTyping(isTyping);
      }
    });

    return () => {
      s.off("newDirectMessage", handleNewDirectMessage);
      s.disconnect();
    };
  }, [selectedFriend, currentUserId]);

  // Clear active direct chat when component unmounts
  useEffect(() => {
    return () => {
      setActiveDirectChat(null);
    };
  }, [setActiveDirectChat]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const scrollToBottom = () => {
    setTimeout(
      () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Fetch all group members from all user's groups
      const res = await axios.get(`${API_URL}/groups/all-members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data.friends || []);
    } catch (err) {
      toast.error("Failed to load friends");
      console.error("Error fetching friends:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (friend) => {
    if (!friend?._id) return;
    
    setSelectedFriend(friend);
    setNewMessage("");
    // Set this direct chat as active to suppress notifications
    setActiveDirectChat(friend._id);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/messages/direct/${friend._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedMessages = res.data.messages || [];
      console.log("Fetched messages:", fetchedMessages.length, "messages");
      setMessages(fetchedMessages);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
      setMessages([]); // Set empty array on error
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend || !socket) return;

    socket.emit("sendDirectMessage", {
      toUserId: selectedFriend._id,
      text: newMessage,
    });
    setNewMessage("");
  };

  const sendVoiceMessage = (voiceUrl, duration) => {
    if (!selectedFriend || !socket) return;
    socket.emit("sendDirectMessage", {
      toUserId: selectedFriend._id,
      voiceUrl,
      voiceDuration: duration,
    });
  };

  const handleTyping = (val) => {
    if (!selectedFriend || !socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("directTyping", {
      toUserId: selectedFriend._id,
      isTyping: val,
    });

    if (!val) {
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col bg-linear-to-br from-cyan-50 to-teal-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-teal-700 font-semibold">Loading friends...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-linear-to-br from-cyan-50 to-teal-50 text-slate-800">
      <Navbar />

      <main className="flex-1 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-linear-to-tr from-teal-100 to-cyan-100">
                <Users className="text-teal-700" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  Your Friends
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  {friends.length} friend{friends.length !== 1 ? "s" : ""}{" "}
                  connected
                </p>
              </div>
            </div>
          </div>

          {/* Friends Grid */}
          {friends.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-cyan-100 shadow-sm"
            >
              <div className="p-4 rounded-full bg-linear-to-tr from-cyan-50 to-teal-50 mb-4">
                <Users className="text-teal-600" size={40} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No friends yet
              </h3>
              <p className="text-slate-500 text-center max-w-sm">
                Start connecting with other travelers to share your adventures
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {friends.map((f, index) => (
                  <motion.div
                    key={f._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openChat(f)}
                    className="group bg-white border border-cyan-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className="relative mb-4">
                      <img
                        src={
                          f.avatar ||
                          "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                        }
                        alt={f.name}
                        className="w-20 h-20 rounded-full ring-4 ring-cyan-100 group-hover:ring-teal-200 transition object-cover"
                      />
                      <div className="absolute bottom-0 right-0 p-1 rounded-full bg-teal-500 ring-2 ring-white">
                        <UserCheck size={14} className="text-white" />
                      </div>
                    </div>

                    {/* Name & Email */}
                    <h3 className="font-semibold text-slate-800 text-lg mb-1">
                      {f.name || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-600 text-sm mb-2">
                      <Mail size={14} />
                      <span className="truncate">{f.email || "No email"}</span>
                    </div>

                    {/* Bio */}
                    {f.bio && (
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                        {f.bio}
                      </p>
                    )}

                    {/* Instagram */}
                    {f.instagram && (
                      <div className="flex items-center gap-1 text-pink-600 text-sm mb-2">
                        <Instagram size={14} />
                        <a
                          href={`https://instagram.com/${f.instagram.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          @{f.instagram.replace("@", "")}
                        </a>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                        f.isOnline
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          f.isOnline ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      ></span>
                      <span
                        className={`text-xs font-medium ${
                          f.isOnline ? "text-emerald-700" : "text-slate-600"
                        }`}
                      >
                        {f.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />

      {/* Chat Popup */}
      <AnimatePresence>
        {selectedFriend && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedFriend(null);
                setActiveDirectChat(null);
              }}
            />

            <motion.div
              className="fixed bottom-4 right-4 w-96 h-[600px] bg-white border border-cyan-100 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
              initial={{ x: 400, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 400, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-50 bg-gradient-to-r from-teal-500 to-cyan-500">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedFriend.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                    }
                    alt={selectedFriend.name}
                    className="w-10 h-10 rounded-full ring-2 ring-white object-cover"
                  />
                  <div>
                    <h4 className="text-white font-semibold">
                      {selectedFriend.name || "Unknown"}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedFriend.isOnline
                            ? "bg-emerald-300"
                            : "bg-slate-300"
                        }`}
                      ></span>
                      <span className="text-xs text-white/80">
                        {selectedFriend.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                setSelectedFriend(null);
                setActiveDirectChat(null);
              }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-8">
                    No messages yet — start the conversation!
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const msgUserId =
                      msg.fromUserId?._id ||
                      msg.fromUserId?.id ||
                      msg.fromUserId;
                    const isMine =
                      currentUserId &&
                      (msgUserId?.toString() === currentUserId.toString() ||
                        msgUserId === currentUserId);

                    return (
                      <div
                        key={msg._id || i}
                        className={`flex mb-3 ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                            isMine
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-br-sm"
                              : "bg-white border border-gray-200 text-slate-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.messageType === "text" && (
                            <div
                              className={`text-sm ${
                                isMine ? "text-white" : "text-slate-800"
                              } break-words`}
                            >
                              {msg.text}
                            </div>
                          )}

                          {msg.messageType === "location" && msg.location && (
                            <a
                              href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm underline ${
                                isMine
                                  ? "text-white hover:text-cyan-100"
                                  : "text-cyan-600 hover:text-cyan-700"
                              }`}
                            >
                              📍 Shared a location
                            </a>
                          )}

                          {msg.messageType === "voice" && msg.voiceUrl && (
                            <VoicePlayer
                              audioUrl={msg.voiceUrl}
                              duration={msg.voiceDuration}
                              isMine={isMine}
                            />
                          )}

                          <div
                            className={`text-[10px] mt-2 ${
                              isMine
                                ? "text-white/80 text-right"
                                : "text-slate-500 text-right"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {typing && (
                  <div className="text-sm text-slate-500 italic">
                    {selectedFriend.name} is typing...
                  </div>
                )}

                <div ref={messageEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="px-4 py-3 border-t border-cyan-50 flex items-center gap-3 bg-white"
              >
                {selectedFriend && (
                  <VoiceRecorder
                    onSend={sendVoiceMessage}
                    onCancel={() => {}}
                  />
                )}
                <input
                  type="text"
                  placeholder="Write a message..."
                  className="flex-1 bg-white border border-cyan-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-200 text-sm"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(true);
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                    }
                    typingTimeoutRef.current = setTimeout(() => {
                      handleTyping(false);
                    }, 1000);
                  }}
                />
                <button
                  type="submit"
                  className="p-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full shadow"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
