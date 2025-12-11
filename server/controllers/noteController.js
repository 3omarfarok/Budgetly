import Note from "../models/Note.js";
import User from "../models/User.js";

// Get all notes for the user's house
export const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.house) {
      return res
        .status(400)
        .json({ message: "You must be in a house to view notes" });
    }

    const notes = await Note.find({ house: user.house })
      .populate("createdBy", "name username")
      .sort({ date: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  try {
    const { content } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.house) {
      return res
        .status(400)
        .json({ message: "You must be in a house to create notes" });
    }

    const note = await Note.create({
      content,
      createdBy: req.user.id,
      house: user.house,
    });

    const populatedNote = await Note.findById(note._id).populate(
      "createdBy",
      "name username"
    );

    res.status(201).json(populatedNote);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if user is authorized to delete (admin or creator)
    if (
      req.user.role !== "admin" &&
      note.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
