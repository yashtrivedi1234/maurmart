import express from "express";
import { chat, chatHealth } from "../controllers/chat.Controller.js";

const router = express.Router();
router.get("/", (_, res) =>
  res.json({
    ok: true,
    message: "Chat API is up. Use POST with body: { message: string, conversationHistory?: [] }.",
  })
);
router.get("/health", chatHealth);
router.post("/", chat);

export default router;
