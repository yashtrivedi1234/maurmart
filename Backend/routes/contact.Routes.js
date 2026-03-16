import express from "express";
import {
  submitContact,
  getContacts,
  updateContactStatus,
  deleteContact,
} from "../controllers/contact.Controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

// Public route - submit contact
router.post("/submit", submitContact);

// Admin routes - protected
router.get("/", authMiddleware, adminMiddleware, getContacts);
router.put("/:id", authMiddleware, adminMiddleware, updateContactStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteContact);

export default router;
