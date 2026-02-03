import express from "express";
import { getContent } from "../controllers/translationController.js";

const router = express.Router();

// GET translated (or original) content
router.get("/content/:sourceId", getContent);

export default router;
