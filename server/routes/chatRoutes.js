import express from "express";
import { getDirectMessages, sendDirectMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/:otherUserId", protect, getDirectMessages);
router.post("/:toUserId", protect, sendDirectMessage);

export default router;
