import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import multer from "multer";
import path from "path";
import {
  getBrands,
  createBrand,
  deleteBrand,
} from "../controllers/brand.Controller.js";

const router = express.Router();

// Multer config for brand images (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    const isMimeAllowed = allowedMimes.includes(file.mimetype);
    const isExtAllowed = allowedExtensions.includes(
      path.extname(file.originalname).toLowerCase()
    );

    if (isMimeAllowed && isExtAllowed) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG, PNG, and WebP images are allowed!"));
  },
});

// Public routes
router.get("/", getBrands);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createBrand);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBrand);

export default router;
