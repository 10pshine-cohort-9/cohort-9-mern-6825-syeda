const Note = require("../models/Note");
const logger = require("../config/logger");

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.id, trashed: false }).sort({
      updatedAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    logger.error({ err: error }, "GetNotes error");
    res.status(500).json({ message: "Server error fetching notes" });
  }
};

const getTrashedNotes = async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.id, trashed: true }).sort({
      trashedAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    logger.error({ err: error }, "GetTrashedNotes error");
    res.status(500).json({ message: "Server error fetching trash" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    logger.error({ err: error }, "GetNoteById error");
    res.status(500).json({ message: "Server error fetching note" });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Please provide a title" });
    }

    const note = await Note.create({
      title,
      content: content || "",
      owner: req.user.id,
    });

    logger.info({ noteId: note._id, userId: req.user.id }, "Note created");

    res.status(201).json(note);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    logger.error({ err: error }, "CreateNote error");
    res.status(500).json({ message: "Server error creating note" });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    logger.info({ noteId: note._id, userId: req.user.id }, "Note updated");

    res.status(200).json(note);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    logger.error({ err: error }, "UpdateNote error");
    res.status(500).json({ message: "Server error updating note" });
  }
};

const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.pinned = !note.pinned;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    logger.error({ err: error }, "TogglePin error");
    res.status(500).json({ message: "Server error updating pin" });
  }
};

const trashNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.trashed = true;
    note.trashedAt = new Date();
    note.pinned = false;
    await note.save();

    logger.info({ noteId: note._id, userId: req.user.id }, "Note moved to trash");

    res.status(200).json(note);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    logger.error({ err: error }, "TrashNote error");
    res.status(500).json({ message: "Server error moving note to trash" });
  }
};

const restoreNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.trashed = false;
    note.trashedAt = null;
    await note.save();

    logger.info({ noteId: note._id, userId: req.user.id }, "Note restored");

    res.status(200).json(note);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    logger.error({ err: error }, "RestoreNote error");
    res.status(500).json({ message: "Server error restoring note" });
  }
};

const permanentlyDeleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
      trashed: true,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found in trash" });
    }

    logger.info({ noteId: note._id, userId: req.user.id }, "Note permanently deleted");

    res.status(200).json({ message: "Note permanently deleted" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    logger.error({ err: error }, "PermanentlyDeleteNote error");
    res.status(500).json({ message: "Server error deleting note" });
  }
};

module.exports = {
  getNotes,
  getTrashedNotes,
  getNoteById,
  createNote,
  updateNote,
  togglePin,
  trashNote,
  restoreNote,
  permanentlyDeleteNote,
};