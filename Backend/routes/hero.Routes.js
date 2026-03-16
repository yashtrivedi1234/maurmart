import express from "express";
import { getHeroSlides, createHeroSlide, deleteHeroSlide, updateHeroSlide } from "../controllers/hero.Controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import multer from "multer";

const router = express.Router();

// Multer config for hero images (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.route("/")
  .get(getHeroSlides)
  .post(authMiddleware, adminMiddleware, upload.single("image"), createHeroSlide);

router.route("/:id")
  .put(authMiddleware, adminMiddleware, upload.single("image"), updateHeroSlide)
  .delete(authMiddleware, adminMiddleware, deleteHeroSlide);

export default router;
