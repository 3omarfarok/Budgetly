import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getBalances,
  getUserStats,
  getAdminDashboard,
} from "../controllers/statsController.js";

const router = express.Router();

// Get balance summary for all users (in same house)
router.get("/balances", authenticate, getBalances);

// Get detailed stats for specific user (in same house)
router.get("/user/:userId", authenticate, getUserStats);

// Get admin dashboard stats (for same house)
router.get("/admin/dashboard", authenticate, getAdminDashboard);

export default router;
