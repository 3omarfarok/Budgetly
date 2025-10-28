import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
