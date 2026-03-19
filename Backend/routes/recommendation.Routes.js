import express from "express";
import {
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getCategoryProducts,
  getTrendingProducts,
  getPersonalizedRecommendations,
  getComboDeal,
  getRecommendationSummary,
} from "../controllers/recommendation.Controller.js";
import { authMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

// Public routes
router.get("/similar/:productId", getSimilarProducts);
router.get("/frequently-bought/:productId", getFrequentlyBoughtTogether);
router.get("/category/:productId", getCategoryProducts);
router.get("/trending", getTrendingProducts);
router.get("/combo-deal/:productId", getComboDeal);
router.get("/summary/:productId", getRecommendationSummary);

// Protected route (requires authentication)
router.get("/personalized", authMiddleware, getPersonalizedRecommendations);

export default router;
