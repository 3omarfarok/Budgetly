import express from "express";
import {
  getNotes,
  createNote,
  deleteNote,
  addReply,
} from "../controllers/noteController.js";
import { authenticate as protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotes);
router.post("/", createNote);
router.post("/:id/reply", addReply);
router.delete("/:id", deleteNote);

export default router;
