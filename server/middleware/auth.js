// simple JWT auth middleware
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const secret = process.env.JWT_SECRET || "change_this_secret";
    const payload = jwt.verify(token, secret);
    req.userId = payload.id || payload.userId || payload._id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
