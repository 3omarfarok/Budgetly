import express from "express";
import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get balance summary for all users
router.get("/balances", authenticate, async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    const expenses = await Expense.find();
    const payments = await Payment.find({ status: "approved" });

    const balances = await Promise.all(
      users.map(async (user) => {
        // Calculate total owed by user
        const userExpenses = expenses.filter((expense) =>
          expense.splits.some(
            (split) => split.user.toString() === user._id.toString()
          )
        );

        const totalOwed = userExpenses.reduce((sum, expense) => {
          const userSplit = expense.splits.find(
            (split) => split.user.toString() === user._id.toString()
          );
          return sum + (userSplit ? userSplit.amount : 0);
        }, 0);

        // Calculate total paid by user
        const userPayments = payments.filter(
          (payment) => payment.user.toString() === user._id.toString()
        );

        const totalPaid = userPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        // Calculate balance
        const balance = totalPaid - totalOwed;

        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          totalOwed,
          totalPaid,
          balance, // positive = they paid extra, negative = they owe money
        };
      })
    );

    res.json(balances);
  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get detailed stats for specific user
router.get("/user/:userId", authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user expenses
    const expenses = await Expense.find({
      "splits.user": userId,
    })
      .populate("createdBy", "name username")
      .populate("splits.user", "name username")
      .sort({ date: -1 });

    // Get user payments
    const payments = await Payment.find({
      user: userId,
      status: "approved",
    })
      .populate("recordedBy", "name username")
      .sort({ date: -1 });

    // Calculate totals
    const totalOwed = expenses.reduce((sum, expense) => {
      const userSplit = expense.splits.find(
        (split) => split.user._id.toString() === userId
      );
      return sum + (userSplit ? userSplit.amount : 0);
    }, 0);

    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const balance = totalPaid - totalOwed;

    // Get expense categories breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const userSplit = expense.splits.find(
        (split) => split.user._id.toString() === userId
      );

      if (userSplit) {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += userSplit.amount;
      }

      return acc;
    }, {});

    res.json({
      totalOwed,
      totalPaid,
      balance,
      expenseCount: expenses.length,
      paymentCount: payments.length,
      categoryBreakdown,
      recentExpenses: expenses.slice(0, 5),
      recentPayments: payments.slice(0, 5),
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get admin dashboard stats
router.get("/admin/dashboard", authenticate, async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    const expenses = await Expense.find();
    const payments = await Payment.find({ status: "approved" });

    // Total statistics
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + exp.totalAmount,
      0
    );
    const totalPayments = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const totalOwed = totalExpenses - totalPayments;

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.totalAmount;
      return acc;
    }, {});

    // Users who owe money
    const balances = await Promise.all(
      users.map(async (user) => {
        const userExpenses = expenses.filter((expense) =>
          expense.splits.some(
            (split) => split.user.toString() === user._id.toString()
          )
        );

        const totalOwed = userExpenses.reduce((sum, expense) => {
          const userSplit = expense.splits.find(
            (split) => split.user.toString() === user._id.toString()
          );
          return sum + (userSplit ? userSplit.amount : 0);
        }, 0);

        const userPayments = payments.filter(
          (payment) => payment.user.toString() === user._id.toString()
        );

        const totalPaid = userPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        const balance = totalPaid - totalOwed;

        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          balance,
        };
      })
    );

    const usersOwing = balances.filter((b) => b.balance < 0);
    const usersPaidExtra = balances.filter((b) => b.balance > 0);

    res.json({
      overview: {
        totalUsers: users.length,
        totalExpenses: expenses.length,
        totalPayments: payments.length,
        totalExpenseAmount: totalExpenses,
        totalPaymentAmount: totalPayments,
        totalOwed,
      },
      categoryBreakdown,
      usersOwing: usersOwing.map((u) => ({
        ...u,
        owes: Math.abs(u.balance),
      })),
      usersPaidExtra: usersPaidExtra.map((u) => ({
        ...u,
        extra: u.balance,
      })),
      recentExpenses: expenses.slice(0, 10),
      recentPayments: payments.slice(0, 10),
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
