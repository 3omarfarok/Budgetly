import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import {
  getPayments,
  getUserPayments,
  createPayment,
  updatePayment,
  approvePayment,
  rejectPayment,
  deletePayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Get all payments
router.get("/", authenticate, getPayments);

// Get payments for specific user
router.get("/user/:userId", authenticate, getUserPayments);

// Create payment
router.post("/", authenticate, createPayment);

// Update payment (only if pending)
router.put("/:id", authenticate, updatePayment);

// Approve payment (Admin only)
router.patch("/:id/approve", authenticate, isAdmin, approvePayment);

// Reject payment (Admin only)
router.patch("/:id/reject", authenticate, isAdmin, rejectPayment);

// Delete payment (only if pending)
router.delete("/:id", authenticate, deletePayment);

export default router;
