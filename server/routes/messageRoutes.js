// server/routes/messageRoutes.js
import express from "express";
import DirectMessage from "../models/DirectMessage.js";
import { verifyTokenMiddleware } from "../utils/jwt.js";

const router = express.Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// 💬 Get direct messages between current user and another user
router.get("/direct/:userId", async (req, res) => {
  try {
    const currentUserId = req.userId;
    const otherUserId = req.params.userId;

    const messages = await DirectMessage.find({
      $or: [
        { fromUserId: currentUserId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("fromUserId", "name email avatar")
      .populate("toUserId", "name email avatar");

    res.status(200).json({ messages });
  } catch (err) {
    console.error("❌ Error fetching direct messages:", err.message);
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
});

export default router;

