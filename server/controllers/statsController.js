import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

// Helper to calculate balance for a user
const calculateUserBalance = async (userId, houseId) => {
  // 1. External Paid (Credit): Expenses created by user (only approved)
  const expensesCreated = await Expense.find({
    house: houseId,
    createdBy: userId,
    status: "approved",
  });
  const externalPaid = expensesCreated.reduce(
    (sum, e) => sum + e.totalAmount,
    0
  );

  // 2. Internal Sent (Credit): Approved payments made by user
  const paymentsSent = await Payment.find({
    house: houseId,
    user: userId,
    status: "approved",
  });
  const internalSent = paymentsSent.reduce((sum, p) => sum + p.amount, 0);

  // 3. Invoices Assigned (Debit): All invoices for user
  const invoices = await Invoice.find({
    house: houseId,
    user: userId,
  });
  const invoicesAssigned = invoices.reduce((sum, i) => sum + i.amount, 0);

  // 4. Internal Received (Debit): Approved payments received for expenses created by user
  // (User paid external -> Expenses -> Invoices -> Payments(Approved) -> Money back to User)
  // We need payments where linked invoice's expense was created by this user
  // Strategy: Find Invoices linked to 'expensesCreated', then find Payments linked to those Invoices
  const expenseIds = expensesCreated.map((e) => e._id);
  const invoicesOwedToUser = await Invoice.find({
    expense: { $in: expenseIds },
    house: houseId,
  });
  const invoiceIds = invoicesOwedToUser.map((i) => i._id);

  // Find payments linked to these invoices (via paymentRequest field OR we might need to look up Payment by invoice)
  // Our Invoice model has `paymentRequest` field which is the Payment ID.
  // We only care if the payment is APPROVED.
  // Filter invoices that have a payment request, get those payment IDs
  const paymentIds = invoicesOwedToUser
    .filter((i) => i.paymentRequest)
    .map((i) => i.paymentRequest);

  const paymentsReceived = await Payment.find({
    _id: { $in: paymentIds },
    status: "approved",
  });
  const internalReceived = paymentsReceived.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const balance =
    externalPaid + internalSent - (invoicesAssigned + internalReceived);

  return {
    externalPaid,
    internalSent,
    invoicesAssigned,
    internalReceived,
    balance,
  };
};

// Get balance summary for all users
export const getBalances = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const users = await User.find({ isActive: true, house: currentUser.house });

    const balances = await Promise.all(
      users.map(async (user) => {
        const stats = await calculateUserBalance(user._id, currentUser.house);
        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          balance: stats.balance,
          totalPaid: stats.externalPaid + stats.internalSent, // Combined Paid
          totalOwed: stats.invoicesAssigned, // Total Liability
        };
      })
    );

    res.json(balances);
  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get detailed stats for specific user
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const stats = await calculateUserBalance(userId, currentUser.house);

    // Get Recent Invoices
    const invoices = await Invoice.find({
      house: currentUser.house,
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate("expense", "description category");

    // Category Breakdown (based on Invoices)
    const categoryBreakdown = invoices.reduce((acc, inv) => {
      const cat = inv.expense?.category || "General";
      acc[cat] = (acc[cat] || 0) + inv.amount;
      return acc;
    }, {});

    res.json({
      balance: stats.balance,
      totalPaid: stats.externalPaid + stats.internalSent,
      totalOwed: stats.invoicesAssigned,
      invoiceCount: invoices.length,
      categoryBreakdown,
      recentInvoices: invoices.slice(0, 5),
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get admin dashboard stats
export const getAdminDashboard = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const users = await User.find({ isActive: true, house: currentUser.house });
    const expenses = await Expense.find({
      house: currentUser.house,
      status: "approved",
    });
    const invoices = await Invoice.find({ house: currentUser.house });
    const payments = await Payment.find({ house: currentUser.house });

    // Calculate balances for visual
    const balances = await Promise.all(
      users.map(async (user) => {
        const stats = await calculateUserBalance(user._id, currentUser.house);
        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          balance: stats.balance,
        };
      })
    );

    const usersOwing = balances
      .filter((b) => b.balance < 0)
      .map((u) => ({ ...u, owes: Math.abs(u.balance) }));
    const usersPaidExtra = balances
      .filter((b) => b.balance > 0)
      .map((u) => ({ ...u, extra: u.balance }));

    const totalExpenseAmount = expenses.reduce(
      (sum, e) => sum + e.totalAmount,
      0
    );
    const totalInvoicesAmount = invoices.reduce((sum, i) => sum + i.amount, 0);

    // Total Owed = Sum of Invoices that are NOT paid
    const totalOwed = invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + i.amount, 0);

    const totalPaymentsAmount = payments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0);

    // Category Breakdown via Invoices (representing consumption)
    const populatedInvoices = await Invoice.find({
      house: currentUser.house,
    }).populate("expense", "category");
    const categoryBreakdown = populatedInvoices.reduce((acc, inv) => {
      const cat = inv.expense?.category || "General";
      acc[cat] = (acc[cat] || 0) + inv.amount;
      return acc;
    }, {});

    res.json({
      overview: {
        totalUsers: users.length,
        totalInvoices: invoices.length,
        totalPayments: payments.length,
        totalInvoicesAmount, // New metric
        totalPaymentsAmount,
        totalExpenseAmount, // Restored for Frontend
        totalOwed, // Restored (Outstanding Debt)
      },
      categoryBreakdown,
      usersOwing,
      usersPaidExtra,
      recentInvoices: invoices.slice(0, 10),
      recentPayments: payments.slice(0, 10),
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
