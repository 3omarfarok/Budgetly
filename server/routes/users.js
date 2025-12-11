import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
  updateProfilePicture,
  updateUsername,
  updateName,
} from "../controllers/userController.js";

const router = express.Router();

// Get all users (from same house)
router.get("/", authenticate, getUsers);

// Get single user
router.get("/:id", authenticate, getUser);

// Create user (Admin only)
router.post("/", authenticate, isAdmin, createUser);

// Update user (Admin only)
router.put("/:id", authenticate, isAdmin, updateUser);

// Deactivate user (Admin only)
router.delete("/:id", authenticate, isAdmin, deactivateUser);

// Update own profile picture (Any authenticated user)
router.patch("/me/profile-picture", authenticate, updateProfilePicture);

// Update own username (Any authenticated user)
router.patch("/me/username", authenticate, updateUsername);

// Update own name (Any authenticated user)
router.patch("/me/name", authenticate, updateName);

export default router;
