// routes/groupRoutes.js
import express from "express";
import {
  createGroup,
  inviteFriend,
  acceptInvite,
  getGroupMembers,
  getUserGroups,
  getAllGroupMembers,
  updateGroupDestination,
  getGroupById,
} from "../controllers/groupController.js";
import { verifyTokenMiddleware } from "../utils/jwt.js";
import GroupMessage from "../models/GroupMessage.js";

const router = express.Router();

// All routes below require authentication
router.use(verifyTokenMiddleware);

// 🧾 Create new group
router.post("/create", createGroup);

// 💌 Invite a friend to join a group
router.post("/invite", (req, res, next) => {
  console.log("📨 Invite route hit ✅", req.body);
  next();
}, inviteFriend);

// ✅ Accept a friend's invite
router.post("/accept", acceptInvite);

// 📋 Get all groups for this user
router.get("/my-groups", getUserGroups);

// 👥 Get all group members from all user's groups (friends) - must be before /:groupId/members
router.get("/all-members", getAllGroupMembers);

// 📋 Get group by ID
router.get("/:groupId", getGroupById);

// 🎯 Update group destination (admin only)
router.put("/:groupId/destination", updateGroupDestination);

// 👥 Get all members of a group
router.get("/:groupId/members", getGroupMembers);

// 💬 Get all chat messages for a group (new)
router.get("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .populate("fromUserId", "name email");
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching messages",
      error: err.message,
    });
  }
});
console.log("✅ groupRoutes.js loaded successfully");

export default router;
