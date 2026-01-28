// services/notificationService.js

// 🔔 Send alert to a specific group
export const sendGroupAlert = (io, groupId, alert) => {
  io.to(groupId).emit("groupAlert", alert);
};

// ⚠️ Alert when a user is delayed
export const sendDelayAlert = (io, groupId, userName, delayMinutes) => {
  const message = `⚠️ ${userName} is running ${delayMinutes} minutes late.`;
  sendGroupAlert(io, groupId, { type: "delay", message });
};

// 🚗 Alert when user goes off route
export const sendRouteDeviationAlert = (io, groupId, userName) => {
  const message = `🚗 ${userName} has taken a different route!`;
  sendGroupAlert(io, groupId, { type: "deviation", message });
};

// 🟢 Alert when new member joins
export const sendMemberJoinedAlert = (io, groupId, userName) => {
  const message = `🟢 ${userName} joined the group.`;
  sendGroupAlert(io, groupId, { type: "member_joined", message });
};

// 🔴 Alert when member disconnects
export const sendMemberLeftAlert = (io, groupId, userName) => {
  const message = `🔴 ${userName} has gone offline.`;
  sendGroupAlert(io, groupId, { type: "member_left", message });
};
