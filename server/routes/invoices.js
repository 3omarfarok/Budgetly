import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import {
  getMyInvoices,
  getAllInvoices,
  payInvoice,
  approveInvoicePayment,
  rejectInvoicePayment,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/my-invoices", authenticate, getMyInvoices);
router.get("/all", authenticate, isAdmin, getAllInvoices);
router.post("/:id/pay", authenticate, payInvoice);
router.put("/:id/approve", authenticate, isAdmin, approveInvoicePayment);
router.put("/:id/reject", authenticate, isAdmin, rejectInvoicePayment);

export default router;
