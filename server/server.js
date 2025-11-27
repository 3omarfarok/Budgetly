import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import expenseRoutes from "./routes/expenses.js";
import paymentRoutes from "./routes/payments.js";
import statsRoutes from "./routes/stats.js";
import analyticsRoutes from "./routes/analytics.js";
import housesRoutes from "./routes/houses.js";

// Import models
import User from "./models/User.js";
import House from "./models/House.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL, "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/expense-tracker"
  )
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Create default house if doesn't exist
    let defaultHouse = await House.findOne({ name: "Default House" });

    if (!defaultHouse) {
      // Create default admin user if doesn't exist
      let adminUser = await User.findOne({ username: "gaper" });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        adminUser = await User.create({
          username: "gaper",
          password: hashedPassword,
          role: "admin",
          name: "Admin",
        });
        console.log(
          "✅ Default admin user created (username: gaper, password: admin123)"
        );
      }

      // Create default house with admin as owner
      defaultHouse = await House.create({
        name: "Default House",
        admin: adminUser._id,
        members: [adminUser._id],
      });
      console.log("✅ Default House created");

      // Assign house to admin
      adminUser.house = defaultHouse._id;
      await adminUser.save();
    }

    // Migrate existing users without a house to default house
    const usersWithoutHouse = await User.find({ house: null });
    if (usersWithoutHouse.length > 0) {
      for (const user of usersWithoutHouse) {
        user.house = defaultHouse._id;
        await user.save();

        // Add user to house members if not already there
        if (!defaultHouse.members.includes(user._id)) {
          defaultHouse.members.push(user._id);
        }
      }
      await defaultHouse.save();
      console.log(
        `✅ Migrated ${usersWithoutHouse.length} users to Default House`
      );
    }
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

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running! 🚀" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
