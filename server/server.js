// server.js
import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./sockets/index.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// 🧩 Step 1: Connect to MongoDB
connectDB();

// 🧩 Step 2: Create an HTTP server from Express app
const server = http.createServer(app);

// 🧩 Step 3: Initialize WebSocket (real-time)
initSocket(server);

// 🧩 Step 4: Start the server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
