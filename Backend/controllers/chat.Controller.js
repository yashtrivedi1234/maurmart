import axios from "axios";
import { getDynamicWebsiteContext, getProductRecommendations } from "./chatContext.Controller.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export const chat = async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        response:
          "Chat is being set up. You can reach us at info@maurmart.com or via the Contact page. The chatbot will be active soon!",
      });
    }

    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
        message: "message is required",
      });
    }

    // Get dynamic website context (real-time data from database)
    const systemContext = await getDynamicWebsiteContext();

    // Check if user is asking for product recommendations
    const searchKeywords = ["recommend", "find", "search", "products", "looking for", "want", "need", "best", "cheap", "affordable"];
    const isProductQuery = searchKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    let productInfo = "";
    if (isProductQuery) {
      const recommendations = await getProductRecommendations(message);
      if (recommendations.length > 0) {
        productInfo = `\n\nRelevant Products Found:\n${recommendations
          .map(
            (p) =>
              `- ${p.name} | ₹${p.price}${p.originalPrice ? ` (was ₹${p.originalPrice})` : ""} | Rating: ${p.rating}⭐ | Stock: ${p.stock > 0 ? "Available" : "Out of Stock"}`
          )
          .join("\n")}`;
      }
    }

    const systemMessage = {
      role: "system",
      content: systemContext,
    };

    const historyMessages = conversationHistory.slice(-10).map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const messages = [
      systemMessage,
      ...historyMessages,
      {
        role: "user",
        content: productInfo ? `${message.trim()}\n${productInfo}` : message.trim(),
      },
    ];

    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages,
        max_completion_tokens: 1024,
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content =
      response.data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response. Please try again.";

    return res.status(200).json({
      success: true,
      response: content.trim(),
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.error?.message ||
      err.message ||
      "Chat request failed.";
    console.error("Chat error:", err.response?.data || err.message);

    if (status === 401) {
      return res.status(500).json({
        error: "Invalid API key",
        message: "Chatbot service configuration error.",
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again in a moment.",
      });
    }

    return res.status(status).json({
      error: "Failed to generate response",
      message,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const chatHealth = async (_req, res) => {
  const isConfigured = !!process.env.GROQ_API_KEY;
  return res.json({
    status: "ok",
    configured: isConfigured,
  });
};
