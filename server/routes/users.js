import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all users (from same house)
router.get("/", authenticate, async (req, res) => {
  try {
    // Get current user to find their house
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || !currentUser.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    // Only return users from the same house
    const users = await User.find({
      isActive: true,
      house: currentUser.house,
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single user
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create user (Admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const { username, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
      name,
      role: "user",
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user (Admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Deactivate user (Admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deactivated", user });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update own profile picture (Any authenticated user)
router.patch("/me/profile-picture", authenticate, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update profile picture error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update own username (Any authenticated user)
router.patch("/me/username", authenticate, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "اليوزرنيم مينفعش يكون فاضي" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res
        .status(400)
        .json({ message: "اليوزرنيم ده موجود عند حد تاني" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username: username.trim() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update username error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update own name (Any authenticated user)
router.patch("/me/name", authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "الاسم مينفعش يكون فاضي" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update name error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
