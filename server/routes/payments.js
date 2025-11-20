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
      .populate('approvedBy', 'name username')
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
      .populate('approvedBy', 'name username')
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment
router.post('/', authenticate, async (req, res) => {
  try {
    const { user, amount, description, date } = req.body;

    const payment = await Payment.create({
      user,
      amount,
      description,
      date,
      recordedBy: req.user.id,
      status: 'pending'
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

// Update payment (only if pending)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Only allow updates if pending and user is the owner or admin
    if (payment.status !== 'pending') {
      return res.status(403).json({ message: 'Can only edit pending payments' });
    }

    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    payment.amount = amount || payment.amount;
    payment.description = description || payment.description;
    payment.date = date || payment.date;
    
    await payment.save();
    
    const updatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name username')
      .populate('recordedBy', 'name username');

    res.json(updatedPayment);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve payment (Admin only)
router.patch('/:id/approve', authenticate, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedBy: req.user.id
      },
      { new: true }
    )
      .populate('user', 'name username')
      .populate('recordedBy', 'name username')
      .populate('approvedBy', 'name username');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject payment (Admin only)
router.patch('/:id/reject', authenticate, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        approvedBy: req.user.id
      },
      { new: true }
    )
      .populate('user', 'name username')
      .populate('recordedBy', 'name username')
      .populate('approvedBy', 'name username');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete payment (only if pending)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Only allow deletion if pending and user is the owner or admin
    if (payment.status !== 'pending') {
      return res.status(403).json({ message: 'Can only delete pending payments' });
    }

    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;