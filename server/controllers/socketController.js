// controllers/socketController.js
import GroupMember from "../models/GroupMember.js";
import { sendDelayAlert, sendRouteDeviationAlert } from "../services/notificationService.js";
import { calculateETA, checkRouteDeviation } from "../services/googleApi.js";

// 🟢 When a user joins a group
export const handleJoinGroup = async (io, socket, { groupId, userId }) => {
  socket.join(groupId);
  console.log(`👥 User ${userId} joined group ${groupId}`);

  await GroupMember.findOneAndUpdate(
    { groupId, userId },
    { isOnline: true },
    { new: true }
  );

  io.to(groupId).emit("friendJoined", { userId });
};

// 📍 Handle location update
export const handleLocationUpdate = async (io, socket, { groupId, lat, lng, destination }) => {
  if (!groupId || !lat || !lng) return;

  // Update location in database
  await GroupMember.findOneAndUpdate(
    { userId: socket.userId, groupId },
    { lastLocation: { lat, lng, updatedAt: new Date() } },
    { new: true }
  );

  // Calculate ETA (mock example: distance in minutes)
  const randomETA = Math.floor(Math.random() * 10) + 1; // just for now
  const isOffRoute = checkRouteDeviation(lat, lng, destination.lat, destination.lng);

  // Send updated location to group
  io.to(groupId).emit("groupLocations", {
    userId: socket.userId,
    lat,
    lng,
    eta: randomETA,
  });

  // Alerts
  if (randomETA > 8) {
    sendDelayAlert(io, groupId, "User", randomETA);
  }

  if (isOffRoute) {
    sendRouteDeviationAlert(io, groupId, "User");
  }
};

// 🔴 When a user disconnects
export const handleDisconnect = async (io, socket) => {
  console.log(`🔴 User disconnected: ${socket.id}`);

  await GroupMember.findOneAndUpdate(
    { userId: socket.userId },
    { isOnline: false }
  );
};
