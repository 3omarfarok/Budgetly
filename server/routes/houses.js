import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getHouses,
  getHouse,
  createHouse,
  joinHouse,
  updateHouseName,
  leaveHouse,
  removeMember,
  deleteHouse,
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

// Leave house
router.post("/:id/leave", authenticate, leaveHouse);

// Remove member from house (admin only)
router.delete("/:id/members/:memberId", authenticate, removeMember);

// Delete house (admin only)
router.delete("/:id", authenticate, deleteHouse);

export default router;
