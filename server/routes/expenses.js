import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteMyRequest,
  approveExpense,
  rejectExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Get all expenses
router.get("/", authenticate, getExpenses);

// Create expense (Authenticated users can create pending expenses, Admins create approved ones)
router.post("/", authenticate, createExpense);

// Update expense (Admin only)
router.put("/:id", authenticate, isAdmin, updateExpense);

// Approve expense (Admin only)
router.put("/:id/approve", authenticate, isAdmin, approveExpense);

// Reject expense (Admin only)
router.put("/:id/reject", authenticate, isAdmin, rejectExpense);

// Delete own pending request (User)
router.delete("/:id/my-request", authenticate, deleteMyRequest);

// Delete expense (Admin only)
router.delete("/:id", authenticate, isAdmin, deleteExpense);

export default router;
