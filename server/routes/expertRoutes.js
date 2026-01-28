import express from "express";
import { getExperts, requestExpertStatus, approveExpert, getPendingExperts } from "../controllers/expertController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getExperts); // Publicly viewable
router.post("/request", protect, requestExpertStatus);
router.get("/pending", protect, getPendingExperts); // Admin only ideal
router.put("/:id/approve", protect, approveExpert); // Admin only ideal

export default router;
