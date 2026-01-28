// server/controllers/alertController.js
import SOSAlert from "../models/SOSAlert.js";
import User from "../models/User.js";
import GroupMember from "../models/GroupMember.js";
import Friend from "../models/Friend.js";
import GroupMessage from "../models/GroupMessage.js";
import DirectMessage from "../models/DirectMessage.js";
import { getIO } from "../sockets/index.js";

// 🚨 Send SOS Alert
export const sendSOSAlert = async (req, res) => {
  try {
    const userId = req.userId;
    const { location, message } = req.body;

    // Get user info
    const user = await User.findById(userId).select("name email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create SOS alert
    const sosAlert = await SOSAlert.create({
      userId,
      location: location || null,
      message: message || "",
      status: "active",
    });

    // Get all groups user is part of
    const userGroups = await GroupMember.find({ userId }).distinct("groupId");

    // Send SOS to all groups
    for (const groupId of userGroups) {
      const alertMessage = await GroupMessage.create({
        groupId,
        fromUserId: userId, // Use the user's ID for the SOS message
        text: `🚨 SOS ALERT: ${user.name} needs immediate help! ${message || ""}`,
        messageType: "text",
      });

      // Emit to socket
      const io = getIO();
      if (io) {
        const populatedAlert = await GroupMessage.findById(alertMessage._id).populate(
          "fromUserId",
          "name email"
        );
        io.to(groupId.toString()).emit("newMessage", populatedAlert);
        io.to(groupId.toString()).emit("sosAlert", {
          userId,
          userName: user.name,
          userEmail: user.email,
          location,
          message,
          alertId: sosAlert._id,
          timestamp: new Date(),
        });
      }
    }

    // Get all friends (accepted friends)
    const friends = await Friend.find({
      $or: [{ userId, status: "accepted" }, { friendId: userId, status: "accepted" }],
    });

    // Send SOS to all friends via direct messages
    for (const friend of friends) {
      const friendId = friend.userId.toString() === userId.toString() ? friend.friendId : friend.userId;

      const directMessage = await DirectMessage.create({
        fromUserId: userId, // Use the user's ID for the SOS message
        toUserId: friendId,
        text: `🚨 SOS ALERT: ${user.name} (${user.email}) needs immediate help! ${message || ""}`,
        messageType: "text",
      });

      // Emit to socket
      const io = getIO();
      if (io) {
        const populatedDirect = await DirectMessage.findById(directMessage._id).populate(
          "fromUserId",
          "name email avatar"
        ).populate("toUserId", "name email avatar");
        io.to(`user_${friendId}`).emit("newDirectMessage", populatedDirect);
        io.to(`user_${friendId}`).emit("sosAlert", {
          userId,
          userName: user.name,
          userEmail: user.email,
          location,
          message,
          alertId: sosAlert._id,
          timestamp: new Date(),
        });
      }
    }

    return res.json({
      success: true,
      message: "SOS alert sent to all groups and friends",
      alert: sosAlert,
    });
  } catch (err) {
    console.error("Error sending SOS alert:", err);
    return res.status(500).json({ error: "Failed to send SOS alert" });
  }
};

// 📋 Get user's SOS alerts
export const getUserSOSAlerts = async (req, res) => {
  try {
    const userId = req.userId;
    const alerts = await SOSAlert.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ alerts });
  } catch (err) {
    console.error("Error fetching SOS alerts:", err);
    return res.status(500).json({ error: "Failed to fetch SOS alerts" });
  }
};

// ✅ Resolve SOS Alert
export const resolveSOSAlert = async (req, res) => {
  try {
    const userId = req.userId;
    const { alertId } = req.params;

    const alert = await SOSAlert.findOne({ _id: alertId, userId });
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    alert.status = "resolved";
    alert.resolvedAt = new Date();
    await alert.save();

    return res.json({ success: true, alert });
  } catch (err) {
    console.error("Error resolving SOS alert:", err);
    return res.status(500).json({ error: "Failed to resolve SOS alert" });
  }
};

