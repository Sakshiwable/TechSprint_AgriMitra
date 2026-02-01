// simple JWT auth middleware
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const secret = process.env.JWT_SECRET || "change_this_secret";
    const payload = jwt.verify(token, secret);
    req.userId = payload.id || payload.userId || payload._id;
    req.user = payload; // Store full payload for role checking
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const admin = async (req, res, next) => {
  try {
    // Get user from database to check role
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }
    
    next();
  } catch (err) {
    return res.status(500).json({ error: "Error verifying admin status" });
  }
};
