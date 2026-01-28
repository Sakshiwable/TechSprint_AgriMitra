import express from "express";
import { 
  getCommunities, 
  requestCommunity, 
  joinCommunity, 
  getPendingCommunities, 
  approveCommunity, 
  getCommunityDetails,
  getCommunityMessages,
  sendCommunityMessage
} from "../controllers/communityController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCommunities);
router.post("/request", protect, requestCommunity);
router.post("/:communityId/join", protect, joinCommunity);
router.get("/:communityId", protect, getCommunityDetails);

// Chat Routes
router.get("/:communityId/messages", protect, getCommunityMessages);
router.post("/:communityId/messages", protect, sendCommunityMessage);

// Admin Routes
router.get("/admin/pending", protect, getPendingCommunities);
router.put("/admin/:id/approve", protect, approveCommunity);

export default router;
