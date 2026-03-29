import mongoose from "mongoose";
import InventoryItem, {
  INVENTORY_CATEGORIES,
} from "../models/InventoryItem.js";
import User from "../models/User.js";

const VALID_STATUSES = ["out", "low", "healthy"];

const getInventoryStatus = (item) => {
  if (item.quantity === 0) {
    return "out";
  }

  if (item.quantity > 0 && item.quantity <= item.lowStockThreshold) {
    return "low";
  }

  return "healthy";
};

const toInventoryResponse = (item) => {
  const inventoryItem =
    typeof item.toObject === "function" ? item.toObject() : { ...item };

  return {
    ...inventoryItem,
    status: getInventoryStatus(inventoryItem),
  };
};

const inventorySort = (left, right) => {
  const statusOrder = {
    out: 0,
    low: 1,
    healthy: 2,
  };

  const statusComparison =
    statusOrder[left.status] - statusOrder[right.status];

  if (statusComparison !== 0) {
    return statusComparison;
  }

  const updatedAtComparison =
    new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
  }

  return left.name.localeCompare(right.name);
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.house) {
    res.status(400).json({ message: "User not in a house" });
    return null;
  }

  return user;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getInventoryItemForHouse = async (itemId, houseId, res) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(404).json({ message: "Inventory item not found" });
    return null;
  }

  const item = await InventoryItem.findById(itemId);

  if (!item) {
    res.status(404).json({ message: "Inventory item not found" });
    return null;
  }

  if (item.house.toString() !== houseId.toString()) {
    res.status(403).json({ message: "Not authorized to access this inventory item" });
    return null;
  }

  return item;
};

const normalizeCategory = (category) =>
  typeof category === "string" ? category.trim() : category;

const validateCategory = (category, res) => {
  if (category && !INVENTORY_CATEGORIES.includes(category)) {
    res.status(400).json({ message: "Invalid category" });
    return false;
  }

  return true;
};

const validateStatus = (status, res) => {
  if (status && !VALID_STATUSES.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return false;
  }

  return true;
};

const handleInventoryError = (res, error, fallbackMessage) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: fallbackMessage });
};

const populateInventoryItem = async (item) => {
  await item.populate("createdBy", "name username");
  await item.populate("updatedBy", "name username");
  return item;
};

export const getInventoryItems = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) {
      return;
    }

    const { search, status } = req.query;
    const category = normalizeCategory(req.query.category);

    if (!validateCategory(category, res) || !validateStatus(status, res)) {
      return;
    }

    const query = {
      house: currentUser.house,
    };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: escapeRegex(search), $options: "i" };
    }

    const items = await InventoryItem.find(query)
      .populate("createdBy", "name username")
      .populate("updatedBy", "name username");

    const filteredItems = items
      .map(toInventoryResponse)
      .filter((item) => !status || item.status === status)
      .sort(inventorySort);

    res.json(filteredItems);
  } catch (error) {
    console.error("Get inventory items error:", error);
    handleInventoryError(res, error, "Server error");
  }
};

export const getInventorySummary = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) {
      return;
    }

    const items = await InventoryItem.find({ house: currentUser.house })
      .populate("createdBy", "name username")
      .populate("updatedBy", "name username");

    const itemsWithStatus = items.map(toInventoryResponse);
    const lowStockCount = itemsWithStatus.filter((item) => item.status === "low").length;
    const outOfStockCount = itemsWithStatus.filter((item) => item.status === "out").length;
    const categoryCount = new Set(itemsWithStatus.map((item) => item.category)).size;
    const urgentItems = itemsWithStatus
      .filter((item) => item.status !== "healthy")
      .sort(inventorySort)
      .slice(0, 4);

    res.json({
      totalItems: itemsWithStatus.length,
      lowStockCount,
      outOfStockCount,
      categoryCount,
      urgentItems,
    });
  } catch (error) {
    console.error("Get inventory summary error:", error);
    handleInventoryError(res, error, "Server error");
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) {
      return;
    }

    const { name, quantity, unit, lowStockThreshold } = req.body;
    const category = normalizeCategory(req.body.category);

    if (!validateCategory(category, res)) {
      return;
    }

    const item = await InventoryItem.create({
      house: currentUser.house,
      name,
      category,
      quantity,
      unit,
      lowStockThreshold,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const populatedItem = await InventoryItem.findById(item._id);
    await populateInventoryItem(populatedItem);

    res.status(201).json(toInventoryResponse(populatedItem));
  } catch (error) {
    console.error("Create inventory item error:", error);
    handleInventoryError(res, error, error.message || "Server error");
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "quantity")) {
      return res.status(400).json({ message: "Quantity must be adjusted via the adjust endpoint" });
    }

    const { name, unit, lowStockThreshold } = req.body;
    const category = normalizeCategory(req.body.category);

    if (!validateCategory(category, res)) {
      return;
    }

    const item = await getInventoryItemForHouse(req.params.id, currentUser.house, res);
    if (!item) {
      return;
    }

    if (typeof name !== "undefined") {
      item.name = name;
    }

    if (typeof category !== "undefined") {
      item.category = category;
    }

    if (typeof unit !== "undefined") {
      item.unit = unit;
    }

    if (typeof lowStockThreshold !== "undefined") {
      item.lowStockThreshold = lowStockThreshold;
    }

    item.updatedBy = req.user.id;
    await item.save();
    await populateInventoryItem(item);

    res.json(toInventoryResponse(item));
  } catch (error) {
    console.error("Update inventory item error:", error);
    handleInventoryError(res, error, error.message || "Server error");
  }
};

export const adjustInventoryItem = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) {
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const { action, amount } = req.body;

    if (!["increment", "decrement", "set"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    if (["increment", "decrement"].includes(action) && amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (action === "set" && amount < 0) {
      return res.status(400).json({ message: "Amount must be greater than or equal to 0" });
    }

    let item = null;

    if (action === "increment") {
      item = await InventoryItem.findOneAndUpdate(
        { _id: req.params.id, house: currentUser.house },
        {
          $inc: { quantity: amount },
          $set: { updatedBy: req.user.id },
        },
        { new: true, runValidators: true },
      );
    }

    if (action === "set") {
      item = await InventoryItem.findOneAndUpdate(
        { _id: req.params.id, house: currentUser.house },
        {
          $set: {
            quantity: amount,
            updatedBy: req.user.id,
          },
        },
        { new: true, runValidators: true },
      );
    }

    if (action === "decrement") {
      item = await InventoryItem.findOneAndUpdate(
        {
          _id: req.params.id,
          house: currentUser.house,
          quantity: { $gte: amount },
        },
        {
          $inc: { quantity: -amount },
          $set: { updatedBy: req.user.id },
        },
        { new: true, runValidators: true },
      );

      if (!item) {
        const accessibleItem = await InventoryItem.findOne({
          _id: req.params.id,
          house: currentUser.house,
        });

        if (accessibleItem) {
          return res.status(400).json({ message: "Quantity cannot go below zero" });
        }
      }
    }

    if (!item) {
      item = await getInventoryItemForHouse(req.params.id, currentUser.house, res);
      if (!item) {
        return;
      }
    }

    await populateInventoryItem(item);

    res.json(toInventoryResponse(item));
  } catch (error) {
    console.error("Adjust inventory item error:", error);
    handleInventoryError(res, error, error.message || "Server error");
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) {
      return;
    }

    const item = await getInventoryItemForHouse(req.params.id, currentUser.house, res);
    if (!item) {
      return;
    }

    await item.deleteOne();

    res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Delete inventory item error:", error);
    handleInventoryError(res, error, "Server error");
  }
};
