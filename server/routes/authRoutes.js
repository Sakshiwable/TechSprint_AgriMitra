// routes/authRoutes.js
import express from "express";
import { getProfile, updateProfile } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/auth/profile
router.get("/profile", auth, getProfile);

// PUT /api/auth/profile
router.put("/profile", auth, updateProfile);

export default router;
