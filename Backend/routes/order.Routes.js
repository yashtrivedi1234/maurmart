import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus } from "../controllers/order.Controller.js";

const router = express.Router();

router.use(authMiddleware);

// Specific routes first
router.post("/create", createOrder);
router.get("/user-orders", getUserOrders);

// Admin routes (more specific)
router.get("/", adminMiddleware, getAllOrders);
router.patch("/:id/status", adminMiddleware, updateOrderStatus);

// Generic routes last (must come after specific ones)
router.get("/:id", getOrderById);

export default router;
