import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Get all expenses
router.get("/", authenticate, getExpenses);

// Create expense (Admin only)
router.post("/", authenticate, isAdmin, createExpense);

// Update expense (Admin only)
router.put("/:id", authenticate, isAdmin, updateExpense);

// Delete expense (Admin only)
router.delete("/:id", authenticate, isAdmin, deleteExpense);

export default router;
