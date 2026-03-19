import express from "express";
import {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  getPendingTestimonials,
  updateTestimonialStatus,
  updateTestimonial,
  deleteTestimonial,
  markHelpful,
} from "../controllers/testimonial.Controller.js";
import { authMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

/* ────────── PUBLIC ROUTES ────────── */
// Get all approved testimonials
router.get("/", getTestimonials);

// Get testimonial by ID
router.get("/:id", getTestimonialById);

// Mark testimonial as helpful/not helpful
router.post("/:id/helpful", markHelpful);

/* ────────── ADMIN ROUTES ────────── */
// Create testimonial (admin only)
router.post("/", authMiddleware, createTestimonial);

// Get pending testimonials (admin only)
router.get("/admin/pending", authMiddleware, getPendingTestimonials);

// Update testimonial status (admin only)
router.patch("/:id/status", authMiddleware, updateTestimonialStatus);

// Update testimonial details (admin only)
router.patch("/:id", authMiddleware, updateTestimonial);

// Delete testimonial (admin only)
router.delete("/:id", authMiddleware, deleteTestimonial);

export default router;
