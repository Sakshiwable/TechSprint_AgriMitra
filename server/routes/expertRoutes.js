import express from "express";
import { 
  getExperts, requestExpertStatus, approveExpert, getPendingExperts,
  sendConsultationRequest, getMyRequests, updateRequestStatus, getMyConsultations
} from "../controllers/expertController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getExperts); // Publicly viewable
router.post("/request", protect, requestExpertStatus);
router.get("/pending", protect, getPendingExperts); // Admin only ideal
router.put("/:id/approve", protect, approveExpert); // Admin only ideal

// Consultation Routes
router.post("/consult/request", protect, sendConsultationRequest);
router.get("/consult/requests", protect, getMyRequests); // Incoming for expert
router.put("/consult/request/:requestId", protect, updateRequestStatus);
router.get("/consult/my-consultations", protect, getMyConsultations);


export default router;
