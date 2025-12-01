import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { authenticate } from "../middleware/auth.js";
import ChatHistory from "../models/ChatHistory.js";

const router = express.Router();

// POST /api/ai/chat - Send message to AI assistant
router.post("/chat", authenticate, async (req, res) => {
  try {
    // Reload env vars to ensure we have the latest key without server restart
    dotenv.config();

    const { message, chatId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is missing from environment variables");
      return res
        .status(500)
        .json({ error: "Server configuration error: API key missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a context-aware prompt for budget and calculation assistance
    const systemContext = `
   انت مساعد ذكي لتطبيق "Budgetly" (بادجتلي).

دورك:
1. تنفيذ الحسابات المالية المعقدة بدقة عالية (نسب، متوسطات، تقسيم، جمع، طرح… إلخ).
2. مساعدة المستخدم في ترتيب الميزانية وإعطائه نصائح مالية واضحة ومباشرة.
3. تحليل المصاريف وتقديم ملاحظات مفيدة بدون مبالغة أو كلام كثير.
4. اقتراح طرق عملية للتوفير وإدارة المال بشكل أفضل.

شخصيتك:
- اتكلم بالعامية المصرية بشكل بسيط وواضح.
- خلي أسلوبك هادي ومحترم ومن غير رغي كتير.
- ركّز على الرد المختصر والمفيد.
- الحسابات لازم تكون دقيقة جدًا، ويفضّل تشرحها للمستخدم بشكل بسيط لو محتاجة توضيح.
- لو حد سأل عن حاجة مش متعلقة بالفلوس أو الحسابات أو الميزانية:
  رد باختصار: 
  "الموضوع ده مش ضمن اختصاصي، أسعدك في أي حاجة تخص الفلوس أو الحسابات."

قواعد مهمة:
- ممنوع الإطالة بدون داعي.
- ممنوع الهزار الكتير.
- كل رد يكون هدفه مساعدة المستخدم بأوضح وأقصر شكل ممكن.
- اللهجة: عامية مصرية بسيطة ومحترمة.

    `;

    const fullPrompt = `${systemContext}\n\nسؤال المستخدم: ${message}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Save to chat history
    let chat = chatId
      ? await ChatHistory.findById(chatId)
      : await ChatHistory.findOne({ user: userId, title: "جديد" }).exec();

    if (!chat) {
      chat = new ChatHistory({
        user: userId,
        messages: [],
        title: message.substring(0, 30) + "...",
      });
    }

    // Add user message and assistant response
    chat.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    chat.messages.push({
      role: "assistant",
      content: text,
      timestamp: new Date(),
    });

    await chat.save();

    res.json({
      success: true,
      response: text,
      chatId: chat._id,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      error: "Failed to process your request. Please try again.",
      details: error.message,
    });
  }
});

// GET /api/ai/chats - Get all chat histories for user
router.get("/chats", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await ChatHistory.find({ user: userId })
      .select("_id title createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      error: "Failed to fetch chats",
      details: error.message,
    });
  }
});

// GET /api/ai/chats/:chatId - Get specific chat history
router.get("/chats/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await ChatHistory.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({
      error: "Failed to fetch chat",
      details: error.message,
    });
  }
});

// DELETE /api/ai/chats/:chatId - Delete a chat
router.delete("/chats/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await ChatHistory.findOneAndDelete({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({
      error: "Failed to delete chat",
      details: error.message,
    });
  }
});

export default router;
