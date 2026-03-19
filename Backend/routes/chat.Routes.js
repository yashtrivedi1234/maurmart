import express from "express";
import { chat, chatHealth } from "../controllers/chat.Controller.js";
import { getDynamicWebsiteContext } from "../controllers/chatContext.Controller.js";

const router = express.Router();
router.get("/", (_, res) =>
  res.json({
    ok: true,
    message: "Chat API is up. Use POST with body: { message: string, conversationHistory?: [] }.",
  })
);
router.get("/health", chatHealth);

// Get dynamic website context (for debugging - shows what context the chatbot sees)
router.get("/context/current", async (req, res) => {
  try {
    const context = await getDynamicWebsiteContext();
    res.json({
      ok: true,
      context,
      updatedAt: new Date(),
      note: "This is the real-time context being used by the chatbot",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", chat);

export default router;
