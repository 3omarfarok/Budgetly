import Expense from "../models/Expense.js";
import User from "../models/User.js";

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("createdBy", "name username")
      .populate("splits.user", "name username")
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create expense (Admin only)
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
    } = req.body;

    // Get the admin user's house
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.house) {
      return res
        .status(400)
        .json({ message: "You must be in a house to create expenses" });
    }

    let finalSplits = [];

    if (splitType === "equal") {
      // Get all active users in the same house
      const users = await User.find({ isActive: true, house: adminUser.house });
      const amountPerUser = totalAmount / users.length;

      finalSplits = users.map((user) => ({
        user: user._id,
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
      createdBy: req.user.id,
      house: adminUser.house,
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("createdBy", "name username")
      .populate("splits.user", "name username");

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: error.message || "Server error" });
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

    let finalSplits = [];

    if (splitType === "equal") {
      const users = await User.find({ isActive: true });
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
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
