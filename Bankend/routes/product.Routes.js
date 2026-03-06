import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getTrendingProducts,
  updateProductStatus,
} from "../controllers/product.Controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes for fetching products
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/trending", getTrendingProducts);

// Admin routes
router.patch("/admin/:id/status", protect, admin, updateProductStatus);
router.post("/create", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Only Admin Can Create Product" });
});

export default router;