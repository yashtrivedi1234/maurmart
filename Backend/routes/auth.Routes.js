import express from "express";
import { registerUser, loginUser, getUserProfile, verifyOtp, resendOtp, updateUserProfile, uploadProfilePic, getAllUsers, forgotPassword, resetPassword, googleLogin, changePassword } from "../controllers/auth.Controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import multer from "multer";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to safely read user id from JWT payload
const getUserIdFromReq = (req) => {
  if (!req || !req.user) return "unknown";
  return req.user.id || req.user._id || req.user.userId || "unknown";
};

// Use memory storage instead of disk - files stay in memory buffer
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only images are allowed!"));
  }
});

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google-login", googleLogin);

// Protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/update-profile", authMiddleware, updateUserProfile);
router.post("/upload-profile-pic", authMiddleware, upload.single("profilePic"), uploadProfilePic);
router.post("/change-password", authMiddleware, changePassword);

// Admin routes
router.get("/admin/users", authMiddleware, adminMiddleware, getAllUsers);

export default router;