import Expense from "../models/Expense.js";
import User from "../models/User.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";

// Get all expenses with pagination
export const getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's house for filtering
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const query = { house: currentUser.house };
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }

    const totalExpenses = await Expense.countDocuments(query);
    const totalPages = Math.ceil(totalExpenses / limit);

    const expenses = await Expense.find(query)
      .populate("createdBy", "name username")
      .populate("splits.user", "name username")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      expenses,
      currentPage: page,
      totalPages,
      totalExpenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create expense
export const createExpense = async (req, res) => {
  try {
    const {
      description,
      category,
      totalAmount,
      splitType,
      splits,
      selectedUsers,
      customSplits,
      payer,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || !user.house) {
      return res
        .status(400)
        .json({ message: "You must be in a house to create expenses" });
    }

    const isAdmin = user.role === "admin";
    const status = isAdmin ? "approved" : "pending";
    const payerId = isAdmin && payer ? payer : req.user.id;

    let finalSplits = [];

    if (splitType === "equal") {
      // Get all active users in the same house
      const houseUsers = await User.find({ isActive: true, house: user.house });
      const amountPerUser = totalAmount / houseUsers.length;

      finalSplits = houseUsers.map((u) => ({
        user: u._id,
        amount: amountPerUser,
      }));
    } else if (splitType === "specific") {
      // Split equally among selected users
      const amountPerUser = totalAmount / selectedUsers.length;

      finalSplits = selectedUsers.map((userId) => ({
        user: userId,
        amount: amountPerUser,
      }));
    } else if (splitType === "custom") {
      // Custom amounts per user
      finalSplits = customSplits;
    }

    const expense = await Expense.create({
      description,
      category,
      totalAmount,
      splitType,
      splits: finalSplits,
      createdBy: payerId,
      house: user.house,
      status,
    });

    // Only generate Invoices if Admin (Approved immediately)
    if (status === "approved") {
      const invoicePromises = finalSplits.map((split) => {
        const isPayer = split.user.toString() === payerId.toString();
        return Invoice.create({
          user: split.user,
          expense: expense._id,
          amount: split.amount,
          description: description,
          status: isPayer ? "paid" : "pending",
          house: user.house,
        });
      });
      await Promise.all(invoicePromises);
    }

    const populatedExpense = await Expense.findById(expense._id)
      .populate("createdBy", "name username")
      .populate("splits.user", "name username");

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Approve Expense (Admin only)
export const approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.status !== "pending") {
      return res.status(400).json({ message: "Expense is not pending" });
    }

    expense.status = "approved";
    await expense.save();

    // Generate Invoices
    const invoicePromises = expense.splits.map((split) => {
      // Payer is the one who created the expense
      const isPayer = split.user.toString() === expense.createdBy.toString();

      return Invoice.create({
        user: split.user,
        expense: expense._id,
        amount: split.amount,
        description: expense.description,
        status: isPayer ? "paid" : "pending",
        house: expense.house,
      });
    });

    await Promise.all(invoicePromises);

    res.json({ message: "Expense approved and invoices created", expense });
  } catch (error) {
    console.error("Approve expense error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject Expense (Admin only)
export const rejectExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.status !== "pending") {
      return res.status(400).json({ message: "Expense is not pending" });
    }

    expense.status = "rejected";
    await expense.save();

    res.json({ message: "Expense rejected", expense });
  } catch (error) {
    console.error("Reject expense error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update expense (Admin only)
export const updateExpense = async (req, res) => {
  try {
    const {
      description,
      category,
      totalAmount,
      splitType,
      splits,
      selectedUsers,
      customSplits,
    } = req.body;

    // Get the expense first to know its house
    const existingExpense = await Expense.findById(req.params.id);
    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    let finalSplits = [];

    if (splitType === "equal") {
      // Get all active users in the SAME HOUSE only
      const users = await User.find({
        isActive: true,
        house: existingExpense.house,
      });
      const amountPerUser = totalAmount / users.length;
      finalSplits = users.map((user) => ({
        user: user._id,
        amount: amountPerUser,
      }));
    } else if (splitType === "specific") {
      const amountPerUser = totalAmount / selectedUsers.length;
      finalSplits = selectedUsers.map((userId) => ({
        user: userId,
        amount: amountPerUser,
      }));
    } else if (splitType === "custom") {
      finalSplits = customSplits;
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        description,
        category,
        totalAmount,
        splitType,
        splits: finalSplits,
      },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name username")
      .populate("splits.user", "name username");

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Delete expense (Admin only)
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Cascade delete: Remove all invoices linked to this expense
    await Invoice.deleteMany({ expense: expense._id });

    // Now delete the expense
    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: "Expense and related invoices deleted" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
