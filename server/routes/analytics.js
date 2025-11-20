import express from 'express';
import Expense from '../models/Expense.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get monthly analytics for user
router.get('/monthly/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get all expenses for this user
     const expenses = await Expense.find({
      'splits.user': userId
    }).sort({ date: -1 });

    // Get all approved payments for this user
    const payments = await Payment.find({
      user: userId,
      status: 'approved'
    }).sort({ date: -1 });

    // Group expenses by month
    const monthlyExpenses = {};
    expenses.forEach(expense => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      const userSplit = expense.splits.find(s => s.user.toString() === userId);
      
      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = {
          total: 0,
          categories: {},
          count: 0
        };
      }
      
      monthlyExpenses[month].total += userSplit?.amount || 0;
      monthlyExpenses[month].count += 1;
      
      // Group by category
      if (!monthlyExpenses[month].categories[expense.category]) {
        monthlyExpenses[month].categories[expense.category] = 0;
      }
      monthlyExpenses[month].categories[expense.category] += userSplit?.amount || 0;
    });

    // Group payments by month
    const monthlyPayments = {};
    payments.forEach(payment => {
      const month = new Date(payment.date).toISOString().slice(0, 7);
      
      if (!monthlyPayments[month]) {
        monthlyPayments[month] = {
          total: 0,
          count: 0
        };
      }
      
      monthlyPayments[month].total += payment.amount;
      monthlyPayments[month].count += 1;
    });

    // Calculate category breakdown (all time)
    const categoryBreakdown = {};
    let totalAllTime = 0;
    
    expenses.forEach(expense => {
      const userSplit = expense.splits.find(s => s.user.toString() === userId);
      const amount = userSplit?.amount || 0;
      
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = 0;
      }
      categoryBreakdown[expense.category] += amount;
      totalAllTime += amount;
    });

    // Convert to percentages
    const categoryPercentages = {};
    Object.keys(categoryBreakdown).forEach(category => {
      categoryPercentages[category] = {
        amount: categoryBreakdown[category],
        percentage: totalAllTime > 0 ? (categoryBreakdown[category] / totalAllTime * 100).toFixed(1) : 0
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
        totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
        avgMonthlyExpense: avgMonthlyExpense.toFixed(2),
        monthsTracked: monthCount,
        totalTransactions: expenses.length
      }
    });

  } catch (error) {
    console.error('Get monthly analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category trends
router.get('/trends/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const months = parseInt(req.query.months) || 6; // Last 6 months by default
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - months);
    
    const expenses = await Expense.find({
      'splits.user': userId,
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    const trends = {};
    
    expenses.forEach(expense => {
      const month = new Date(expense.date).toISOString().slice(0, 7);
      const userSplit = expense.splits.find(s => s.user.toString() === userId);
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
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
