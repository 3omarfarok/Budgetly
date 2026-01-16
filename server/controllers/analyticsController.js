import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";

// Get monthly analytics for user
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all expenses for this user
    const expenses = await Expense.find({
      "splits.user": userId,
    }).sort({ date: -1 });

    // Get all paid invoices for this user instead of payments
    const paidInvoices = await Invoice.find({
      user: userId,
      status: "paid",
    }).sort({ createdAt: -1 });

    // Group expenses by month
    const monthlyExpenses = {};
    expenses.forEach((expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      const userSplit = expense.splits.find(
        (s) => s.user.toString() === userId
      );

      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = {
          total: 0,
          categories: {},
          count: 0,
        };
      }

      monthlyExpenses[month].total += userSplit?.amount || 0;
      monthlyExpenses[month].count += 1;

      // Group by category
      if (!monthlyExpenses[month].categories[expense.category]) {
        monthlyExpenses[month].categories[expense.category] = 0;
      }
      monthlyExpenses[month].categories[expense.category] +=
        userSplit?.amount || 0;
    });

    // Group paid invoices by month
    const monthlyPayments = {};
    paidInvoices.forEach((invoice) => {
      const month = new Date(invoice.createdAt).toISOString().slice(0, 7);

      if (!monthlyPayments[month]) {
        monthlyPayments[month] = {
          total: 0,
          count: 0,
        };
      }

      monthlyPayments[month].total += invoice.amount;
      monthlyPayments[month].count += 1;
    });

    // Calculate category breakdown (all time)
    const categoryBreakdown = {};
    let totalAllTime = 0;

    expenses.forEach((expense) => {
      const userSplit = expense.splits.find(
        (s) => s.user.toString() === userId
      );
      const amount = userSplit?.amount || 0;

      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = 0;
      }
      categoryBreakdown[expense.category] += amount;
      totalAllTime += amount;
    });

    // Convert to percentages
    const categoryPercentages = {};
    Object.keys(categoryBreakdown).forEach((category) => {
      categoryPercentages[category] = {
        amount: categoryBreakdown[category],
        percentage:
          totalAllTime > 0
            ? ((categoryBreakdown[category] / totalAllTime) * 100).toFixed(1)
            : 0,
      };
    });

    // Calculate averages
    const monthCount = Object.keys(monthlyExpenses).length;
    const avgMonthlyExpense = monthCount > 0 ? totalAllTime / monthCount : 0;

    res.json({
      monthlyExpenses,
      monthlyPayments,
      categoryBreakdown: categoryPercentages,
      summary: {
        totalExpenses: totalAllTime,
        totalPayments: paidInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        avgMonthlyExpense: avgMonthlyExpense.toFixed(2),
        monthsTracked: monthCount,
        totalTransactions: expenses.length,
      },
    });
  } catch (error) {
    console.error("Get monthly analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get category trends
export const getCategoryTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6; // Last 6 months by default

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - months);

    const expenses = await Expense.find({
      "splits.user": userId,
      date: { $gte: sixMonthsAgo },
    }).sort({ date: 1 });

    const trends = {};

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7);
      const userSplit = expense.splits.find(
        (s) => s.user.toString() === userId
      );
      const amount = userSplit?.amount || 0;

      if (!trends[month]) {
        trends[month] = {};
      }

      if (!trends[month][expense.category]) {
        trends[month][expense.category] = 0;
      }

      trends[month][expense.category] += amount;
    });

    res.json({ trends });
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
