import jwt from "jsonwebtoken";
import { isValidEmail, normalizeEmail } from "../utils/validation.js";

export const adminLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password?.trim();

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    // Verify credentials against .env
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      { email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: { email, role: "admin" },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.status(200).json({ message: "Admin logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

export const verifyAdminToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    res.status(200).json({
      message: "Token verified",
      admin: { email: decoded.email, role: decoded.role },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};
