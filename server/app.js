// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import schemeRoutes from "./routes/schemeRoutes.js";
import expertRoutes from "./routes/expertRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import path from "path"; // Required for static serving
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

// 📂 Serve Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🛠️ Default Route
app.get("/", (req, res) => {
  res.send("🌾 AgriMitra API is running...");
});

// ❌ Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;
