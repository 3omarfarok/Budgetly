import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// Get balance summary for all users (in same house)
export const getBalances = async (req, res) => {
  try {
    // Get current user to find their house
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    // Only get users from the same house
    const users = await User.find({
      isActive: true,
      house: currentUser.house,
    });

    // Only get expenses and payments from the same house
    const expenses = await Expense.find({ house: currentUser.house });
    const payments = await Payment.find({
      status: "approved",
      house: currentUser.house,
    });

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

        // Calculate total paid by user (only "payment" type transactions)
        const userPayments = payments.filter(
          (payment) => payment.user.toString() === user._id.toString()
        );

        // Payments reduce debt, Received adds income
        const totalPaid = userPayments
          .filter((p) => !p.transactionType || p.transactionType === "payment")
          .reduce((sum, payment) => sum + payment.amount, 0);

        const totalReceived = userPayments
          .filter((p) => p.transactionType === "received")
          .reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate balance (paid reduces owed, received is separate income)
        const balance = totalPaid - totalOwed;

        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          totalOwed,
          totalPaid,
          totalReceived, // Track received money separately
          balance, // positive = they paid extra, negative = they owe money
        };
      })
    );

    res.json(balances);
  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get detailed stats for specific user (in same house)
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get current user to find their house
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    // Get user expenses (only from same house)
    const expenses = await Expense.find({
      "splits.user": userId,
      house: currentUser.house,
    })
      .populate("createdBy", "name username")
      .populate("splits.user", "name username")
      .sort({ date: -1 });

    // Get user payments (only from same house)
    const payments = await Payment.find({
      user: userId,
      status: "approved",
      house: currentUser.house,
    })
      .populate("recordedBy", "name username")
      .sort({ date: -1 });

    // Calculate totals - only count "payment" type for totalPaid
    const totalOwed = expenses.reduce((sum, expense) => {
      const userSplit = expense.splits.find(
        (split) => split.user._id.toString() === userId
      );
      return sum + (userSplit ? userSplit.amount : 0);
    }, 0);

    const totalPaid = payments
      .filter((p) => !p.transactionType || p.transactionType === "payment")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const totalReceived = payments
      .filter((p) => p.transactionType === "received")
      .reduce((sum, payment) => sum + payment.amount, 0);

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
      totalReceived, // Track received money separately
      balance,
      expenseCount: expenses.length,
      paymentCount: payments.length,
      categoryBreakdown,
      // Include userShare in each expense for display
      recentExpenses: expenses.slice(0, 5).map((expense) => {
        const userSplit = expense.splits.find(
          (split) => split.user._id.toString() === userId
        );
        return {
          _id: expense._id,
          description: expense.description,
          category: expense.category,
          totalAmount: expense.totalAmount,
          userShare: userSplit ? userSplit.amount : 0,
          date: expense.date,
          createdBy: expense.createdBy,
        };
      }),
      recentPayments: payments.slice(0, 5),
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get admin dashboard stats (for same house)
export const getAdminDashboard = async (req, res) => {
  try {
    // Get current user to find their house
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    // Only get users, expenses, and payments from the same house
    const users = await User.find({
      isActive: true,
      house: currentUser.house,
    });
    const expenses = await Expense.find({ house: currentUser.house });
    const payments = await Payment.find({
      status: "approved",
      house: currentUser.house,
    });

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

        // Only count "payment" type for balance calculation
        const totalPaid = userPayments
          .filter((p) => !p.transactionType || p.transactionType === "payment")
          .reduce((sum, payment) => sum + payment.amount, 0);

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
};
