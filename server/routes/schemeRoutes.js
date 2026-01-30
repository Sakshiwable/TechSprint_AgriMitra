import express from "express";
import { getAllSchemes, getAdminSchemes, verifyScheme, recommendSchemes, createScheme, getSchemeById, deleteScheme, refreshSchemes } from "../controllers/schemeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/refresh", protect, refreshSchemes); // Call Python Scraper
router.get("/", getAllSchemes);
router.post("/recommend", protect, recommendSchemes); // Needs user context
router.post("/", protect, createScheme); // Ideally admin only, but protect for now
router.get("/admin/all", protect, getAdminSchemes); // New Admin Route
router.put("/:id/verify", protect, verifyScheme); // Approve/Edit
router.get("/:id", getSchemeById);
router.delete("/:id", protect, deleteScheme);

export default router;
