import House from "../models/House.js";

// Arabic day names
const ARABIC_DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

// Get today's date in Cairo timezone as YYYY-MM-DD
const getTodayInCairo = () => {
  const now = new Date();
  const cairoDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
  );
  return cairoDate.toISOString().split("T")[0];
};

// Get date N days from today in Cairo timezone
const getDateFromToday = (daysOffset) => {
  const now = new Date();
  const cairoDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
  );
  cairoDate.setDate(cairoDate.getDate() + daysOffset);
  return cairoDate.toISOString().split("T")[0];
};

// Calculate days difference between two YYYY-MM-DD dates
const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2 - d1;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Get Arabic day name from YYYY-MM-DD date
const getArabicDayName = (dateStr) => {
  const date = new Date(dateStr);
  return ARABIC_DAYS[date.getDay()];
};

// Get assigned user for a specific date
const getAssignedUserIndex = (startDate, targetDate, orderLength) => {
  const daysSinceStart = daysDifference(startDate, targetDate);
  if (daysSinceStart < 0) return -1; // Rotation hasn't started
  return daysSinceStart % orderLength;
};

// Get dishwashing rotation settings
export const getDishwashingSettings = async (req, res) => {
  try {
    const house = await House.findById(req.params.id)
      .populate("dishwashingRotation.order", "name username profilePicture")
      .select("dishwashingRotation admin");

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is member of this house
    if (!req.user.house || req.user.house.toString() !== house._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not a member of this house" });
    }

    res.json({
      enabled: house.dishwashingRotation?.enabled || false,
      startDate: house.dishwashingRotation?.startDate || null,
      order: house.dishwashingRotation?.order || [],
    });
  } catch (error) {
    console.error("Get dishwashing settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update dishwashing rotation settings (Admin only)
export const updateDishwashingSettings = async (req, res) => {
  try {
    const { enabled, startDate, order } = req.body;

    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is admin
    if (house.admin.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can update rotation settings" });
    }

    // Validation
    if (enabled) {
      if (!startDate) {
        return res.status(400).json({ message: "Start date is required" });
      }

      if (!order || order.length < 2) {
        return res
          .status(400)
          .json({ message: "At least 2 users required for rotation" });
      }

      // Check for duplicates
      const uniqueOrder = [...new Set(order)];
      if (uniqueOrder.length !== order.length) {
        return res.status(400).json({ message: "Duplicate users not allowed" });
      }

      // Check all users are house members
      const memberIds = house.members.map((m) => m.toString());
      for (const userId of order) {
        if (!memberIds.includes(userId)) {
          return res
            .status(400)
            .json({ message: "All users must be house members" });
        }
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return res
          .status(400)
          .json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
    }

    // Update settings
    house.dishwashingRotation = {
      enabled: enabled || false,
      startDate: enabled ? startDate : null,
      order: enabled ? order : [],
    };

    await house.save();

    // Return populated response
    const updatedHouse = await House.findById(house._id)
      .populate("dishwashingRotation.order", "name username profilePicture")
      .select("dishwashingRotation");

    res.json({
      enabled: updatedHouse.dishwashingRotation.enabled,
      startDate: updatedHouse.dishwashingRotation.startDate,
      order: updatedHouse.dishwashingRotation.order,
    });
  } catch (error) {
    console.error("Update dishwashing settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Disable and clear rotation settings (Admin only)
export const deleteDishwashingSettings = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is admin
    if (house.admin.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can delete rotation settings" });
    }

    house.dishwashingRotation = {
      enabled: false,
      startDate: null,
      order: [],
    };

    await house.save();

    res.json({ message: "Dishwashing rotation disabled" });
  } catch (error) {
    console.error("Delete dishwashing settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get today's assignment
export const getTodayAssignment = async (req, res) => {
  try {
    const house = await House.findById(req.params.id)
      .populate("dishwashingRotation.order", "name username profilePicture")
      .select("dishwashingRotation");

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is member
    if (!req.user.house || req.user.house.toString() !== house._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not a member of this house" });
    }

    const rotation = house.dishwashingRotation;

    if (
      !rotation?.enabled ||
      !rotation?.startDate ||
      rotation?.order?.length < 2
    ) {
      return res.json({
        enabled: false,
        message: "Rotation not configured",
      });
    }

    const today = getTodayInCairo();
    const userIndex = getAssignedUserIndex(
      rotation.startDate,
      today,
      rotation.order.length,
    );

    if (userIndex === -1) {
      return res.json({
        enabled: true,
        notStarted: true,
        startDate: rotation.startDate,
        message: "Rotation hasn't started yet",
      });
    }

    const assignedUser = rotation.order[userIndex];

    res.json({
      enabled: true,
      date: today,
      dayName: getArabicDayName(today),
      assignedUser: assignedUser,
      isCurrentUser: assignedUser._id.toString() === req.user.id.toString(),
    });
  } catch (error) {
    console.error("Get today assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get upcoming schedule
export const getSchedule = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const maxDays = 30;
    const limitedDays = Math.min(days, maxDays);

    const house = await House.findById(req.params.id)
      .populate("dishwashingRotation.order", "name username profilePicture")
      .select("dishwashingRotation");

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Check if user is member
    if (!req.user.house || req.user.house.toString() !== house._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not a member of this house" });
    }

    const rotation = house.dishwashingRotation;

    if (
      !rotation?.enabled ||
      !rotation?.startDate ||
      rotation?.order?.length < 2
    ) {
      return res.json({
        enabled: false,
        schedule: [],
        message: "Rotation not configured",
      });
    }

    const schedule = [];
    const today = getTodayInCairo();

    for (let i = 0; i < limitedDays; i++) {
      const targetDate = getDateFromToday(i);
      const userIndex = getAssignedUserIndex(
        rotation.startDate,
        targetDate,
        rotation.order.length,
      );

      if (userIndex >= 0) {
        schedule.push({
          date: targetDate,
          dayName: getArabicDayName(targetDate),
          user: rotation.order[userIndex],
          isToday: targetDate === today,
        });
      }
    }

    res.json({
      enabled: true,
      schedule,
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
