import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  handleChat,
  getChats,
  getChatById,
  deleteChat,
} from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/chat - Send message to AI assistant
router.post("/chat", authenticate, handleChat);

// GET /api/ai/chats - Get all chat histories for user
router.get("/chats", authenticate, getChats);

// GET /api/ai/chats/:chatId - Get specific chat history
router.get("/chats/:chatId", authenticate, getChatById);

// DELETE /api/ai/chats/:chatId - Delete a chat
router.delete("/chats/:chatId", authenticate, deleteChat);

export default router;
