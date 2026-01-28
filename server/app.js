// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js"; // add this import
import groupRoutes from "./routes/groupRoutes.js";
import routeRoutes from "./routes/routeRoutes.js"; // if you added this for ORS
import friendRoutes from "./routes/friendRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

// 🧱 Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"], // frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 🔗 API Routes
app.use("/api/auth", authRoutes); // <-- mount auth routes here
app.use("/api/route", routeRoutes); // optional: for route data
app.use("/api/friends", friendRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/alerts", alertRoutes);

// 🛠️ Default Route (for quick test)
app.get("/", (req, res) => {
  res.send("🚀 TravelSync API is running...");
});

// ❌ Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;
