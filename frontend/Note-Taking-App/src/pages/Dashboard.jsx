import { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import NoteForm from "../components/NoteForm";
import ImportModal from "../components/ImportModal";
import DashboardHeader from "../components/DashboardHeader";
import WelcomeBanner from "../components/WelcomeBanner";
import NotesGrid from "../components/NotesGrid";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../hooks/useNotes";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const {
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
  } = useNotes();

  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

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
    await saveNote(editingNote, data);
    setShowForm(false);
    setEditingNote(null);
  };

  const filteredActive = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const filteredTrash = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trashedNotes;
    return trashedNotes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [trashedNotes, search]);

  const cardProps = {
    onOpen: handleOpenNote,
    onTogglePin: togglePin,
    onTrash: trashNote,
    onRestore: restoreNote,
    onPermanentDelete: permanentlyDeleteNote,
  };

  return (
    <div className="flex bg-[#F7F7FA] min-h-screen">
      <Sidebar
        view={view}
        onViewChange={setView}
        onNewNote={handleNewNote}
        onImportClick={() => setShowImportModal(true)}
        counts={{
          all: notes.length,
          pinned: notes.filter((n) => n.pinned).length,
          trash: trashedNotes.length,
        }}
      />

      <main className="flex-1 px-8 py-6">
        <DashboardHeader
          search={search}
          onSearchChange={setSearch}
          user={user}
          onLogout={handleLogout}
        />

        <WelcomeBanner userName={user?.name} isTrashView={view === "trash"} />

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}

        <NotesGrid
          view={view}
          search={search}
          loading={loading}
          filteredActive={filteredActive}
          filteredTrash={filteredTrash}
          cardProps={cardProps}
        />
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

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} onImportSuccess={fetchAll} />
      )}
    </div>
  );
};

export default Dashboard;