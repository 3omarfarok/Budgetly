import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import expenseRoutes from "./routes/expenses.js";
import paymentRoutes from "./routes/payments.js";
import statsRoutes from "./routes/stats.js";
import analyticsRoutes from "./routes/analytics.js";
import noteRoutes from "./routes/notes.js";
import housesRoutes from "./routes/houses.js";
import aiRoutes from "./routes/ai.js";
import invoiceRoutes from "./routes/invoices.js";

import { rateLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/expense-tracker"
  )
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/houses", housesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
console.log("Mounting Invoice Routes...");
app.use("/api/invoices", invoiceRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running! 🚀" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
