import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import expenseRoutes from "./routes/expenses.js";

import statsRoutes from "./routes/stats.js";
import analyticsRoutes from "./routes/analytics.js";
import noteRoutes from "./routes/notes.js";
import housesRoutes from "./routes/houses.js";
import aiRoutes from "./routes/ai.js";
import invoiceRoutes from "./routes/invoices.js";
import dishwashingRoutes from "./routes/dishwashing.js";
import { connectToDatabase, getDatabaseStatus } from "./config/db.js";

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

// API health check (does not require an active DB connection)
app.get("/api/health", (req, res) => {
  const db = getDatabaseStatus();
  res.status(db.state === "connected" ? 200 : 503).json({
    ok: db.state === "connected",
    service: "budgetly-api",
    db,
    timestamp: new Date().toISOString(),
  });
});

// Ensure database connection before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    res.status(503).json({
      message: "Database connection is unavailable",
      hint: "Check MONGODB_URI and MongoDB Atlas network access settings",
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/houses", housesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

app.use("/api/stats", statsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
console.log("Mounting Invoice Routes...");
app.use("/api/invoices", invoiceRoutes);
app.use("/api/houses", dishwashingRoutes); // Dishwashing routes under houses

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running! 🚀" });
});

// Start local server only (Vercel uses the exported app)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;

// End of server.js
