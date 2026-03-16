import express from "express";
import {
  adminLogin,
  adminLogout,
  verifyAdminToken,
} from "../controllers/admin.Controller.js";
import { authMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

// Protected routes
router.post("/verify-token", authMiddleware, verifyAdminToken);

export default router;
