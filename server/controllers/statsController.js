import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import { getHouseStatsSnapshot } from "../services/statsService.js";

const getBalanceForUser = (balancesByUserId, userId) =>
  balancesByUserId[userId?.toString()] || {
    externalPaid: 0,
    internalSent: 0,
    invoicesAssigned: 0,
    internalReceived: 0,
    balance: 0,
  };

// Get balance summary for all users
export const getBalances = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("house").lean();
    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const { users, balancesByUserId } = await getHouseStatsSnapshot(currentUser.house);

    const balances = users.map((user) => {
      const stats = getBalanceForUser(balancesByUserId, user._id);

      return {
        userId: user._id,
        username: user.username,
        name: user.name,
        balance: stats.balance,
        totalPaid: stats.externalPaid + stats.internalSent,
        totalOwed: stats.invoicesAssigned,
      };
    });

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
    const currentUser = await User.findById(req.user.id).select("house").lean();

    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const { balancesByUserId, invoices, expenses } = await getHouseStatsSnapshot(
      currentUser.house
    );
    const stats = getBalanceForUser(balancesByUserId, userId);
    const expenseCategoryById = new Map(
      expenses.map((expense) => [expense._id.toString(), expense.category || "General"])
    );
    const userInvoices = invoices.filter(
      (invoice) => invoice.user.toString() === userId.toString()
    );

    const categoryBreakdown = userInvoices.reduce((acc, inv) => {
      const cat = expenseCategoryById.get(inv.expense?.toString()) || "General";
      acc[cat] = (acc[cat] || 0) + inv.amount;
      return acc;
    }, {});

    const recentInvoices = await Invoice.find({
      house: currentUser.house,
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("expense", "description category")
      .lean();

    res.json({
      balance: stats.balance,
      totalPaid: stats.externalPaid + stats.internalSent,
      totalOwed: stats.invoicesAssigned,
      invoiceCount: userInvoices.length,
      categoryBreakdown,
      recentInvoices,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get admin dashboard stats
export const getAdminDashboard = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("house").lean();
    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const { users, expenses, invoices, payments, balancesByUserId } =
      await getHouseStatsSnapshot(currentUser.house);

    const approvedExpenses = expenses.filter((expense) => expense.status === "approved");

    const balances = users.map((user) => ({
      userId: user._id,
      username: user.username,
      name: user.name,
      balance: getBalanceForUser(balancesByUserId, user._id).balance,
    }));

    const usersOwing = balances
      .filter((b) => b.balance < 0)
      .map((u) => ({ ...u, owes: Math.abs(u.balance) }));
    const usersPaidExtra = balances
      .filter((b) => b.balance > 0)
      .map((u) => ({ ...u, extra: u.balance }));

    const totalExpenseAmount = approvedExpenses.reduce(
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

    const expenseCategoryById = new Map(
      expenses.map((expense) => [expense._id.toString(), expense.category || "General"])
    );
    const categoryBreakdown = invoices.reduce((acc, inv) => {
      const cat = expenseCategoryById.get(inv.expense?.toString()) || "General";
      acc[cat] = (acc[cat] || 0) + inv.amount;
      return acc;
    }, {});

    const [recentInvoices, recentPayments] = await Promise.all([
      Invoice.find({ house: currentUser.house }).sort({ createdAt: -1 }).limit(10).lean(),
      Payment.find({ house: currentUser.house }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

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
      recentInvoices,
      recentPayments,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
