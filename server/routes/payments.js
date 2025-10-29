import express from 'express';
import Payment from '../models/Payment.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all payments
router.get('/', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name username')
      .populate('recordedBy', 'name username')
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payments for specific user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.params.userId })
      .populate('user', 'name username')
      .populate('recordedBy', 'name username')
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { user, amount, description } = req.body;

    const payment = await Payment.create({
      user,
      amount,
      description,
      recordedBy: req.user.id
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name username')
      .populate('recordedBy', 'name username');

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { amount, description } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { amount, description },
      { new: true, runValidators: true }
    )
      .populate('user', 'name username')
      .populate('recordedBy', 'name username');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete payment (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;