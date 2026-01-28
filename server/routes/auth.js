import express from "express";
import { registerUser, loginUser, getProfile, updateProfile } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/register - User registration
router.post("/register", registerUser);

// POST /api/auth/login - User login
router.post("/login", loginUser);

// GET /api/auth/profile - Get user profile (requires auth)
router.get("/profile", auth, getProfile);

// PUT /api/auth/profile - Update user profile (requires auth)
router.put("/profile", auth, updateProfile);

export default router;
