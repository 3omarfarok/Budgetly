import express from 'express';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses
router.get('/', authenticate, async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('createdBy', 'name username')
      .populate('splits.user', 'name username')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { description, category, totalAmount, splitType, splits, selectedUsers, customSplits } = req.body;

    let finalSplits = [];

    if (splitType === 'equal') {
      // Get all active users
      const users = await User.find({ isActive: true });
      const amountPerUser = totalAmount / users.length;
      
      finalSplits = users.map(user => ({
        user: user._id,
        amount: amountPerUser
      }));
    } else if (splitType === 'specific') {
      // Split equally among selected users
      const amountPerUser = totalAmount / selectedUsers.length;
      
      finalSplits = selectedUsers.map(userId => ({
        user: userId,
        amount: amountPerUser
      }));
    } else if (splitType === 'custom') {
      // Custom amounts per user
      finalSplits = customSplits;
    }

    const expense = await Expense.create({
      description,
      category,
      totalAmount,
      splitType,
      splits: finalSplits,
      createdBy: req.user.id
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'name username')
      .populate('splits.user', 'name username');

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update expense (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { description, category, totalAmount, splitType, splits, selectedUsers, customSplits } = req.body;

    let finalSplits = [];

    if (splitType === 'equal') {
      const users = await User.find({ isActive: true });
      const amountPerUser = totalAmount / users.length;
      finalSplits = users.map(user => ({
        user: user._id,
        amount: amountPerUser
      }));
    } else if (splitType === 'specific') {
      const amountPerUser = totalAmount / selectedUsers.length;
      finalSplits = selectedUsers.map(userId => ({
        user: userId,
        amount: amountPerUser
      }));
    } else if (splitType === 'custom') {
      finalSplits = customSplits;
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        description,
        category,
        totalAmount,
        splitType,
        splits: finalSplits
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name username')
      .populate('splits.user', 'name username');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete expense (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;