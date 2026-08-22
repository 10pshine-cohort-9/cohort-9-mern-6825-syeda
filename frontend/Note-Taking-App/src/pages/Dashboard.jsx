import { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import NoteForm from "../components/NoteForm";
import ImportModal from "../components/ImportModal";
import DashboardHeader from "../components/DashboardHeader";
import WelcomeBanner from "../components/WelcomeBanner";
import NotesGrid from "../components/NotesGrid";
import FilterBar from "../components/FilterBar";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../hooks/useNotes";
import { sortNotes, filterByDateRange } from "../hooks/noteFilters";

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
  const [sortBy, setSortBy] = useState("newest");
  const [dateRange, setDateRange] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  // Controls the Sidebar's off-canvas drawer below the `lg` breakpoint;
  // ignored by Sidebar on desktop where it's always visible.
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Search -> date range -> sort, applied in that order for both the
  // active notes list and the trash list.
  const filteredActive = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? notes.filter(
          (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        )
      : notes;
    result = filterByDateRange(result, dateRange);
    return sortNotes(result, sortBy);
  }, [notes, search, dateRange, sortBy]);

  const filteredTrash = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? trashedNotes.filter(
          (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        )
      : trashedNotes;
    result = filterByDateRange(result, dateRange);
    return sortNotes(result, sortBy);
  }, [trashedNotes, search, dateRange, sortBy]);

  // Shared across the Sidebar counts and the profile drawer stats, so both
  // stay in sync from a single source.
  const counts = useMemo(
    () => ({
      all: notes.length,
      pinned: notes.filter((n) => n.pinned).length,
      trash: trashedNotes.length,
    }),
    [notes, trashedNotes]
  );

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
        counts={counts}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <DashboardHeader
          search={search}
          onSearchChange={setSearch}
          user={user}
          onLogout={handleLogout}
          counts={counts}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <WelcomeBanner userName={user?.name} isTrashView={view === "trash"} />

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}

        <FilterBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

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