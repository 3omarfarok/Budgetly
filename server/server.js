import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import expenseRoutes from './routes/expenses.js';
import paymentRoutes from './routes/payments.js';
import statsRoutes from './routes/stats.js';
import analyticsRoutes from './routes/analytics.js';

// Import models
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    // Create default admin user if doesn't exist
    const adminExists = await User.findOne({ username: 'gaper' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'gaper',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin'
      });
      console.log('✅ Default admin user created (username: gaper, password: admin123)');
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running! 🚀' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});