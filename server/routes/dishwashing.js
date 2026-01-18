import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getDishwashingSettings,
  updateDishwashingSettings,
  deleteDishwashingSettings,
  getTodayAssignment,
  getSchedule,
} from "../controllers/dishwashingController.js";

const router = express.Router();

// Get dishwashing settings
router.get("/:id/dishwashing", authenticate, getDishwashingSettings);

// Update dishwashing settings (Admin only - checked in controller)
router.put("/:id/dishwashing", authenticate, updateDishwashingSettings);

// Delete/disable dishwashing settings (Admin only)
router.delete("/:id/dishwashing", authenticate, deleteDishwashingSettings);

// Get today's assignment
router.get("/:id/dishwashing/today", authenticate, getTodayAssignment);

// Get upcoming schedule
router.get("/:id/dishwashing/schedule", authenticate, getSchedule);

export default router;
