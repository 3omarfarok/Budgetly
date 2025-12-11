import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getMonthlyAnalytics,
  getCategoryTrends,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Get monthly analytics for user
router.get("/monthly", authenticate, getMonthlyAnalytics);

// Get category trends
router.get("/trends", authenticate, getCategoryTrends);

export default router;
