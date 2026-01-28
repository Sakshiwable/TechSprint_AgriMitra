// server/routes/alertRoutes.js
import express from "express";
import {
  sendSOSAlert,
  getUserSOSAlerts,
  resolveSOSAlert,
} from "../controllers/alertController.js";
import { verifyTokenMiddleware } from "../utils/jwt.js";

const router = express.Router();

// All routes below require authentication
router.use(verifyTokenMiddleware);

// 🚨 Send SOS Alert
router.post("/sos", sendSOSAlert);

// 📋 Get user's SOS alerts
router.get("/sos", getUserSOSAlerts);

// ✅ Resolve SOS Alert
router.put("/sos/:alertId/resolve", resolveSOSAlert);

export default router;




