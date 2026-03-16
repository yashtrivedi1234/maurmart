import express from "express";
import { subscribeNewsletter, getNewsletters } from "../controllers/newsletter.Controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/subscribe", subscribeNewsletter);
router.get("/", authMiddleware, adminMiddleware, getNewsletters);

export default router;
