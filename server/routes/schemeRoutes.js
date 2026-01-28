import express from "express";
import { getSchemes, addScheme, deleteScheme } from "../controllers/schemeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSchemes);
router.post("/", protect, addScheme); // Add admin check middleware if available, else protect
router.delete("/:id", protect, deleteScheme);

export default router;
