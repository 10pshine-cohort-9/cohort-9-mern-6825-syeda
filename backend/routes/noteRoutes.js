const express = require("express");
const {
  getNotes,
  getTrashedNotes,
  getNoteById,
  createNote,
  updateNote,
  togglePin,
  trashNote,
  restoreNote,
  permanentlyDeleteNote,
} = require("../controllers/notes");
const { protect } = require("../middleware/Auth");

const router = express.Router();

router.use(protect);

// Specific routes MUST come before /:id, otherwise Express treats
// "trash" as if it were an :id parameter and routes it to getNoteById.
router.get("/trash", getTrashedNotes);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.patch("/:id/pin", togglePin);
router.patch("/:id/restore", restoreNote);
router.delete("/:id/permanent", permanentlyDeleteNote);
router.delete("/:id", trashNote);

module.exports = router;