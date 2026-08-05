import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";
import { useAuth } from "../context/AuthContext";

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
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
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError("Logout failed. Please try again.");
    }
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setShowForm(true);
  };

  const handleOpenNote = (note) => {
    if (view === "trash") return;
    setEditingNote(note);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    if (editingNote) {
      const res = await api.put(`/notes/${editingNote._id}`, data);
      setNotes((prev) => prev.map((n) => (n._id === editingNote._id ? res.data : n)));
    } else {
      const res = await api.post("/notes", data);
      setNotes((prev) => [res.data, ...prev]);
    }
    setShowForm(false);
    setEditingNote(null);
  };

  const handleTogglePin = async (note) => {
    const optimistic = { ...note, pinned: !note.pinned };
    setNotes((prev) => prev.map((n) => (n._id === note._id ? optimistic : n)));
    try {
      await api.patch(`/notes/${note._id}/pin`);
    } catch (err) {
      setNotes((prev) => prev.map((n) => (n._id === note._id ? note : n)));
      setError("Failed to update pin");
    }
  };

  const handleTrash = async (id) => {
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

  const handleRestore = async (id) => {
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

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Permanently delete this note? This cannot be undone.")) return;
    const previous = trashedNotes;
    setTrashedNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      await api.delete(`/notes/${id}/permanent`);
    } catch (err) {
      setTrashedNotes(previous);
      setError("Failed to delete note");
    }
  };

  const filteredActive = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const pinnedNotes = filteredActive.filter((n) => n.pinned);
  const unpinnedNotes = filteredActive.filter((n) => !n.pinned);

  const filteredTrash = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trashedNotes;
    return trashedNotes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [trashedNotes, search]);

  const cardProps = {
    onOpen: handleOpenNote,
    onTogglePin: handleTogglePin,
    onTrash: handleTrash,
    onRestore: handleRestore,
    onPermanentDelete: handlePermanentDelete,
  };

  return (
    <div className="flex bg-[#F7F7FA] min-h-screen">
      <Sidebar
        view={view}
        onViewChange={setView}
        onNewNote={handleNewNote}
        counts={{ all: notes.length, pinned: notes.filter((n) => n.pinned).length, trash: trashedNotes.length }}
      />

      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C] transition-shadow duration-150"
            />
          </div>

       <div className="flex items-center gap-3">
  <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-full pl-1.5 pr-1 py-1 shadow-sm">
    <div className="w-7 h-7 rounded-full bg-[#10151F] flex items-center justify-center shrink-0">
      <span className="font-['Space_Grotesk'] text-xs font-bold text-[#FFC93C]">
        {user?.name?.charAt(0).toUpperCase() || "?"}
      </span>
    </div>
    <span className="text-sm font-medium text-gray-700 hidden sm:block pr-1">
      {user?.name}
    </span>
    <button
      onClick={handleLogout}
      className="flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
      title="Log out"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
    </button>
  </div>
</div>

        </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10151F] to-[#1c2433] px-6 py-5 mb-6 animate-fade-in-up">
  <div
    className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
    style={{ background: "#FFC93C" }}
  />
  <div
    className="absolute -bottom-8 right-16 w-20 h-20 rounded-full opacity-10"
    style={{ background: "#E8553D" }}
  />

  <div className="relative">
    <h1 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-1">
      Welcome back, {user?.name}
      <span className="font-['Caveat'] text-2xl text-[#FFC93C] ml-2">wonderful</span>
    </h1>
    <p className="text-white/60 text-sm">
      {view === "trash"
        ? "Notes here are kept for 30 days before permanent deletion."
        : "You have a few notes in your Library."}
    </p>
  </div>
</div>



        <p className="text-gray-500 text-sm mb-6">
          {view === "trash"
            ? "Notes here are kept for 30 days before permanent deletion."
            : "You have a few notes in your Library."}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading notes...</p>
        ) : view === "trash" ? (
          filteredTrash.length === 0 ? (
            <p className="text-gray-400 text-sm">Trash is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrash.map((note) => (
                <NoteCard key={note._id} note={note} view="trash" {...cardProps} />
              ))}
            </div>
          )
        ) : view === "pinned" ? (
          pinnedNotes.length === 0 ? (
            <p className="text-gray-400 text-sm">No pinned notes yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard key={note._id} note={note} view="pinned" {...cardProps} />
              ))}
            </div>
          )
        ) : filteredActive.length === 0 ? (
          <p className="text-gray-400 text-sm">
            {search ? "No notes match your search." : "No notes yet. Create your first one!"}
          </p>
        ) : (
          <div className="space-y-8">
            {pinnedNotes.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  Pinned Notes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard key={note._id} note={note} view="all" {...cardProps} />
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                All Notes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard key={note._id} note={note} view="all" {...cardProps} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {showForm && (
        <NoteForm
          initialNote={editingNote}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;