// contexts/NotificationContext.jsx
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import io from "socket.io-client";
import toast from "react-hot-toast";
import axios from "axios";

const SOCKET_URL = "http://localhost:4000";
const API_URL = "http://localhost:4000/api";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      } catch (e) {
        console.error("Error loading notifications:", e);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Track active chat contexts to suppress notifications (using refs to avoid re-renders)
  const activeGroupIdRef = useRef(null);
  const activeDirectChatUserIdRef = useRef(null);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeDirectChatUserId, setActiveDirectChatUserId] = useState(null);

  // Expose methods to set active chats
  const setActiveGroup = useCallback((groupId) => {
    activeGroupIdRef.current = groupId;
    setActiveGroupId(groupId);
  }, []);

  const setActiveDirectChat = useCallback((userId) => {
    activeDirectChatUserIdRef.current = userId;
    setActiveDirectChatUserId(userId);
  }, []);

  // Define addNotification before it's used in useEffect
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [newNotification, ...prev].slice(0, 100)); // Keep last 100
    setUnreadCount((prev) => prev + 1);
    
    // Show toast for important notifications
    if (notification.type === "sos") {
      toast.error(`🚨 ${notification.title}: ${notification.message}`, {
        duration: 10000,
        icon: "🚨",
      });
    } else if (notification.type === "carpool") {
      toast.success(`🚗 ${notification.message}`, {
        duration: 5000,
        icon: "🚗",
      });
    } else {
      toast(notification.message, {
        icon: "🔔",
        duration: 3000,
      });
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    // Fetch current user ID immediately
    const fetchCurrentUserId = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = res.data.user?._id || res.data.user?.id;
        if (userId) {
          localStorage.setItem("userId", userId.toString());
        }
        return userId;
      } catch (err) {
        console.error("Error fetching user ID:", err);
        return null;
      }
    };

    // Fetch user ID immediately
    fetchCurrentUserId();

    // Listen for new group messages
    const handleNewMessage = (msg) => {
      const groupId = msg.groupId;
      const fromUserId = msg.fromUserId?._id || msg.fromUserId;
      const fromUserName = msg.fromUserId?.name || "Someone";
      
      // Don't notify if it's your own message
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      
      // Handle both string and object ID comparisons
      const fromUserIdStr = fromUserId?.toString();
      const userIdStr = userId?.toString();
      
      if (!fromUserIdStr || !userIdStr) return;
      if (fromUserIdStr === userIdStr) return;
      
      // Also check if fromUserId is an object with _id
      if (typeof fromUserId === 'object' && fromUserId?._id) {
        if (fromUserId._id.toString() === userIdStr) return;
      }

      // Don't notify if user is actively viewing this group's chat
      const currentActiveGroup = activeGroupIdRef.current;
      if (currentActiveGroup && currentActiveGroup.toString() === groupId?.toString()) {
        return;
      }

      const messageText = msg.text || 
        (msg.messageType === "location" ? "📍 Shared a location" : 
         msg.messageType === "voice" ? "🎤 Sent a voice message" : 
         "Sent a message");
      
      addNotification({
        type: "group_message",
        title: `💬 ${fromUserName} in group chat`,
        message: messageText,
        groupId,
        fromUserId,
        fromUserName,
        timestamp: new Date(),
        read: false,
      });
    };

    s.on("newMessage", handleNewMessage);

    // Listen for new direct messages
    const handleNewDirectMessage = (msg) => {
      const fromUserId = msg.fromUserId?._id || msg.fromUserId;
      const toUserId = msg.toUserId?._id || msg.toUserId;
      const fromUserName = msg.fromUserId?.name || "Someone";
      
      // Don't notify if it's your own message
      const userId = localStorage.getItem("userId");
      if (!userId || fromUserId?.toString() === userId.toString()) return;

      // Don't notify if user is actively viewing this direct chat
      const currentActiveDirectChat = activeDirectChatUserIdRef.current;
      if (currentActiveDirectChat && 
          (currentActiveDirectChat.toString() === fromUserId?.toString() || 
           currentActiveDirectChat.toString() === toUserId?.toString())) {
        return;
      }

      const messageText = msg.text || 
        (msg.messageType === "location" ? "📍 Shared a location" : 
         msg.messageType === "voice" ? "🎤 Sent a voice message" : 
         "Sent a message");

      addNotification({
        type: "direct_message",
        title: `💬 ${fromUserName}`,
        message: messageText,
        fromUserId,
        fromUserName,
        toUserId,
        timestamp: new Date(),
        read: false,
      });
    };

    s.on("newDirectMessage", handleNewDirectMessage);

    // Listen for group invitations
    s.on("groupInvite", (data) => {
      addNotification({
        type: "group_invite",
        title: "Group Invitation",
        message: `${data.inviterName || "Someone"} invited you to join ${data.groupName || "a group"}`,
        groupId: data.groupId,
        inviterId: data.inviterId,
        inviterName: data.inviterName,
        timestamp: new Date(),
        read: false,
      });
    });

    // Listen for friend requests
    s.on("friendRequest", (data) => {
      addNotification({
        type: "friend_request",
        title: "Friend Request",
        message: `${data.fromName || "Someone"} sent you a friend request`,
        fromUserId: data.fromId,
        fromUserName: data.fromName,
        timestamp: new Date(),
        read: false,
      });
    });

    // Listen for carpool suggestions
    s.on("carpoolSuggestion", (data) => {
      addNotification({
        type: "carpool",
        title: "🚗 Carpool Opportunity!",
        message: `You and ${data.memberName} can carpool together from ${data.meetupLocation || "a nearby location"}`,
        memberId: data.memberId,
        memberName: data.memberName,
        meetupLocation: data.meetupLocation,
        meetupLat: data.meetupLat,
        meetupLng: data.meetupLng,
        groupId: data.groupId,
        timestamp: new Date(),
        read: false,
      });
    });

    // Listen for SOS alerts
    s.on("sosAlert", (alert) => {
      addNotification({
        type: "sos",
        title: "🚨 SOS Alert",
        message: `${alert.userName} needs immediate help!`,
        userId: alert.userId,
        userName: alert.userName,
        location: alert.location,
        timestamp: new Date(),
        read: false,
      });
    });

    return () => {
      s.off("newMessage", handleNewMessage);
      s.off("newDirectMessage", handleNewDirectMessage);
      s.disconnect();
    };
  }, [addNotification]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("notifications");
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        setActiveGroup,
        setActiveDirectChat,
        activeGroupId,
        activeDirectChatUserId,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

