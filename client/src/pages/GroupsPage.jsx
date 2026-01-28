// src/pages/GroupsPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useNotifications } from "../contexts/NotificationContext";
import {
  Users,
  Send,
  MapPin,
  Crown,
  Search,
  Plus,
  X,
  Navigation,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import VoiceRecorder from "../components/VoiceRecorder";
import VoicePlayer from "../components/VoicePlayer";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:4000/api";
const SOCKET_URL = "http://localhost:4000";

// helper: safely render destination which may be a string or an object
const formatDestination = (dest) => {
  if (!dest) return "Destination not set";
  if (typeof dest === "string") return dest;
  if (typeof dest === "object") {
    if (dest.name) return dest.name;
    if (dest.lat != null && dest.lng != null) {
      return `${Number(dest.lat).toFixed(4)}, ${Number(dest.lng).toFixed(4)}`;
    }
    if (dest.location && typeof dest.location === "object") {
      const l = dest.location;
      if (l.name) return l.name;
      if (l.lat != null && l.lng != null) {
        return `${Number(l.lat).toFixed(4)}, ${Number(l.lng).toFixed(4)}`;
      }
    }
  }
  return String(dest);
};

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [socket, setSocket] = useState(null);
  const [query, setQuery] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();
  const { setActiveGroup } = useNotifications();

  // Track latest messages and unread counts per group
  const [groupLatestMessages, setGroupLatestMessages] = useState({}); // { groupId: { message, timestamp } }
  const [groupUnreadCounts, setGroupUnreadCounts] = useState({}); // { groupId: count }

  // ensure typing indicator persists at least 2s
  const typingTimersRef = useRef({});
  const typingLastRef = useRef({});

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

  useEffect(() => {
    fetchGroups();
    const token = localStorage.getItem("token");
    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    s.on("initialMessages", (msgs) => {
      // Only update if we don't already have messages (to avoid overwriting fetched messages)
      if (msgs && Array.isArray(msgs) && msgs.length > 0) {
        setMessages((prev) => {
          // Merge with existing messages, avoiding duplicates
          const existingIds = new Set(prev.map((m) => m._id?.toString()));
          const newMsgs = msgs.filter(
            (m) => !existingIds.has(m._id?.toString())
          );
          return [...prev, ...newMsgs].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
        scrollToBottom();
      }
    });

    s.on("newMessage", (msg) => {
      // Update messages if this is for the currently selected group
      const msgGroupId = msg.groupId?.toString();
      const currentGroupId = selectedGroup?._id?.toString();

      console.log("New message received:", {
        msgGroupId,
        currentGroupId,
        messageType: msg.messageType,
        hasVoiceUrl: !!msg.voiceUrl,
      });

      if (msgGroupId && msgGroupId === currentGroupId) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some(
            (m) => m._id?.toString() === msg._id?.toString()
          );
          if (exists) {
            console.log("Message already exists, skipping");
            return prev;
          }
          console.log("Adding new message to chat");
          return [...prev, msg];
        });
        scrollToBottom();
      }

      // Update latest message for this group
      const groupId = msg.groupId?.toString();
      if (groupId) {
        setGroupLatestMessages((prev) => ({
          ...prev,
          [groupId]: {
            text:
              msg.text ||
              (msg.messageType === "location"
                ? "📍 Shared a location"
                : msg.messageType === "voice"
                ? "🎤 Voice message"
                : ""),
            fromUserName: msg.fromUserId?.name || "Someone",
            timestamp: msg.createdAt || new Date(),
            messageType: msg.messageType,
          },
        }));

        // Increment unread count if this group is not currently selected
        if (!selectedGroup || selectedGroup._id?.toString() !== groupId) {
          const fromUserId = msg.fromUserId?._id || msg.fromUserId;
          const userId = currentUserId?.toString();

          // Only count as unread if it's not from the current user
          const fromUserIdStr = fromUserId?.toString();
          const userIdStr = userId?.toString();

          if (fromUserIdStr && userIdStr && fromUserIdStr !== userIdStr) {
            setGroupUnreadCounts((prev) => ({
              ...prev,
              [groupId]: (prev[groupId] || 0) + 1,
            }));
          }
        }
      }
    });

    // keep typing indicator for at least 2000ms per user
    s.on("typing", ({ userId, isTyping }) => {
      if (!userId) return;

      if (isTyping) {
        setTypingUsers((prev) => ({ ...prev, [userId]: true }));
        typingLastRef.current[userId] = Date.now();

        if (typingTimersRef.current[userId]) {
          clearTimeout(typingTimersRef.current[userId]);
        }
        typingTimersRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
          });
          delete typingTimersRef.current[userId];
          delete typingLastRef.current[userId];
        }, 2000);
      } else {
        const last = typingLastRef.current[userId] || 0;
        const elapsed = Date.now() - last;
        const remaining = Math.max(0, 2000 - elapsed);

        if (typingTimersRef.current[userId]) {
          clearTimeout(typingTimersRef.current[userId]);
        }
        typingTimersRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
          });
          delete typingTimersRef.current[userId];
          delete typingLastRef.current[userId];
        }, remaining);
      }
    });

    s.on("groupMembers", (m) => setMembers(m || []));
    s.on("groupLocations", (payload) => setMembers(payload || []));

    // Listen for SOS alerts
    s.on("sosAlert", (alert) => {
      toast.error(`🚨 SOS Alert: ${alert.userName} needs help!`, {
        duration: 10000,
        icon: "🚨",
      });
    });

    return () => {
      Object.values(typingTimersRef.current).forEach((t) => clearTimeout(t));
      typingTimersRef.current = {};
      typingLastRef.current = {};
      setActiveGroup(null); // Clear active group when component unmounts
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () =>
    setTimeout(
      () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/groups/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const groupsList = res.data.groups || [];
      setGroups(groupsList);

      // Fetch latest message for each group (simplified - just get the last one)
      const latestMessages = {};

      await Promise.all(
        groupsList.map(async (group) => {
          try {
            const msgRes = await axios.get(
              `${API_URL}/groups/${group._id}/messages`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const groupMessages = msgRes.data.messages || [];
            if (groupMessages.length > 0) {
              // Get the last message (messages are sorted by createdAt: 1, so last is newest)
              const latestMsg = groupMessages[groupMessages.length - 1];
              latestMessages[group._id.toString()] = {
                text:
                  latestMsg.text ||
                  (latestMsg.messageType === "location"
                    ? "📍 Shared a location"
                    : latestMsg.messageType === "voice"
                    ? "🎤 Voice message"
                    : ""),
                fromUserName: latestMsg.fromUserId?.name || "Someone",
                timestamp: latestMsg.createdAt || new Date(),
                messageType: latestMsg.messageType,
              };
            }
          } catch (err) {
            // Silently fail - group might not have messages yet
            console.error(
              `Error fetching messages for group ${group._id}:`,
              err
            );
          }
        })
      );

      setGroupLatestMessages(latestMessages);
    } catch (err) {
      toast.error("Failed to load groups");
      console.error("Error fetching groups:", err?.message || err);
    }
  };

  const openGroup = async (group) => {
    if (!group?._id) return;

    setSelectedGroup(group);
    // Don't clear messages immediately - wait for fetch

    // Set this group as active to suppress notifications
    setActiveGroup(group._id);
    // Mark as read - clear unread count
    setGroupUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[group._id.toString()];
      return updated;
    });

    try {
      const token = localStorage.getItem("token");

      // Fetch members
      const membersRes = await axios.get(
        `${API_URL}/groups/${group._id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMembers(membersRes.data.members || []);

      // Fetch messages from API first
      const messagesRes = await axios.get(
        `${API_URL}/groups/${group._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const fetchedMessages = messagesRes.data.messages || [];
      setMessages(fetchedMessages);
      scrollToBottom();

      // Then join group via socket (this will also send initialMessages, but we already have them)
      if (socket) {
        socket.emit("joinGroup", { groupId: group._id });
      }
    } catch (err) {
      console.error("Error fetching group data:", err);
      toast.error("Failed to load group data");
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;
    socket.emit("sendMessage", {
      groupId: selectedGroup._id,
      text: newMessage,
    });
    setNewMessage("");
  };

  const sendVoiceMessage = (voiceUrl, duration) => {
    if (!selectedGroup || !socket) return;
    console.log("Sending voice message:", {
      groupId: selectedGroup._id,
      duration,
    });
    socket.emit("sendMessage", {
      groupId: selectedGroup._id,
      voiceUrl,
      voiceDuration: duration,
      text: "", // Empty text for voice messages
    });
  };

  const handleTyping = (val) => {
    if (!selectedGroup) return;
    socket.emit("typing", { groupId: selectedGroup._id, isTyping: val });
  };

  const shareLocation = () => {
    if (!selectedGroup) return;
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported by your browser");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        socket.emit("shareLocation", { groupId: selectedGroup._id, lat, lng });
        toast.success("📍 Location shared successfully!");
      },
      () => toast.error("Failed to get location")
    );
  };

  const goToLiveMap = () => {
    if (!selectedGroup) return toast.error("Select a group first!");
    navigate(`/live-map?groupId=${selectedGroup._id}`);
  };

  // Sort groups by latest message timestamp (like WhatsApp)
  const sortedAndFiltered = useMemo(() => {
    const filtered = groups.filter((g) =>
      (g.groupName || "").toLowerCase().includes(query.trim().toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aLatest = groupLatestMessages[a._id?.toString()];
      const bLatest = groupLatestMessages[b._id?.toString()];

      // Groups with latest messages come first
      if (aLatest && bLatest) {
        return new Date(bLatest.timestamp) - new Date(aLatest.timestamp);
      }
      if (aLatest) return -1;
      if (bLatest) return 1;

      // If no messages, sort by updatedAt or createdAt
      const aTime = new Date(a.updatedAt || a.createdAt || 0);
      const bTime = new Date(b.updatedAt || b.createdAt || 0);
      return bTime - aTime;
    });
  }, [groups, query, groupLatestMessages]);

  return (
    <div className="w-screen text-slate-800">
      <main className="max-w-7xl mx-auto flex gap-6 px-4 md:px-6 py-8 h-[calc(100vh-4rem)]">
        <aside className="w-80 flex-shrink-0 bg-white border border-cyan-100 rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
              <Users /> Groups
            </h2>
            <span className="text-sm text-slate-500">
              {sortedAndFiltered.length}
            </span>
          </div>

          <div className="hidden md:flex items-center bg-white border border-cyan-100 rounded-full px-3 py-2 shadow-sm mb-4">
            <Search className="text-cyan-500 mr-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups..."
              className="outline-none text-sm w-full bg-transparent"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {sortedAndFiltered.length === 0 ? (
              <div className="text-sm text-slate-500 p-6 text-center">
                No groups found — create your first group.
              </div>
            ) : (
              sortedAndFiltered.map((group) => {
                const groupName = group?.groupName || "Group";
                const destination = formatDestination(group?.destination || "");
                const groupId = group._id?.toString();
                const latestMsg = groupLatestMessages[groupId];
                const unreadCount = groupUnreadCounts[groupId] || 0;
                const hasUnread = unreadCount > 0;

                return (
                  <motion.div
                    key={group._id}
                    onClick={() => openGroup(group)}
                    layout
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-shadow ${
                      selectedGroup?._id === group._id
                        ? "bg-teal-50 shadow-md border border-teal-100"
                        : hasUnread
                        ? "bg-cyan-50 hover:shadow hover:bg-cyan-100 border-l-2 border-cyan-400"
                        : "hover:shadow hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar / Initials box */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-cyan-100 to-teal-50 flex items-center justify-center text-teal-700 font-bold text-lg">
                          {groupName.slice(0, 2).toUpperCase()}
                        </div>
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`font-semibold truncate ${
                              hasUnread
                                ? "text-slate-900 font-bold"
                                : "text-slate-800"
                            }`}
                          >
                            {groupName}
                          </div>
                          {latestMsg && (
                            <div className="text-xs text-slate-400 flex-shrink-0">
                              {new Date(latestMsg.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                          {latestMsg ? (
                            <>
                              <span
                                className={`truncate ${
                                  hasUnread ? "text-slate-700 font-medium" : ""
                                }`}
                              >
                                {latestMsg.fromUserName}:{" "}
                                {latestMsg.text || "📍 Shared a location"}
                              </span>
                            </>
                          ) : (
                            <>
                              <MapPin size={12} />
                              <span className="truncate">{destination}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/create-group")}
              className={
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 " +
                "bg-gradient-to-r from-teal-500 to-cyan-500 text-white " +
                "rounded-full shadow"
              }
            >
              <Plus size={14} /> Create
            </button>

            <button
              type="button"
              onClick={fetchGroups}
              className="p-2 rounded-full bg-white border border-cyan-100 text-cyan-600"
              title="Refresh groups"
            >
              Refresh
            </button>
          </div>
        </aside>

        <section className="flex-1 bg-white border border-cyan-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-cyan-50 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">
                {selectedGroup ? selectedGroup.groupName : "Select a group"}
              </div>
              <div className="text-xs text-slate-500">
                {selectedGroup
                  ? formatDestination(selectedGroup.destination)
                  : "No destination"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!selectedGroup)
                    return toast.error("Select a group first!");
                  setMembersOpen(true);
                }}
                className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition"
              >
                Members
              </button>

              <button
                onClick={shareLocation}
                className="px-3 py-2 bg-white border border-cyan-100 text-cyan-600 rounded-lg text-sm hover:shadow transition"
              >
                Share Your Location
              </button>

              <button
                onClick={goToLiveMap}
                className="px-3 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg text-sm hover:shadow-lg transition flex items-center gap-2"
                title="Open live map with directions"
              >
                <Navigation size={16} />
                Live Map & Directions
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {!selectedGroup ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Users size={56} className="text-cyan-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Select a group to open the chat
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-md">
                  Choose a group from the left to view messages, share live
                  locations and coordinate with friends.
                </p>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center text-sm text-slate-500">
                    No messages yet — start the conversation!
                  </div>
                )}

                {messages.map((msg, i) => {
                  // Compare user IDs properly (handle both string and ObjectId)
                  const msgUserId =
                    msg.fromUserId?._id || msg.fromUserId?.id || msg.fromUserId;
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
                        className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl shadow-sm ${
                          isMine
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {/* Show sender name only for others' messages */}
                        {!isMine && (
                          <div className="text-xs font-semibold mb-1.5 text-teal-600">
                            {msg.fromUserId?.name || "User"}
                          </div>
                        )}

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
                })}

                {Object.values(typingUsers).some(Boolean) && (
                  <div className="text-sm text-slate-500 italic">
                    Someone is typing...
                  </div>
                )}

                <div ref={messageEndRef} />
              </>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="px-6 py-4 border-t border-cyan-50 flex items-center gap-3 bg-white"
          >
            {selectedGroup && (
              <VoiceRecorder onSend={sendVoiceMessage} onCancel={() => {}} />
            )}
            <input
              type="text"
              placeholder="Write a message..."
              className="flex-1 bg-white border border-cyan-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-200"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(true);
                setTimeout(() => handleTyping(false), 800);
              }}
            />
            <button
              type="submit"
              className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full shadow"
            >
              <Send />
            </button>
          </form>
        </section>

        <AnimatePresence>
          {membersOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/30 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMembersOpen(false)}
              />

              <motion.aside
                className="fixed top-16 right-6 w-80 h-[calc(100vh-6rem)] bg-white border border-cyan-100 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-50">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-teal-700">
                      Members
                    </h4>
                    <span className="text-sm text-slate-500">
                      {members.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setMembersOpen(false)}
                    className="p-2 rounded-full bg-white border border-cyan-100"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3">
                  {members.length === 0 ? (
                    <div className="text-sm text-slate-500 p-6 text-center">
                      No members to show.
                    </div>
                  ) : (
                    members.map((m) => {
                      // Handle both socket format (flattened) and API format (nested)
                      const memberName = m.name || m.userId?.name || "Unknown";
                      const memberEmail = m.email || m.userId?.email || "";
                      const memberInitial =
                        memberName?.slice(0, 1).toUpperCase() || "U";

                      return (
                        <div
                          key={m._id || m.userId?._id || m.userId}
                          className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-100 to-teal-100 flex items-center justify-center text-teal-700 font-medium">
                              {memberInitial}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                {memberName}
                                {m.role === "admin" && (
                                  <Crown
                                    size={14}
                                    className="text-yellow-400"
                                  />
                                )}
                              </div>
                              {memberEmail && (
                                <div className="text-xs text-slate-500">
                                  {memberEmail}
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              m.isOnline
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {m.isOnline ? "Online" : "Offline"}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
