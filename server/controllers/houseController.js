import House from "../models/House.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get all houses
export const getHouses = async (req, res) => {
  try {
    const houses = await House.find()
      .populate("admin", "name username")
      .select("name houseId admin members createdAt"); // Exclude password

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
};

// Get house details
export const getHouse = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id === "undefined" || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid house ID" });
    }

    const house = await House.findById(id)
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
};

// Create new house
export const createHouse = async (req, res) => {
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

    // Generate new token with updated role
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const populatedHouse = await House.findById(house._id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture")
      .select("-password"); // Exclude password from response

    res.status(201).json({ house: populatedHouse, token });
  } catch (error) {
    console.error("Create house error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Join a house
export const joinHouse = async (req, res) => {
  try {
    const { password } = req.body;
    const { id } = req.params;

    // Validate ID format
    if (!id || id === "undefined" || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid house ID" });
    }

    // Verify password is provided
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    const house = await House.findById(id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Verify password - ensure house.password exists
    if (!house.password) {
      console.error("House has no password:", id);
      return res.status(500).json({ message: "House configuration error" });
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, house.password);
      if (!isPasswordValid) {
        return res.status(403).json({ message: "Incorrect password" });
      }
    } catch (bcryptError) {
      console.error("Bcrypt comparison error:", bcryptError);
      return res.status(500).json({ message: "Authentication error" });
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
    console.error("Join house error:", error.message, error.stack);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Update house name (admin only)
export const updateHouseName = async (req, res) => {
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
};

// Update house password (admin only)
export const updateHousePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters" });
    }

    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is admin of this house
    if (house.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the house admin can change the password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    house.password = hashedPassword;
    await house.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update house password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update house ID (admin only)
export const updateHouseId = async (req, res) => {
  try {
    const { houseId } = req.body;

    if (!houseId) {
      return res.status(400).json({ message: "House ID is required" });
    }

    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is admin of this house
    if (house.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the house admin can change the house ID" });
    }

    // Check if new ID already exists
    const existingHouse = await House.findOne({
      houseId,
      _id: { $ne: req.params.id },
    });
    if (existingHouse) {
      return res.status(400).json({ message: "House ID already exists" });
    }

    house.houseId = houseId;
    await house.save();

    const populatedHouse = await House.findById(house._id)
      .populate("admin", "name username profilePicture")
      .populate("members", "name username profilePicture");

    res.json(populatedHouse);
  } catch (error) {
    console.error("Update house ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Leave house
export const leaveHouse = async (req, res) => {
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
};

// Remove member from house (admin only)
export const removeMember = async (req, res) => {
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
};

// Delete house (admin only)
export const deleteHouse = async (req, res) => {
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
};
