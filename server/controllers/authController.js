import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

// Register
export const register = async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    // Validation
    if (!username || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (without house initially)
    const user = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      role: "user",
    });

    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        house: null,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user and populate house
    const user = await User.findOne({ username }).populate(
      "house",
      "name admin members"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is inactive" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        house: user.house,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("house", "name admin members");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      house: user.house,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "البريد الإلكتروني غير مسجل" });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Assuming client runs on port 5173 default for Vite
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const message = `لقد طلبت إعادة تعيين كلمة المرور. يرجى الدخول على الرابط التالي لإعادة تعيينها:\n\n${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "إعادة تعيين كلمة المرور - Budgetly",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (error) {
      console.error("Send email error:", error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "الرابط غير صالح أو انتهت صلاحيته" });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.email) fieldsToUpdate.email = req.body.email;
    if (req.body.name) fieldsToUpdate.name = req.body.name;

    // Check if email is already taken by another user
    if (req.body.email) {
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail && existingEmail._id.toString() !== req.user.id) {
        return res
          .status(400)
          .json({ message: "البريد الإلكتروني مستخدم بالفعل" });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        house: user.house,
        profilePicture: user.profilePicture,
      },
      message: "تم تحديث البيانات بنجاح",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
