import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/**
 * useNotes
 * Owns all note/trash data fetching + mutations (with optimistic updates)
 * so Dashboard.jsx only has to deal with layout and view state.
 */
export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [notesRes, trashRes] = await Promise.all([
        api.get("/notes"),
        api.get("/notes/trash"),
      ]);
      setNotes(notesRes.data);
      setTrashedNotes(trashRes.data);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const saveNote = async (editingNote, data) => {
    try {
      if (editingNote) {
        const res = await api.put(`/notes/${editingNote._id}`, data);
        setNotes((prev) => prev.map((n) => (n._id === editingNote._id ? res.data : n)));
      } else {
        const res = await api.post("/notes", data);
        setNotes((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      setError("Failed to save note");
      throw err;
    }
  };

  const togglePin = async (note) => {
    const optimistic = { ...note, pinned: !note.pinned };
    setNotes((prev) => prev.map((n) => (n._id === note._id ? optimistic : n)));
    try {
      await api.patch(`/notes/${note._id}/pin`);
    } catch (err) {
      setNotes((prev) => prev.map((n) => (n._id === note._id ? note : n)));
      setError("Failed to update pin");
    }
  };

  const trashNote = async (id) => {
    const note = notes.find((n) => n._id === id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      const res = await api.delete(`/notes/${id}`);
      setTrashedNotes((prev) => [res.data, ...prev]);
    } catch (err) {
      if (note) setNotes((prev) => [note, ...prev]);
      setError("Failed to move note to trash");
    }
  };

  const restoreNote = async (id) => {
    const note = trashedNotes.find((n) => n._id === id);
    setTrashedNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      const res = await api.patch(`/notes/${id}/restore`);
      setNotes((prev) => [res.data, ...prev]);
    } catch (err) {
      if (note) setTrashedNotes((prev) => [note, ...prev]);
      setError("Failed to restore note");
    }
  };

  const permanentlyDeleteNote = async (id) => {
    const noteToRestore = trashedNotes.find((n) => n._id === id);
    setTrashedNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      await api.delete(`/notes/${id}/permanent`);
    } catch (err) {
      if (noteToRestore) setTrashedNotes((prev) => [noteToRestore, ...prev]);
      setError("Failed to delete note");
    }
  };

  return {
    notes,
    trashedNotes,
    loading,
    error,
    setError,
    fetchAll,
    saveNote,
    togglePin,
    trashNote,
    restoreNote,
    permanentlyDeleteNote,
  };
};