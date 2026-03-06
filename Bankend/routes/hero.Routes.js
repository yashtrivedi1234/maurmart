import express from "express";
import { getHeroSlides, createHeroSlide, deleteHeroSlide } from "../controllers/hero.Controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getHeroSlides)
  .post(protect, admin, createHeroSlide);

router.route("/:id")
  .delete(protect, admin, deleteHeroSlide);

export default router;
