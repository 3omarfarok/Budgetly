import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getHouses,
  getHouse,
  createHouse,
  joinHouse,
  updateHouseName,
  updateHouseId,
  updateHousePassword,
  leaveHouse,
  removeMember,
  deleteHouse,
  clearAllHouseData,
  exportHouseData,
} from "../controllers/houseController.js";

const router = express.Router();

// Get all houses
router.get("/", getHouses);

// Get house details
router.get("/:id", authenticate, getHouse);

// Create new house
router.post("/", authenticate, createHouse);

// Join a house
router.post("/:id/join", authenticate, joinHouse);

// Update house name (admin only)
router.patch("/:id/name", authenticate, updateHouseName);

// Update house ID (admin only)
router.patch("/:id/houseId", authenticate, updateHouseId);

// Update house password (admin only)
router.patch("/:id/password", authenticate, updateHousePassword);

// Leave house
router.post("/:id/leave", authenticate, leaveHouse);

// Remove member from house (admin only)
router.delete("/:id/members/:memberId", authenticate, removeMember);

// Clear all house data (expenses, invoices, payments) - admin only
router.delete("/:id/clear-data", authenticate, clearAllHouseData);

// Export house data as CSV - admin only
router.get("/:id/export/:type", authenticate, exportHouseData);

// Delete house (admin only)
router.delete("/:id", authenticate, deleteHouse);

export default router;
