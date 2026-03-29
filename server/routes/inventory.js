import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  adjustInventoryItem,
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  getInventorySummary,
  updateInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getInventoryItems);
router.get("/summary", getInventorySummary);
router.post("/", createInventoryItem);
router.patch("/:id", updateInventoryItem);
router.patch("/:id/adjust", adjustInventoryItem);
router.delete("/:id", deleteInventoryItem);

export default router;
