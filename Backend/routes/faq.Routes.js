import express from "express";
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faq.Controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

// Public routes
router.get("/", getFAQs);

// Admin routes - protected
router.post("/", authMiddleware, adminMiddleware, createFAQ);
router.put("/:id", authMiddleware, adminMiddleware, updateFAQ);
router.delete("/:id", authMiddleware, adminMiddleware, deleteFAQ);

export default router;
