import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// Get invoices for the logged in user
export const getMyInvoices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const invoices = await Invoice.find({
      user: req.user.id,
      house: user.house,
    })
      .populate("expense", "description category date createdBy")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error("Get my invoices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all invoices (Admin only)
export const getAllInvoices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const invoices = await Invoice.find({
      house: user.house,
    })
      .populate("user", "name username")
      .populate("expense", "description category date")
      .populate({
        path: "paymentRequest",
        populate: { path: "recordedBy", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error("Get all invoices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User pays an invoice (Creates Payment Request)
export const payInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to pay this invoice" });
    }

    if (invoice.status !== "pending") {
      return res.status(400).json({ message: "Invoice is not pending" });
    }

    // Create Payment Record (Pending)
    const payment = await Payment.create({
      user: req.user.id,
      amount: invoice.amount,
      description: `Payment for Invoice: ${invoice.description}`,
      status: "pending",
      transactionType: "payment",
      recordedBy: req.user.id,
      house: invoice.house,
      // We could add `linkedInvoice` to Payment model if we wanted bidirectionality
    });

    // Update Invoice
    invoice.status = "awaiting_approval";
    invoice.paymentRequest = payment._id;
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error("Pay invoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin approves invoice payment
export const approveInvoicePayment = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate(
      "paymentRequest"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status !== "awaiting_approval" || !invoice.paymentRequest) {
      return res
        .status(400)
        .json({ message: "Invoice is not awaiting approval" });
    }

    // Approve the underlying Payment
    const payment = await Payment.findById(invoice.paymentRequest._id);
    if (payment) {
      payment.status = "approved";
      payment.approvedBy = req.user.id;
      await payment.save();
    }

    // Update Invoice
    invoice.status = "paid";
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error("Approve invoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin rejects invoice payment
export const rejectInvoicePayment = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { reason } = req.body;
    const invoice = await Invoice.findById(invoiceId).populate(
      "paymentRequest"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status !== "awaiting_approval") {
      return res
        .status(400)
        .json({ message: "Invoice is not awaiting approval" });
    }

    // Reject Payment
    const payment = await Payment.findById(invoice.paymentRequest._id);
    if (payment) {
      payment.status = "rejected";
      payment.description += ` (Rejected: ${reason || "No reason"})`;
      await payment.save();
    }

    // Reset Invoice to Pending
    invoice.status = "pending";
    invoice.paymentRequest = null; // Clear the failed request so they can try again
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error("Reject invoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
