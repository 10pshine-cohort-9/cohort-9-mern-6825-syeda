import { useState, useEffect } from "react";
import api from "../api/axios";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNote(null);
    setShowForm(true);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;

    const previous = notes;
    setNotes(notes.filter((n) => n._id !== id));

    try {
      await api.delete(`/notes/${id}`);
    } catch (err) {
      setNotes(previous);
      setError("Failed to delete note");
    }
  };

  const handleSubmit = async (data) => {
    if (editingNote) {
      const res = await api.put(`/notes/${editingNote._id}`, data);
      setNotes(notes.map((n) => (n._id === editingNote._id ? res.data : n)));
    } else {
      const res = await api.post("/notes", data);
      setNotes([res.data, ...notes]);
    }
    setShowForm(false);
    setEditingNote(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Note
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>
      )}

      {showForm && (
        <div className="mb-6">
          <NoteForm initialNote={editingNote} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notes yet. Create your first one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;