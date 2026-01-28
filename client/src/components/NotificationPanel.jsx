// components/NotificationPanel.jsx
import { useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  Trash2,
  MessageSquare,
  Users,
  UserPlus,
  Car,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// Simple date formatter
const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "group_message":
      return <MessageSquare size={18} className="text-blue-500" />;
    case "direct_message":
      return <MessageSquare size={18} className="text-purple-500" />;
    case "group_invite":
      return <Users size={18} className="text-green-500" />;
    case "friend_request":
      return <UserPlus size={18} className="text-cyan-500" />;
    case "carpool":
      return <Car size={18} className="text-orange-500" />;
    case "sos":
      return <AlertTriangle size={18} className="text-red-500" />;
    default:
      return <Bell size={18} className="text-gray-500" />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case "group_message":
      return "bg-blue-50 border-blue-200";
    case "direct_message":
      return "bg-purple-50 border-purple-200";
    case "group_invite":
      return "bg-green-50 border-green-200";
    case "friend_request":
      return "bg-cyan-50 border-cyan-200";
    case "carpool":
      return "bg-orange-50 border-orange-200";
    case "sos":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "group_message":
        if (notification.groupId) {
          navigate(`/groups`);
        }
        break;
      case "direct_message":
        navigate(`/friends`);
        break;
      case "group_invite":
        navigate(`/invites`);
        break;
      case "friend_request":
        navigate(`/friends`);
        break;
      case "carpool":
        if (notification.groupId) {
          navigate(`/live-map?groupId=${notification.groupId}`);
        }
        break;
      case "sos":
        if (notification.location) {
          const { lat, lng } = notification.location;
          window.open(
            `https://www.google.com/maps?q=${lat},${lng}`,
            "_blank"
          );
        }
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/20 transition"
        title="Notifications"
      >
        <Bell size={20} className="text-cyan-700" style={{ color: "#0ea5a4" }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-16 right-4 w-96 max-w-[90vw] max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-cyan-100"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-cyan-500 to-teal-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={20} />
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
                      title="Mark all as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
                      title="Clear all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          notification.read
                            ? getNotificationColor(notification.type)
                            : `${getNotificationColor(notification.type)} ring-2 ring-cyan-300`
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4
                                  className={`text-sm font-semibold ${
                                    notification.read
                                      ? "text-gray-700"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <p
                                  className={`text-xs mt-1 ${
                                    notification.read
                                      ? "text-gray-500"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                {notification.type === "carpool" &&
                                  notification.meetupLocation && (
                                    <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                      <MapPin size={12} />
                                      <span>{notification.meetupLocation}</span>
                                    </div>
                                  )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1 rounded hover:bg-gray-200 transition opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} className="text-gray-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

