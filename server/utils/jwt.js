// utils/jwt.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secretkey"; // from .env

// 🧾 Create token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
};

// 🔍 Verify token (for normal use)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// 🛡️ Middleware: check token before accessing routes
export const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token must be passed in header: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id; // store userId in request for later use
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
