import jwt from "jsonwebtoken";

// Auth Middleware
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.error("❌ Auth Error: No authorization header provided");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("❌ Auth Error: Authorization header missing Bearer token");
      return res.status(401).json({ message: "Invalid authorization header format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};

// Admin Middleware
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
