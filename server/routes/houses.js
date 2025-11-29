import express from "express";
import bcrypt from "bcryptjs";
import House from "../models/House.js";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all houses
router.get("/", async (req, res) => {
  try {
    const houses = await House.find()
      .populate("admin", "name username")
      .select("name admin members createdAt"); // Exclude password

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
      .populate("members", "name username profilePicture")
      .select("-password"); // Exclude password

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
    const { name, password } = req.body;

    if (!name) {
      return res.status(400).json({ message: "House name is required" });
    }

    if (!password || password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters" });
    }

    // Get user
    const user = await User.findById(req.user.id);

    // If user already has a house, remove them from it
    if (user.house) {
      const oldHouse = await House.findById(user.house);
      if (oldHouse) {
        // Remove user from old house members
        oldHouse.members = oldHouse.members.filter(
          (memberId) => memberId.toString() !== user._id.toString()
        );
        await oldHouse.save();
      }
    }

    // Check if house name already exists
    const existingHouse = await House.findOne({ name });
    if (existingHouse) {
      return res.status(400).json({ message: "House name already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create house
    const house = await House.create({
      name,
      admin: req.user.id,
      members: [req.user.id],
      password: hashedPassword,
    });

    // Update user
    user.house = house._id;
    user.role = "admin"; // Become admin of the house
    await user.save();

    const populatedHouse = await House.findById(house._id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture")
      .select("-password"); // Exclude password from response

    res.status(201).json(populatedHouse);
  } catch (error) {
    console.error("Create house error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Join a house
router.post("/:id/join", authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    // If user already has a house, remove them from it
    if (user.house) {
      const oldHouse = await House.findById(user.house);
      if (oldHouse) {
        // Remove user from old house members
        oldHouse.members = oldHouse.members.filter(
          (memberId) => memberId.toString() !== user._id.toString()
        );
        await oldHouse.save();
      }
    }

    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Verify password
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const isPasswordValid = await bcrypt.compare(password, house.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Incorrect password" });
    }

    // Check if user is already a member
    const isAlreadyMember = house.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    if (!isAlreadyMember) {
      // Add user to house
      house.members.push(user._id);
      await house.save();
    }

    // Update user
    user.house = house._id;
    user.role = "user"; // Regular member
    await user.save();

    const populatedHouse = await House.findById(house._id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture")
      .select("-password"); // Exclude password from response

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

// Leave house
router.post("/:id/leave", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is in this house
    if (!user.house || user.house.toString() !== house._id.toString()) {
      return res.status(400).json({ message: "You are not in this house" });
    }

    // Admin cannot leave their own house
    if (house.admin.toString() === user._id.toString()) {
      return res.status(400).json({
        message:
          "House admin cannot leave. Delete the house or transfer admin rights first.",
      });
    }

    // Remove user from house members
    house.members = house.members.filter(
      (memberId) => memberId.toString() !== user._id.toString()
    );
    await house.save();

    // Update user
    user.house = null;
    user.role = "user";
    await user.save();

    res.json({ message: "Successfully left the house" });
  } catch (error) {
    console.error("Leave house error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove member from house (admin only)
router.delete("/:id/members/:memberId", authenticate, async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is admin of this house
    if (house.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the house admin can remove members" });
    }

    const memberId = req.params.memberId;

    // Cannot remove admin
    if (house.admin.toString() === memberId) {
      return res.status(400).json({ message: "Cannot remove house admin" });
    }

    // Check if member exists in house
    const memberIndex = house.members.findIndex(
      (id) => id.toString() === memberId
    );
    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ message: "Member not found in this house" });
    }

    // Remove member from house
    house.members.splice(memberIndex, 1);
    await house.save();

    // Update user
    await User.findByIdAndUpdate(memberId, {
      $set: { house: null, role: "user" },
    });

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove member error:", error);
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
