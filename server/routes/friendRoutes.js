import express from "express";
import FriendRequest from "../models/FriendRequest.js";
import { verifyTokenMiddleware } from "../utils/jwt.js";

const router = express.Router();
router.use(verifyTokenMiddleware);

// 📨 Get pending invites for logged-in user
router.get("/invites", async (req, res) => {
  try {
    const invites = await FriendRequest.find({
      toUserId: req.userId,
      status: "pending",
    })
      .populate("fromUserId", "name email")
      .populate("groupId", "groupName");

    res.status(200).json({ invites });
  } catch (err) {
    console.error("❌ Error fetching invites:", err.message);
    res.status(500).json({ message: "Error fetching invites" });
  }
});

export default router;
