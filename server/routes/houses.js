import express from "express";
import House from "../models/House.js";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all houses
router.get("/", async (req, res) => {
  try {
    const houses = await House.find()
      .populate("admin", "name username")
      .select("name admin members createdAt");

    // Add member count to response
    const housesWithCount = houses.map((house) => ({
      _id: house._id,
      name: house.name,
      admin: house.admin,
      memberCount: house.members.length,
      createdAt: house.createdAt,
    }));

    res.json(housesWithCount);
  } catch (error) {
    console.error("Get houses error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get house details
router.get("/:id", authenticate, async (req, res) => {
  try {
    const house = await House.findById(req.params.id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture");

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    res.json(house);
  } catch (error) {
    console.error("Get house error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new house
router.post("/", authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "House name is required" });
    }

    // Check if user already has a house
    const user = await User.findById(req.user.id);
    if (user.house) {
      return res
        .status(400)
        .json({
          message:
            "You are already in a house. Leave your current house first.",
        });
    }

    // Check if house name already exists
    const existingHouse = await House.findOne({ name });
    if (existingHouse) {
      return res.status(400).json({ message: "House name already exists" });
    }

    // Create house
    const house = await House.create({
      name,
      admin: req.user.id,
      members: [req.user.id],
    });

    // Update user
    user.house = house._id;
    user.role = "admin"; // Become admin of the house
    await user.save();

    const populatedHouse = await House.findById(house._id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture");

    res.status(201).json(populatedHouse);
  } catch (error) {
    console.error("Create house error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Join a house
router.post("/:id/join", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check if user already has a house
    if (user.house) {
      return res
        .status(400)
        .json({
          message:
            "You are already in a house. Leave your current house first.",
        });
    }

    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Add user to house
    house.members.push(user._id);
    await house.save();

    // Update user
    user.house = house._id;
    user.role = "user"; // Regular member
    await user.save();

    const populatedHouse = await House.findById(house._id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture");

    res.json(populatedHouse);
  } catch (error) {
    console.error("Join house error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update house name (admin only)
router.patch("/:id/name", authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "House name is required" });
    }

    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is admin of this house
    if (house.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the house admin can change the name" });
    }

    // Check if new name already exists
    const existingHouse = await House.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (existingHouse) {
      return res.status(400).json({ message: "House name already exists" });
    }

    house.name = name;
    await house.save();

    const populatedHouse = await House.findById(house._id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture");

    res.json(populatedHouse);
  } catch (error) {
    console.error("Update house name error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete house (admin only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is admin of this house
    if (house.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the house admin can delete the house" });
    }

    // Remove house reference from all members
    await User.updateMany(
      { house: house._id },
      { $set: { house: null, role: "user" } }
    );

    await House.findByIdAndDelete(req.params.id);

    res.json({ message: "House deleted successfully" });
  } catch (error) {
    console.error("Delete house error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
