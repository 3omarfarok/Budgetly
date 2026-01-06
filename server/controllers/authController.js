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

    // Create HTML Email Template
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const htmlMessage = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Cairo', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 40px; margin-bottom: 40px; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; text-align: center; color: #334155; }
        .content h2 { color: #0f172a; font-size: 24px; margin-bottom: 16px; font-weight: bold; }
        .content p { font-size: 16px; line-height: 1.8; margin-bottom: 32px; color: #475569; }
        .button { display: inline-block; background-color: #1d4ed8; color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.3); }
        .button:hover { background-color: #1e40af; transform: translateY(-2px); box-shadow: 0 6px 8px -1px rgba(29, 78, 216, 0.4); }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .link-text { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #94a3b8; word-break: break-all; text-align: left; direction: ltr; }
      </style>
    </head>
    <body style="background-color: #f8fafc; margin: 0; padding: 20px;">
      <div class="container">
        <div class="header">
          <h1>Budgetly</h1>
        </div>
        <div class="content">
          <h2>إعادة تعيين كلمة المرور</h2>
          <p>
            أهلاً بك،<br>
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
            اضغط على الزر أدناه لتغيير كلمة المرور الخاصة بك.
          </p>
          <a href="${resetUrl}" class="button">تغيير كلمة المرور</a>
          <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
            إذا لم تقم بطلب هذا التغيير، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
            الرابط صالح لمدة 10 دقائق فقط.
          </p>
          <div class="link-text">
            If the button doesn't work, copy and paste this link:<br>
            ${resetUrl}
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Budgetly. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const message = `لقد طلبت إعادة تعيين كلمة المرور. يرجى الدخول على الرابط التالي لإعادة تعيينها:\n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "إعادة تعيين كلمة المرور - Budgetly",
        message, // Fallback plain text
        html: htmlMessage, // HTML version
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
