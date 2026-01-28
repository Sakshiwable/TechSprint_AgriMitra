// server/routes/routeRoutes.js
import express from "express";
import { getRoute, searchPlaces } from "../controllers/routeController.js";

const router = express.Router();

// POST /api/route
// Accepts: { origin: { lat, lng }, destination: { lat, lng } }
// Returns: { coordinates: [[lat,lng], ...], distance: "12.47 km", duration: "27 min" }
router.post("/", getRoute);

// GET /api/route/search-places?q=query
// Returns: [{ name: "...", lat: 18.52, lng: 73.86 }, ...]
router.get("/search-places", searchPlaces);

export default router;
